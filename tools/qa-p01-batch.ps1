param(
    [Parameter(Mandatory = $true)]
    [string]$BatchId,

    [switch]$UserVisualApproval
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $projectRoot 'assets\source-art\p01-manifest.json'
$batchPath = Join-Path $projectRoot "assets\source-art\batches\$BatchId.json"
$qaDirectory = Join-Path $projectRoot 'assets\source-art\qa'
$qaPath = Join-Path $qaDirectory "$BatchId-qa.json"

$manifest = Get-Content -Raw -Encoding UTF8 -LiteralPath $manifestPath | ConvertFrom-Json
$batch = Get-Content -Raw -Encoding UTF8 -LiteralPath $batchPath | ConvertFrom-Json
$results = @()

foreach ($item in $batch.items) {
    # 修正版可能與 v001 尺寸不同；QA 必須依目前 active asset 判定，否則會誤報比例。 (active dimensions).
    if ($item.activeWidth) {
        $activeAssetWidth = [Convert]::ToInt32($item.activeWidth)
    } else {
        $activeAssetWidth = [Convert]::ToInt32($item.generatedWidth)
    }
    if ($item.activeHeight) {
        $activeAssetHeight = [Convert]::ToInt32($item.activeHeight)
    } else {
        $activeAssetHeight = [Convert]::ToInt32($item.generatedHeight)
    }
    $ratio = [double]$activeAssetWidth / [double]$activeAssetHeight
    $aspectPass = [Math]::Abs($ratio - (2.0 / 3.0)) -le 0.005
    $resolutionPass = $activeAssetWidth -ge 4096 -and $activeAssetHeight -ge 6144
    $qaStatus = if ($UserVisualApproval -and $aspectPass) { 'Web Preview Approved' } elseif (-not $aspectPass) { 'Reframe Required' } else { 'Visual Review Required' }
    $qaNotes = if (-not $aspectPass) {
        'Generated composition is not 2:3; preserve the original and create a non-destructive 2:3 reframe.'
    }
    elseif (-not $resolutionPass) {
        'Visual direction and 2:3 aspect approved; production 4096x6144 upscale remains pending.'
    }
    else {
        'Visual direction, aspect and production resolution approved.'
    }

    $item | Add-Member -NotePropertyName aspectRatio -NotePropertyValue ([Math]::Round($ratio, 6)) -Force
    $item | Add-Member -NotePropertyName aspectStatus -NotePropertyValue $(if ($aspectPass) { 'Pass' } else { 'Fail' }) -Force
    $item | Add-Member -NotePropertyName activeVersion -NotePropertyValue $(if ($item.activeVersion) { $item.activeVersion } else { 'v001' }) -Force
    $item | Add-Member -NotePropertyName activeFile -NotePropertyValue $(if ($item.activeFile) { $item.activeFile } else { $item.generatedFile }) -Force
    $item | Add-Member -NotePropertyName activeWidth -NotePropertyValue $activeAssetWidth -Force
    $item | Add-Member -NotePropertyName activeHeight -NotePropertyValue $activeAssetHeight -Force
    $item | Add-Member -NotePropertyName activeAspectRatio -NotePropertyValue ([Math]::Round($ratio, 6)) -Force
    $item | Add-Member -NotePropertyName activeAspectStatus -NotePropertyValue $(if ($aspectPass) { 'Pass' } else { 'Fail' }) -Force
    $item | Add-Member -NotePropertyName productionResolutionStatus -NotePropertyValue $(if ($resolutionPass) { 'Pass' } else { 'Upscale Pending' }) -Force
    $item | Add-Member -NotePropertyName qaStatus -NotePropertyValue $qaStatus -Force
    $item | Add-Member -NotePropertyName qaNotes -NotePropertyValue $qaNotes -Force
    $item | Add-Member -NotePropertyName webStatus -NotePropertyValue 'Web Preview Connected' -Force

    $manifestItem = $manifest.items | Where-Object characterId -eq $item.characterId
    foreach ($propertyName in @('aspectRatio', 'aspectStatus', 'activeVersion', 'activeFile', 'activeWidth', 'activeHeight', 'activeAspectRatio', 'activeAspectStatus', 'productionResolutionStatus', 'qaStatus', 'qaNotes', 'webStatus')) {
        $manifestItem | Add-Member -NotePropertyName $propertyName -NotePropertyValue $item.$propertyName -Force
    }

    $results += [pscustomobject]@{
        characterId = $item.characterId
        outputFile = $item.activeFile
        dimensions = "$($activeAssetWidth)x$($activeAssetHeight)"
        aspectStatus = $item.aspectStatus
        productionResolutionStatus = $item.productionResolutionStatus
        qaStatus = $item.qaStatus
    }
}

$approvedCount = @($results | Where-Object qaStatus -eq 'Web Preview Approved').Count
$reframeCount = @($results | Where-Object qaStatus -eq 'Reframe Required').Count
$batchQaStatus = if ($reframeCount -gt 0) {
    'Partially Approved'
} elseif ($UserVisualApproval) {
    'Web Preview Approved'
} else {
    'Visual Review Required'
}
$batch | Add-Member -NotePropertyName qaStatus -NotePropertyValue $batchQaStatus -Force
$batch | Add-Member -NotePropertyName qaSummary -NotePropertyValue ([pscustomobject]@{
    visualDirection = $(if ($UserVisualApproval) { 'Approved by user' } else { 'Review Required' })
    webPreviewApproved = $approvedCount
    reframeRequired = $reframeCount
    upscalePending = @($results | Where-Object productionResolutionStatus -eq 'Upscale Pending').Count
}) -Force

$manifest.summary.approved = @($manifest.items | Where-Object qaStatus -eq 'Web Preview Approved').Count
$manifest.summary.rejected = @($manifest.items | Where-Object qaStatus -eq 'Rejected').Count
$manifest.summary | Add-Member -NotePropertyName reframeRequired -NotePropertyValue @($manifest.items | Where-Object {
    $currentAspectStatus = if ($_.activeAspectStatus) { $_.activeAspectStatus } else { $_.aspectStatus }
    $currentAspectStatus -eq 'Fail'
}).Count -Force
$manifest.summary | Add-Member -NotePropertyName upscalePending -NotePropertyValue @($manifest.items | Where-Object productionResolutionStatus -eq 'Upscale Pending').Count -Force
$manifest.summary | Add-Member -NotePropertyName correctionQaPending -NotePropertyValue @($manifest.items | Where-Object qaStatus -eq 'Correction QA Pending').Count -Force

New-Item -ItemType Directory -Force -Path $qaDirectory | Out-Null
$batch | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -LiteralPath $batchPath
$manifest | ConvertTo-Json -Depth 12 | Set-Content -Encoding UTF8 -LiteralPath $manifestPath
[pscustomobject]@{
    batchId = $BatchId
    checkedAt = (Get-Date).ToUniversalTime().ToString('o')
    userVisualApproval = [bool]$UserVisualApproval
    summary = $batch.qaSummary
    items = $results
} | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath $qaPath

$results | Format-Table -AutoSize
