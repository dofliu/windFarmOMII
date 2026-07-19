$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$bundledPnpm = 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd'
$pnpm = if (Test-Path $bundledPnpm) { $bundledPnpm } else { (Get-Command pnpm -ErrorAction Stop).Source }

Push-Location $projectRoot
try {
    & $pnpm 'simulate:challenge'
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $pnpm sync:data
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $pnpm validate:data
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $pnpm validate:art
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $pnpm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $pnpm 'simulate:balance'
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $pnpm build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}

Write-Host 'OWM Web data, tests, Campaign/Challenge deterministic balance gates, typecheck, and production build completed.'
