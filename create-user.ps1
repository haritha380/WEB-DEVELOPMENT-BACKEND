$url = "http://127.0.0.1:5000/users"
$body = @{
    name = "Yohani"
    email = "yohani@gmail.com"
    password = "yohani123"
    nic = "123456789V"
    country = "Belgium"
    gender = "Female"
    language = "English"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "Creating user yohani@gmail.com..."
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -Headers $headers
    Write-Host "✅ User created successfully!"
    Write-Host "Response: $($response | ConvertTo-Json)"
    
    # Test login
    Write-Host "`nTesting login..."
    $loginUrl = "http://127.0.0.1:5000/users/login"
    $loginBody = @{
        email = "yohani@gmail.com"
        password = "yohani123"
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri $loginUrl -Method Post -Body $loginBody -Headers $headers
    Write-Host "✅ Login successful!"
    Write-Host "Login Response: $($loginResponse | ConvertTo-Json)"
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}
