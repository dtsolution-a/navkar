$src1 = "T:\Shah\SHAH-20260614T203522Z-3-001\SHAH\WWW\PNEUMATICS"
$src2 = "T:\Shah\SHAH-20260614T203522Z-3-002\SHAH\WWW\PNEUMATICS"
$src3 = "T:\Shah\SHAH-20260614T203522Z-3-003\SHAH\WWW\PNEUMATICS"
$src4 = "T:\Shah\SHAH-20260614T203522Z-3-001\SHAH\WWW\DISTRIBUTION & CONTROL PRODUCTS"
$src5 = "T:\Shah\SHAH-20260614T203522Z-3-002\SHAH\WWW\DISTRIBUTION & CONTROL PRODUCTS"
$src6 = "T:\Shah\SHAH-20260614T203522Z-3-003\SHAH\WWW\DISTRIBUTION & CONTROL PRODUCTS"
$src7 = "T:\Shah\SHAH-20260614T203522Z-3-003\SHAH\WWW\INSTRUMENTATION COMPONENTS"

$dst1 = "t:\Shah\shah-website\public\images\products\pneumatics"
$dst2 = "t:\Shah\shah-website\public\images\products\distribution-control"
$dst3 = "t:\Shah\shah-website\public\images\products\instrumentation"

# Create destination directories if they don't exist
New-Item -ItemType Directory -Force -Path $dst1 | Out-Null
New-Item -ItemType Directory -Force -Path $dst2 | Out-Null
New-Item -ItemType Directory -Force -Path $dst3 | Out-Null

# Copy pneumatics
Write-Host "Copying Pneumatics..."
Get-ChildItem -Path $src1 -File | Copy-Item -Destination $dst1 -Force
Get-ChildItem -Path $src2 -File | Copy-Item -Destination $dst1 -Force
Get-ChildItem -Path $src3 -File | Copy-Item -Destination $dst1 -Force

# Copy distribution & control
Write-Host "Copying Distribution & Control..."
Get-ChildItem -Path $src4 -File | Copy-Item -Destination $dst2 -Force
Get-ChildItem -Path $src5 -File | Copy-Item -Destination $dst2 -Force
Get-ChildItem -Path $src6 -File | Copy-Item -Destination $dst2 -Force

# Copy instrumentation
Write-Host "Copying Instrumentation..."
Get-ChildItem -Path $src7 -File | Copy-Item -Destination $dst3 -Force

Write-Host "Done! Files copied:"
Write-Host "Pneumatics: " (Get-ChildItem -Path $dst1 -File).Count
Write-Host "Distribution & Control: " (Get-ChildItem -Path $dst2 -File).Count
Write-Host "Instrumentation: " (Get-ChildItem -Path $dst3 -File).Count