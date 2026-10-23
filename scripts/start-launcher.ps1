param([switch]$Online)
$ErrorActionPreference = 'Stop'
$scriptFile = Join-Path $PSScriptRoot 'start-launcher.js'
$node = (Get-Command node -ErrorAction Stop).Source
$arguments = '"' + $scriptFile + '"'
if($Online) { $arguments += ' --online' }
Start-Process -FilePath $node -ArgumentList $arguments -WorkingDirectory (Split-Path $PSScriptRoot -Parent) -WindowStyle Hidden
