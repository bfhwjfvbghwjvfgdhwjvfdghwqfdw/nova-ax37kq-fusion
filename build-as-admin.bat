@echo off
echo Running electron-builder as Administrator to fix symbolic link permissions...
echo This is required due to Windows security restrictions.
echo.
echo Press any key to continue with administrator elevation...
pause

powershell -Command "Start-Process cmd -ArgumentList '/c cd /d \"%~dp0\" && npm run dist:win && pause' -Verb RunAs"