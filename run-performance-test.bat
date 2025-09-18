@echo off
echo Testing JMeter Performance for Music Festival Login
echo ================================================

echo.
echo 1. Checking if server is running...
curl -s http://127.0.0.1:5000 > nul
if %errorlevel% neq 0 (
    echo ERROR: Server is not running on port 5000
    echo Please start the server with: node app.js
    pause
    exit /b 1
)
echo ✅ Server is responding

echo.
echo 2. Creating test user yohani@gmail.com...
curl -X POST -H "Content-Type: application/json" ^
     -d "{\"name\":\"Yohani\",\"email\":\"yohani@gmail.com\",\"password\":\"yohani123\",\"nic\":\"123456789V\",\"country\":\"Belgium\",\"gender\":\"Female\",\"language\":\"English\"}" ^
     http://127.0.0.1:5000/users
echo.
echo ✅ User creation attempted

echo.
echo 3. Testing login endpoint...
curl -X POST -H "Content-Type: application/json" ^
     -d "{\"email\":\"yohani@gmail.com\",\"password\":\"yohani123\"}" ^
     http://127.0.0.1:5000/users/login
echo.
echo ✅ Login test completed

echo.
echo 4. Running JMeter Performance Test...
echo Target: 100 virtual users, 10 second ramp-up
echo Endpoint: POST /users/login

if exist "jmeter" (
    jmeter\bin\jmeter -n -t music-festival-login-test.jmx -l results.jtl
) else if exist "apache-jmeter*" (
    for /d %%d in (apache-jmeter*) do %%d\bin\jmeter -n -t music-festival-login-test.jmx -l results.jtl
) else (
    echo JMeter not found. Please install JMeter and add to PATH
    echo Or run manually: jmeter -n -t music-festival-login-test.jmx -l results.jtl
)

echo.
echo 5. Performance Test Results:
if exist results.jtl (
    echo ✅ Test completed. Results saved to results.jtl
    echo.
    echo Calculating metrics...
    
    REM Count total requests
    for /f %%i in ('find /c "," results.jtl') do set total=%%i
    
    echo Total Requests: %total%
    echo.
    echo To view detailed results, use JMeter GUI or analyze results.jtl
) else (
    echo ❌ JMeter test failed or results.jtl not created
)

pause
