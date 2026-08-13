param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[A-Za-z0-9._-]+$')]
  [string]$Version
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$targetRoot = Join-Path $projectRoot $Version

if (Test-Path -LiteralPath $targetRoot) {
  throw "Snapshot target already exists: $targetRoot"
}

$trackedFiles = git -C $projectRoot ls-files
if ($LASTEXITCODE -ne 0 -or -not $trackedFiles) {
  throw 'Unable to enumerate tracked files.'
}

foreach ($relativePath in $trackedFiles) {
  if ($relativePath -eq 'scripts/create-version-snapshot.ps1') {
    continue
  }

  $sourcePath = Join-Path $projectRoot $relativePath
  $destinationPath = Join-Path $targetRoot $relativePath
  $destinationDirectory = Split-Path -Parent $destinationPath

  New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
  Copy-Item -LiteralPath $sourcePath -Destination $destinationPath
}

Write-Output "Created byte-preserving snapshot at $targetRoot"
