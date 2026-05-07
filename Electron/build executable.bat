@echo off
setlocal

echo Enter the game name (or press Enter to skip):
set /p gamename=

if "%gamename%"=="" (
    echo Skipping game name...
    set "gamename=YourGameName"
) else (
    echo Game name set to: %gamename%
)

echo Building Electron game...

rem Navigate to the project directory (adjust path as necessary)
cd /d "%~dp0.."
echo Current directory: %cd% >> "%~dp0build-log.txt"

rem Set the output directory to a build folder in the Electron directory
set "OUTPUT_DIR=%~dp0build"

rem Create the output directory if it doesn't exist
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

rem Build the Electron application and log output
echo Packaging the application...
rem Keep all node_modules (including devDependencies) and do not ignore any electron-* modules
npx electron-packager . "%gamename%" --out="%OUTPUT_DIR%" --overwrite --platform=win32 --arch=x64 --prune=false --no-platform-dir >> "%~dp0build-log.txt" 2>&1
echo electron-packager completed with exit code %errorlevel% >> "%~dp0build-log.txt"

rem Check if the build was successful
if exist "%OUTPUT_DIR%\%gamename%" (
    echo Build completed successfully! >> "%~dp0build-log.txt"
    echo Build completed successfully!
    echo Output directory: %OUTPUT_DIR%\%gamename%
) else (
    echo Build failed. Check the log for errors. >> "%~dp0build-log.txt"
    echo Build failed. Check the log for errors.
)

REM Start Electron with the correct entry point
node_modules/.bin/electron Electron/electronMain.cjs

pause 