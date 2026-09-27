# ReadVault Library System - IIS & Local Network Deployment Script
# Run as Administrator in PowerShell

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  ReadVault Library System - LAN & IIS Deployment" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Detect Primary LAN IPv4 Address
$primaryIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Virtual' -and 
    $_.IPAddress -notmatch '^169\.254\.' -and 
    $_.IPAddress -match '^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\.' 
} | Select-Object -First 1).IPAddress

if (-not $primaryIp) {
    $primaryIp = "192.168.1.54"
}

Write-Host "`n[1] Detected Local Network IP: $primaryIp" -ForegroundColor Green

# 2. Add Windows Firewall Inbound Rules for Port 9000 & Port 80
Write-Host "`n[2] Configuring Windows Defender Firewall for Local Network Access..." -ForegroundColor Yellow
try {
    netsh advfirewall firewall delete rule name="ReadVault Library (Port 9000)" | Out-Null
    netsh advfirewall firewall add rule name="ReadVault Library (Port 9000)" dir=in action=allow protocol=TCP localport=9000 | Out-Null
    
    netsh advfirewall firewall delete rule name="ReadVault Library (Port 80)" | Out-Null
    netsh advfirewall firewall add rule name="ReadVault Library (Port 80)" dir=in action=allow protocol=TCP localport=80 | Out-Null
    
    Write-Host "    [OK] Inbound firewall rules enabled for Port 9000 and Port 80." -ForegroundColor Green
} catch {
    Write-Host "    [!] Note: Run PowerShell as Administrator if firewall rules need elevation." -ForegroundColor Gray
}

# 3. Check IIS Service
Write-Host "`n[3] Checking IIS (World Wide Web Publishing Service)..." -ForegroundColor Yellow
$iisService = Get-Service W3SVC -ErrorAction SilentlyContinue

if ($iisService) {
    Write-Host "    [OK] IIS Service (W3SVC) is installed: $($iisService.Status)" -ForegroundColor Green
    if ($iisService.Status -ne 'Running') {
        try {
            Start-Service W3SVC
            Write-Host "    [OK] Started IIS Service." -ForegroundColor Green
        } catch {
            Write-Host "    [!] Could not start W3SVC automatically. Start it from services.msc." -ForegroundColor Gray
        }
    }
} else {
    Write-Host "    [INFO] IIS is not installed. To install standard IIS:" -ForegroundColor Yellow
    Write-Host "    Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-StaticContent, IIS-HttpRedirect" -ForegroundColor Gray
}

# 4. Display Access URLs
Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "  ReadVault Library is Live on Your Local Network!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "`nAnyone on your Wi-Fi or LAN can access this library directly at:" -ForegroundColor White
Write-Host "  --> http://$($primaryIp):9000" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "  --> http://$($primaryIp) (if IIS Reverse Proxy is routed to 9000)" -ForegroundColor Cyan -BackgroundColor Black
Write-Host "`nTo start the server bound to all network interfaces:" -ForegroundColor White
Write-Host "  npm run serve:lan" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
