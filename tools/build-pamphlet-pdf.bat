@echo off
setlocal

REM パンフレット HTML → PDF を再生成するヘルパー。
REM docs/pamphlet.html を更新したら本スクリプトを実行 → public/downloads/pldl-gakudo-pamphlet.pdf を上書き。
REM その後 git commit && 「サーバーにあげて」でデプロイ。

set CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe
set SRC=%~dp0..\docs\pamphlet.html
set OUT=%~dp0..\public\downloads\pldl-gakudo-pamphlet.pdf

if not exist "%CHROME%" (
  echo ERROR: Chrome not found at %CHROME%
  pause
  exit /b 1
)

if not exist "%~dp0..\public\downloads" mkdir "%~dp0..\public\downloads"

echo Generating PDF...
"%CHROME%" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="%OUT%" "file:///%SRC:\=/%"

if exist "%OUT%" (
  echo OK: %OUT%
  for %%I in ("%OUT%") do echo Size: %%~zI bytes
) else (
  echo FAIL: PDF was not generated
  exit /b 1
)

endlocal
