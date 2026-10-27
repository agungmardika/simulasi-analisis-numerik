@echo off
title NumSim - Simulasi Analisis Numerik
echo ========================================================
echo   Menjalankan Server Web Analisis Numerik (NumSim)
echo ========================================================
echo.

set "PY_PATH=%LOCALAPPDATA%\Python\pythoncore-3.14-64\python.exe"
set "VENV_PATH=C:\BelajarPython\venv\Scripts\python.exe"

if exist "%PY_PATH%" (
    echo Menggunakan Python: %PY_PATH%
    "%PY_PATH%" app.py
) else if exist "%VENV_PATH%" (
    echo Menggunakan Python Venv: %VENV_PATH%
    "%VENV_PATH%" app.py
) else (
    echo Menggunakan perintah python bawaan PATH...
    python app.py
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Terjadi kesalahan saat menjalankan server.
    pause
)

