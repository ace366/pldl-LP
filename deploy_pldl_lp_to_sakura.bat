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

set LOCAL_BASE_URL=http://localhost:8000
set PROD_BASE_URL=https://top-ace-picard.sakura.ne.jp/pldl-lp
set SMOKE_PATHS=/gakudo /register /login
REM ====================

for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set TS=%%i

set STAGING_DIR=%TEMP%\pldl_lp_staging_%TS%
set ARCHIVE_FILE=%TEMP%\pldl_lp_%TS%.tar.gz

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
echo [0/7] Pre-deploy local smoke test...
set LOCAL_OK=1
for %%P in (%SMOKE_PATHS%) do (
  for /f %%C in ('curl -s -o NUL -w "%%{http_code}" --max-time 4 "%LOCAL_BASE_URL%%%P" 2^>NUL') do (
    if "%%C"=="200" (
      echo   OK   %LOCAL_BASE_URL%%%P
    ) else (
      echo   WARN %LOCAL_BASE_URL%%%P returned %%C
      set LOCAL_OK=0
    )
  )
)
if "%LOCAL_OK%"=="0" (
  echo.
  echo Local server did not pass smoke test.
  echo If your local dev server is not running, this is expected — press Enter to continue.
  echo If it IS running, abort with Ctrl+C and fix locally before deploying.
  pause
)

echo.
echo [1/7] npm run build (Vite)...
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
echo [2/7] Copy project to staging...
if exist "%STAGING_DIR%" rmdir /s /q "%STAGING_DIR%"
mkdir "%STAGING_DIR%"

robocopy "%LOCAL_PROJECT%" "%STAGING_DIR%" /MIR /R:1 /W:1 ^
  /XD ".git" "node_modules" "vendor" "storage" ".idea" ".vscode" ".claude" "tests" "tools" ^
  /XF ".env" ".env.*" "*.sqlite" "*.sqlite-journal" "deploy_pldl_lp_to_sakura.bat" "remote_deploy_pldl_lp.sh"
set RC=%ERRORLEVEL%
if %RC% GEQ 8 (
  echo ERROR: robocopy failed with code %RC%
  pause
  exit /b 1
)

if exist "%STAGING_DIR%\bootstrap\cache" del /q "%STAGING_DIR%\bootstrap\cache\*" >nul 2>nul
if exist "%STAGING_DIR%\storage" rmdir /s /q "%STAGING_DIR%\storage"
if exist "%ARCHIVE_FILE%" del /q "%ARCHIVE_FILE%"

echo.
echo [3/7] Create tar.gz...
"%SystemRoot%\System32\tar.exe" -czf "%ARCHIVE_FILE%" -C "%STAGING_DIR%" .
if not exist "%ARCHIVE_FILE%" (
  echo ERROR: archive file not created
  pause
  exit /b 1
)

echo.
echo [4/7] Create remote tmp dir...
ssh -i "%SSH_KEY%" %SSH_USER%@%SSH_HOST% "mkdir -p %REMOTE_TMP_DIR%"
if errorlevel 1 (
  echo ERROR: failed to create remote tmp dir
  pause
  exit /b 1
)

echo.
echo [5/7] Upload remote deploy script and archive...
scp -i "%SSH_KEY%" "%LOCAL_PROJECT%\remote_deploy_pldl_lp.sh" %SSH_USER%@%SSH_HOST%:%REMOTE_SCRIPT%
if errorlevel 1 (
  echo ERROR: remote deploy script upload failed
  pause
  exit /b 1
)

scp -i "%SSH_KEY%" "%ARCHIVE_FILE%" %SSH_USER%@%SSH_HOST%:%REMOTE_TMP_DIR%/pldl_lp_%TS%.tar.gz
if errorlevel 1 (
  echo ERROR: archive upload failed
  pause
  exit /b 1
)

echo.
echo [6/7] Run remote deploy, migrate, rebuild caches...
ssh -i "%SSH_KEY%" %SSH_USER%@%SSH_HOST% "bash %REMOTE_SCRIPT% %REMOTE_APP_DIR% %REMOTE_TMP_DIR%/pldl_lp_%TS%.tar.gz %TS% && cd %REMOTE_APP_DIR% && php artisan migrate --force && php artisan optimize:clear && php artisan cache:clear && php artisan config:cache && php artisan route:cache && php artisan view:cache"
if errorlevel 1 (
  echo ERROR: remote deploy failed
  pause
  exit /b 1
)

echo.
echo [7/7] Post-deploy production smoke test...
set PROD_OK=1
for %%P in (%SMOKE_PATHS%) do (
  for /f %%C in ('curl -s -o NUL -w "%%{http_code}" --max-time 8 "%PROD_BASE_URL%%%P" 2^>NUL') do (
    if "%%C"=="200" (
      echo   OK   %PROD_BASE_URL%%%P
    ) else (
      echo   FAIL %PROD_BASE_URL%%%P returned %%C
      set PROD_OK=0
    )
  )
)
if "%PROD_OK%"=="0" (
  echo.
  echo *** WARNING: production smoke test FAILED. Roll back if site is broken: ***
  echo     ssh -i "%SSH_KEY%" %SSH_USER%@%SSH_HOST%
  echo     ls -t %REMOTE_APP_DIR%_backups/^| head -3
  echo     # restore latest backup_*.tar.gz over %REMOTE_APP_DIR%
  echo.
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
if exist "%ARCHIVE_FILE%" del /q "%ARCHIVE_FILE%"

pause
endlocal
