param([ValidateSet('all','desktop','mobile')][string]$Viewport='all', [string]$PlatformRoot=(Join-Path $PSScriptRoot '../../KairoLabs-Platform'))
$ErrorActionPreference='Stop'
$frontendRoot=Split-Path $PSScriptRoot -Parent
$runner=Join-Path $PlatformRoot 'scripts/run-integration.ps1'
if (!(Test-Path -LiteralPath $runner)) { throw 'Clonar KairoLabs-Platform como carpeta hermana, o indicar -PlatformRoot.' }
$old=$env:KAIROLABS_BDD_VIEWPORT
try {
 $env:KAIROLABS_BDD_VIEWPORT=$Viewport
 & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $runner -Suite bdd -FrontendRoot $frontendRoot
 exit $LASTEXITCODE
} finally { $env:KAIROLABS_BDD_VIEWPORT=$old }
