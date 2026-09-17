@echo off
TITLE NanAuracle v8.0 - ZnO-GNP Heterojunction 3D Digital Twin Runner
COLOR 0B
echo ==============================================================================
echo   NanAuracle v8.0: ZnO-GNP Heterojunction Atomistic Digital Twin
echo   Intel ISEF 2026 Research Suite | Tuguegarao City Science High School
echo ==============================================================================
echo.

set DIR=%~dp0
cd /d "%DIR%"

echo [1/3] Detecting execution environment...

:: Check for Python
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [2/3] Python detected! Starting local high-performance WebGL server on port 3000...
    start "" http://localhost:3000
    python -m http.server 3000
    goto end
)

:: Check for Node.js / npx
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [2/3] Node.js / npx detected! Starting portable web server on port 3000...
    start "" http://localhost:3000
    npx serve -l 3000 .
    goto end
)

:: Direct fallback: Open standalone HTML suite
echo [2/3] Standalone mode: Opening self-contained 3D Digital Twin HTML directly in default browser...
if exist "%DIR%NanAuracle_Complete_Suite.html" (
    start "" "%DIR%NanAuracle_Complete_Suite.html"
) else if exist "%DIR%index.html" (
    start "" "%DIR%index.html"
) else (
    echo [!] Could not locate NanAuracle_Complete_Suite.html. Please ensure it is in the same directory.
    pause
)

:end
echo.
echo [3/3] NanAuracle is active. Press any key to terminate this window.
pause >nul
