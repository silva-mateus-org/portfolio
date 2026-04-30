$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  Portfolio Dev Server" -ForegroundColor Cyan
Write-Host "  ====================" -ForegroundColor Cyan
Write-Host ""

$frontendPort = 8000
$apiPort = 5000
$jobs = @()

function Stop-PortProcess($port) {
    $connections = netstat -ano | Select-String "TCP\s+\S+:$port\s+\S+\s+LISTENING\s+(\d+)"
    foreach ($match in $connections) {
        $pidValue = $match.Matches[0].Groups[1].Value
        if ($pidValue -and $pidValue -ne "0") {
            Write-Host "  Killing old process on port $port (PID $pidValue)..." -ForegroundColor DarkYellow
            taskkill /PID $pidValue /F 2>$null | Out-Null
        }
    }
}

Stop-PortProcess $apiPort
Stop-PortProcess $frontendPort

try {
    Write-Host "[API] Starting .NET API on port $apiPort..." -ForegroundColor Yellow
    $apiJob = Start-Job -ScriptBlock {
        param($dir, $port)
        Set-Location $dir
        & dotnet run --project ApiServer --urls "http://localhost:$port" 2>&1
    } -ArgumentList (Get-Location).Path, $apiPort
    $jobs += $apiJob

    # Start frontend HTTP server (Python)
    Write-Host "[WEB] Starting HTTP server on port $frontendPort..." -ForegroundColor Yellow
    $webJob = Start-Job -ScriptBlock {
        param($dir, $port)
        Set-Location $dir
        & python -m http.server $port 2>&1
    } -ArgumentList (Get-Location).Path, $frontendPort
    $jobs += $webJob

    Start-Sleep -Seconds 2

    Write-Host ""
    Write-Host "  Ready!" -ForegroundColor Green
    Write-Host "  Frontend: http://localhost:$frontendPort" -ForegroundColor Cyan
    Write-Host "  API:      http://localhost:$apiPort/api/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Press Ctrl+C to stop all servers" -ForegroundColor DarkGray
    Write-Host ""

    # Stream logs from both jobs
    while ($true) {
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) {
                $prefix = if ($job.Id -eq $apiJob.Id) { "[API]" } else { "[WEB]" }
                $color = if ($job.Id -eq $apiJob.Id) { "Magenta" } else { "DarkCyan" }
                foreach ($line in $output) {
                    Write-Host "$prefix $line" -ForegroundColor $color
                }
            }

            if ($job.State -eq "Failed") {
                Write-Host "[ERR] Job $($job.Name) failed:" -ForegroundColor Red
                Receive-Job -Job $job -ErrorAction SilentlyContinue | ForEach-Object {
                    Write-Host "      $_" -ForegroundColor Red
                }
            }
        }
        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    $jobs | ForEach-Object {
        Stop-Job -Job $_ -ErrorAction SilentlyContinue
        Remove-Job -Job $_ -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Done." -ForegroundColor Green
}
