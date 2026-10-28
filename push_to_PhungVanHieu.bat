@echo off
chcp 65001 >nul
title Push code len nhanh PhungVanHieu
echo ========================================================
echo     DANG DAY CODE LEN NHANH PhungVanHieu (GITHUB)...
echo ========================================================
echo.
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" push origin PhungVanHieu -f
echo.
echo ========================================================
echo     DA HOAN TAT TIEN TRINH PUSH CODE!
echo ========================================================
pause
