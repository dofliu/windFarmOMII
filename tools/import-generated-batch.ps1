param(
    [Parameter(Mandatory = $true)]
    [string]$BatchId,

    [Parameter(Mandatory = $true)]
    [string]$SourceDirectory
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot 'assets\source-art\p01-manifest.json'
$batchPath = Join-Path $projectRoot "assets\source-art\batches\$BatchId.json"
$destinationDirectory = Join-Path $projectRoot 'assets\source-art\p01'

if (-not (Test-Path -LiteralPath $batchPath)) {
    throw "Batch file not found: $batchPath"
}

if (-not (Test-Path -LiteralPath $SourceDirectory)) {
    throw "Generated image directory not found: $SourceDirectory"
}

$batch = Get-Content -Raw -Encoding UTF8 -LiteralPath $batchPath | ConvertFrom-Json
$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
$batchItems = @($batch.items | Sort-Object productionSequence)
$sourceFiles = @(Get-ChildItem -LiteralPath $SourceDirectory -Filter '*.png')

# 批次匯入必須以 manifest 檔名一對一，不採用生成完成時間推測，
# 因為並行 image generation 的完成順序不等於角色順序。
if ($sourceFiles.Count -ne $batchItems.Count) {
    throw ('Expected {0} PNG files for {1}, found {2}.' -f $batchItems.Count, $BatchId, $sourceFiles.Count)
}
$sourceByName = @{}
foreach ($sourceFile in $sourceFiles) {
    $sourceByName[$sourceFile.Name] = $sourceFile
}
foreach ($item in $batchItems) {
    if (-not $sourceByName.ContainsKey($item.outputFile)) {
        throw "Expected source file named $($item.outputFile); refusing positional import."
    }
}

New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
Add-Type -AssemblyName System.Drawing

$imported = @()
foreach ($item in $batchItems) {
    $source = $sourceByName[$item.outputFile]
    $destination = Join-Path $destinationDirectory $item.outputFile

    if (Test-Path -LiteralPath $destination) {
        throw "Destination already exists; refusing to overwrite: $destination"
    }

    Copy-Item -LiteralPath $source.FullName -Destination $destination
    $image = [System.Drawing.Image]::FromFile($destination)
    try {
        $width = $image.Width
        $height = $image.Height
    }
    finally {
        $image.Dispose()
    }

    $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $destination).Hash.ToLowerInvariant()
    $metadata = [ordered]@{
        generatedFile = $item.relativePath
        generatedWidth = $width
        generatedHeight = $height
        generatedBytes = (Get-Item -LiteralPath $destination).Length
        sha256 = $hash
        importedAt = (Get-Date).ToUniversalTime().ToString('o')
        generationStatus = 'Generated'
        activeVersion = 'v001'
        activeFile = $item.relativePath
        activeWidth = $width
        activeHeight = $height
        qaStatus = 'Technical QA Pending'
        webStatus = 'Web preview import pending technical QA'
    }

    foreach ($property in $metadata.GetEnumerator()) {
        $item | Add-Member -NotePropertyName $property.Key -NotePropertyValue $property.Value -Force
        $manifestItem = $manifest.items | Where-Object characterId -eq $item.characterId
        $manifestItem | Add-Member -NotePropertyName $property.Key -NotePropertyValue $property.Value -Force
    }

    $imported += [pscustomobject]@{
        CharacterId = $item.characterId
        File = $item.outputFile
        Width = $width
        Height = $height
        Bytes = $metadata.generatedBytes
    }
}

$batch | Add-Member -NotePropertyName generationStatus -NotePropertyValue 'Generated' -Force
$batch | Add-Member -NotePropertyName qaStatus -NotePropertyValue 'Technical QA Pending' -Force
$batch | Add-Member -NotePropertyName importedAt -NotePropertyValue ((Get-Date).ToUniversalTime().ToString('o')) -Force

$manifest.summary.pending = @($manifest.items | Where-Object generationStatus -eq 'Pending').Count
$manifest.summary.generated = @($manifest.items | Where-Object generationStatus -eq 'Generated').Count
$manifest.summary.approved = @($manifest.items | Where-Object qaStatus -eq 'Web Preview Approved').Count
$manifest.summary.rejected = @($manifest.items | Where-Object qaStatus -eq 'Rejected').Count

$batch | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -LiteralPath $batchPath
$manifest | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -LiteralPath $manifestPath

$imported | Format-Table -AutoSize

