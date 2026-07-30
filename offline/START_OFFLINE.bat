@echo off
setlocal
cd /d "%~dp0"
start "" "http://127.0.0.1:4173"
python serve_course.py --port 4173 --directory www
endlocal
