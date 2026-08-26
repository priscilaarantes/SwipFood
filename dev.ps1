Write-Host "Iniciando API na porta 3000..." -ForegroundColor Cyan
$api = Start-Process -NoNewWindow -PassThru -FilePath "node" -ArgumentList "--watch","src/server.js" -WorkingDirectory "$PSScriptRoot\api"

Write-Host "Iniciando Frontend..." -ForegroundColor Green
$frontend = Start-Process -NoNewWindow -PassThru -FilePath "npm" -ArgumentList "run","dev" -WorkingDirectory "$PSScriptRoot\frontend"

Write-Host ""
Write-Host "Servidores rodando!" -ForegroundColor Yellow
Write-Host "  API:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Ctrl+C para parar ambos." -ForegroundColor DarkGray

try {
    $api.WaitForExit()
} finally {
    Stop-Process -Id $api.Id -ErrorAction SilentlyContinue
    Stop-Process -Id $frontend.Id -ErrorAction SilentlyContinue
}
