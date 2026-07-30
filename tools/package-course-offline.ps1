$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$packageRoot = Join-Path $projectRoot 'offline-package'
$wwwRoot = Join-Path $packageRoot 'www'
$archivePath = Join-Path $projectRoot 'OWM_COURSE_OFFLINE_3.57.1.zip'

# 僅允許清理專案內兩個明確產物，避免路徑解析錯誤時誤刪其他資料。 Safety guard.
$expectedPackageRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot 'offline-package'))
$expectedArchivePath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot 'OWM_COURSE_OFFLINE_3.57.1.zip'))
if (-not ([System.StringComparer]::OrdinalIgnoreCase.Equals([System.IO.Path]::GetFullPath($packageRoot), $expectedPackageRoot))) {
  throw "Unexpected offline package path: $packageRoot"
}
if (-not ([System.StringComparer]::OrdinalIgnoreCase.Equals([System.IO.Path]::GetFullPath($archivePath), $expectedArchivePath))) {
  throw "Unexpected offline archive path: $archivePath"
}

pnpm build:offline
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (Test-Path -LiteralPath $packageRoot) {
  Remove-Item -LiteralPath $packageRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $wwwRoot -Force | Out-Null
Copy-Item -Path (Join-Path $projectRoot 'dist-offline\*') -Destination $wwwRoot -Recurse -Force
Copy-Item -Path (Join-Path $projectRoot 'offline\START_OFFLINE.bat') -Destination $packageRoot
Copy-Item -Path (Join-Path $projectRoot 'offline\START_OFFLINE.ps1') -Destination $packageRoot
Copy-Item -Path (Join-Path $projectRoot 'offline\README.txt') -Destination $packageRoot
Copy-Item -Path (Join-Path $projectRoot 'offline\serve_course.py') -Destination $packageRoot
if (Test-Path -LiteralPath $archivePath) {
  Remove-Item -LiteralPath $archivePath -Force
}
Compress-Archive -Path (Join-Path $packageRoot '*') -DestinationPath $archivePath -CompressionLevel Optimal
Write-Output "Offline package: $archivePath"
