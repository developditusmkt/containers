# Teste da função Netlify
Write-Host "🧪 Testando função Netlify..." -ForegroundColor Green

# Health check
Write-Host "1️⃣ Testando health check..." -ForegroundColor Yellow
$healthResponse = Invoke-WebRequest -Uri "https://containers-alencar.netlify.app/.netlify/functions/api/health" -Method GET
Write-Host "Health Status: $($healthResponse.StatusCode)" -ForegroundColor Green
Write-Host "Health Response: $($healthResponse.Content)" -ForegroundColor Cyan

# Payment links test
Write-Host "`n2️⃣ Testando payment-links..." -ForegroundColor Yellow

$testData = @{
    name = "Teste Container"
    description = "Teste de pagamento"
    endDate = "2025-08-28"
    value = 1000.00
    billingType = "UNDEFINED"
    chargeType = "DETACHED"
    maxInstallmentCount = 12
    dueDateLimitDays = 7
    subscriptionCycle = $null
    callback = @{
        successUrl = "https://siteditus.com.br/sucesso"
        autoRedirect = $true
    }
} | ConvertTo-Json -Depth 3

Write-Host "Dados de teste:" -ForegroundColor Cyan
Write-Host $testData -ForegroundColor Gray

try {
    $paymentResponse = Invoke-WebRequest -Uri "https://containers-alencar.netlify.app/.netlify/functions/api/asaas/payment-links" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "Payment Status: $($paymentResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Payment Response: $($paymentResponse.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erro no payment-links:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Detalhes do erro:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
    }
}
