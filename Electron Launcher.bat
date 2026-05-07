@echo off
echo Starting Electron app using PowerShell...

:: Get the directory of the batch file
set BATCH_FILE_DIR=%~dp0
echo Batch file directory: %BATCH_FILE_DIR%

:: Use PowerShell to navigate to the batch file's directory and run npm start
powershell -NoProfile -ExecutionPolicy Bypass -Command "cd '%BATCH_FILE_DIR%';npm start"

