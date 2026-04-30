@echo off
setlocal

REM ===== SETTINGS =====
set LOCAL_PROJECT=C:\work\PLDL-LP
set SSH_KEY=C:\Users\ace36\.ssh\sakura_ed25519

set SSH_USER=top-ace-picard
set SSH_HOST=www2916.sakura.ne.jp

set REMOTE_APP_DIR=/home/top-ace-picard/www/pldl-lp
set REMOTE_TMP_DIR=/home/top-ace-picard/www/tmp/pldl_lp_deploy
set REMOTE_SCRIPT=/home/top-ace-picard/www/tmp/pldl_lp_deploy/remote_deploy_pldl_lp.sh
REM ====================

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set TS=%%i

set STAGING_DIR=%TEMP%\pldl_lp_staging_%TS%
set ZIP_FILE=%TEMP%\pldl_lp_%TS%.zip

echo ========================================
echo PLDL-LP deploy start
echo Timestamp: %TS%
echo Target:    %REMOTE_APP_DIR%
echo ========================================

if not exist "%LOCAL_PROJECT%\artisan" (
  echo ERROR: artisan not found in %LOCAL_PROJECT%
  pause
  exit /b 1
)

if not exist "%SSH_KEY%" (
  echo ERROR: ssh key not found
  echo %SSH_KEY%
  pause
  exit /b 1
)

where ssh >nul 2>nul
if errorlevel 1 (
  echo ERROR: ssh command not found
  pause
  exit /b 1
)

where scp >nul 2>nul
if errorlevel 1 (
  echo ERROR: scp command not found
  pause
  exit /b 1
)

echo.
echo [1/6] npm run build (Vite)...
pushd "%LOCAL_PROJECT%"
call npm run build
if errorlevel 1 (
  echo ERROR: npm run build failed
  popd
  pause
  exit /b 1
)
popd

if not exist "%LOCAL_PROJECT%\public\build" (
  echo ERROR: public\build was not created
  pause
  exit /b 1
)

echo.
echo [2/6] Copy project to staging...
if exist "%STAGING_DIR%" rmdir /s /q "%STAGING_DIR%"
mkdir "%STAGING_DIR%"

robocopy "%LOCAL_PROJECT%" "%STAGING_DIR%" /MIR /R:1 /W:1 ^
  /XD ".git" "node_modules" "vendor" "storage" ".idea" ".vscode" ".claude" "tests" ^
  /XF ".env" ".env.*" "*.sqlite" "*.sqlite-journal" "deploy_pldl_lp_to_sakura.bat" "remote_deploy_pldl_lp.sh"
set RC=%ERRORLEVEL%
if %RC% GEQ 8 (
  echo ERROR: robocopy failed with code %RC%
  pause
  exit /b 1
)

if exist "%STAGING_DIR%\bootstrap\cache" del /q "%STAGING_DIR%\bootstrap\cache\*" >nul 2>nul
if exist "%STAGING_DIR%\storage" rmdir /s /q "%STAGING_DIR%\storage"
if exist "%ZIP_FILE%" del /q "%ZIP_FILE%"

echo.
echo [3/6] Create zip...
powershell -NoProfile -Command "Compress-Archive -Path '%STAGING_DIR%\*' -DestinationPath '%ZIP_FILE%' -Force"
if not exist "%ZIP_FILE%" (
  echo ERROR: zip file not created
  pause
  exit /b 1
)

echo.
echo [4/6] Create remote tmp dir...
ssh -i "%SSH_KEY%" %SSH_USER%@%SSH_HOST% "mkdir -p %REMOTE_TMP_DIR%"
if errorlevel 1 (
  echo ERROR: failed to create remote tmp dir
  pause
  exit /b 1
)

echo.
echo [5/6] Upload remote deploy script and zip...
scp -i "%SSH_KEY%" "%LOCAL_PROJECT%\remote_deploy_pldl_lp.sh" %SSH_USER%@%SSH_HOST%:%REMOTE_SCRIPT%
if errorlevel 1 (
  echo ERROR: remote deploy script upload failed
  pause
  exit /b 1
)

scp -i "%SSH_KEY%" "%ZIP_FILE%" %SSH_USER%@%SSH_HOST%:%REMOTE_TMP_DIR%/pldl_lp_%TS%.zip
if errorlevel 1 (
  echo ERROR: zip upload failed
  pause
  exit /b 1
)

echo.
echo [6/6] Run remote deploy...
ssh -i "%SSH_KEY%" %SSH_USER%@%SSH_HOST% "bash %REMOTE_SCRIPT% %REMOTE_APP_DIR% %REMOTE_TMP_DIR%/pldl_lp_%TS%.zip %TS%"
if errorlevel 1 (
  echo ERROR: remote deploy failed
  pause
  exit /b 1
)

echo.
echo ========================================
echo PLDL-LP deploy completed
echo ========================================
echo.
echo Manual steps on server (first time only):
echo   ssh -i "%SSH_KEY%" %SSH_USER%@%SSH_HOST%
echo   cd %REMOTE_APP_DIR%
echo   composer install --no-dev --optimize-autoloader
echo   nano .env                       # paste production env
echo   php artisan key:generate
echo   touch database/database.sqlite
echo   chmod 664 database/database.sqlite
echo   php artisan migrate --force
echo   php artisan optimize:clear
echo   php artisan config:cache
echo.
echo Every deploy after that:
echo   ssh -i "%SSH_KEY%" %SSH_USER%@%SSH_HOST% "cd %REMOTE_APP_DIR% ^&^& php artisan migrate --force ^&^& php artisan optimize:clear ^&^& php artisan config:cache"
echo.

if exist "%STAGING_DIR%" rmdir /s /q "%STAGING_DIR%"
if exist "%ZIP_FILE%" del /q "%ZIP_FILE%"

pause
endlocal
