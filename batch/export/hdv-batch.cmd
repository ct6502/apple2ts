@echo off

IF "%~1"=="" (
    echo Usage: hdv-batch DISKS_PATH
    exit /b 1
)

SETLOCAL

FOR /F "tokens=*" %%i IN ('git rev-parse --show-toplevel') DO SET "GIT_ROOT=%%~fi"

npm run cli -- export hdv-batch -- --input-dir "%~1" --output-dir "%TEMP%\exporthdv" --runner-preset electron-hdv-dev --runner-app-dir "%GIT_ROOT%\..\apple2ts-app" --concurrency 1 --retries 0 --capture-video false --runner-timeout-ms 60000 --headless true --disks "%GIT_ROOT%\batch\export\disks.json"

ENDLOCAL

EXIT /b 0
