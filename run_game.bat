@echo off
chcp 65001 >nul
echo 🚀 Запуск игры Танчики...
echo.

REM Проверяем наличие Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ошибка: Python не найден!
    echo Установите Python с https://python.org
    pause
    exit /b 1
)

REM Проверяем наличие index.html
if not exist "index.html" (
    echo ❌ Ошибка: Файл index.html не найден!
    pause
    exit /b 1
)

echo ✅ Python найден
echo ✅ index.html найден
echo.
echo 🌐 Запускаю сервер на http://localhost:8000
echo 💡 Для остановки нажмите Ctrl+C
echo.

REM Запускаем Python скрипт
python run_game.py

pause 