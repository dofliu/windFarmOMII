$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Start-Process 'http://127.0.0.1:4173'
python serve_course.py --port 4173 --directory www
