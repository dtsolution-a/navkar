# First, delete the files that were incorrectly created as files instead of directories
Write-Host "Cleaning up incorrectly created files..."
Remove-Item -Path "t:\Shah\shah-website\public\images\products\pneumatics" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "t:\Shah\shah-website\public\images\products\distribution-control" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "t:\Shah\shah-website\public\images\products\instrumentation" -Force -ErrorAction SilentlyContinue

# Create directories properly
Write-Host "Creating directories..."
New-Item -ItemType Directory -Force -Path "t:\Shah\shah-website\public\images\products\pneumatics" | Out-Null
New-Item -ItemType Directory -Force -Path "t:\Shah\shah-website\public\images\products\distribution-control" | Out-Null
New-Item -ItemType Directory -Force -Path "t:\Shah\shah-website\public\images\products\instrumentation" | Out-Null

# Source directories
$sources = @(
    ,@("T:\Shah\SHAH-20260614T203522Z-3-001\SHAH\WWW\PNEUMATICS", "t:\Shah\shah-website\public\images\products\pneumatics")
    ,@("T:\Shah\SHAH-20260614T203522Z-3-002\SHAH\WWW\PNEUMATICS", "t:\Shah\shah-website\public\images\products\pneumatics")
    ,@("T:\Shah\SHAH-20260614T203522Z-3-003\SHAH\WWW\PNEUMATICS", "t:\Shah\shah-website\public\images\products\pneumatics")
    ,@("T:\Shah\SHAH-20260614T203522Z-3-001\SHAH\WWW\DISTRIBUTION & CONTROL PRODUCTS", "t:\Shah\shah-website\public\images\products\distribution-control")
    ,@("T:\Shah\SHAH-20260614T203522Z-3-002\SHAH\WWW\DISTRIBUTION & CONTROL PRODUCTS", "t:\Shah\shah-website\public\images\products\distribution-control")
    ,@("T:\Shah\SHAH-20260614T203522Z-3-003\SHAH\WWW\DISTRIBUTION & CONTROL PRODUCTS", "t:\Shah\shah-website\public\images\products\distribution-control")
    ,@("T:\Shah\SHAH-20260614T203522Z-3-003\SHAH\WWW\INSTRUMENTATION COMPONENTS", "t:\Shah\shah-website\public\images\products\instrumentation")
)

# Copy files
$totalFiles = 0
foreach ($pair in $sources) {
    $src = $pair[0]
    $dst = $pair[1]
    if (Test-Path -Path $src) {
        $files = Get-ChildItem -Path $src -File
        foreach ($file in $files) {
            Copy-Item -Path $file.FullName -Destination (Join-Path $dst $file.Name) -Force
            $totalFiles++
            Write-Host "  Copied: $($file.Name) -> $dst"
        }
    } else {
        Write-Host "  Source not found: $src"
    }
}

Write-Host ""
Write-Host "Total files copied: $totalFiles"
Write-Host ""

# Verify
$pneumatics = Get-ChildItem -Path "t:\Shah\shah-website\public\images\products\pneumatics" -File
$distCtrl = Get-ChildItem -Path "t:\Shah\shah-website\public\images\products\distribution-control" -File
$inst = Get-ChildItem -Path "t:\Shah\shah-website\public\images\products\instrumentation" -File

Write-Host "Verification:"
Write-Host "  Pneumatics ($($pneumatics.Count) files):"
$pneumatics | ForEach-Object { Write-Host "    - $($_.Name)" }
Write-Host "  Distribution & Control ($($distCtrl.Count) files):"
$distCtrl | ForEach-Object { Write-Host "    - $($_.Name)" }
Write-Host "  Instrumentation ($($inst.Count) files):"
$inst | ForEach-Object { Write-Host "    - $($_.Name)" }