#!/bin/bash

# Set JMeter path
JMETER_HOME="apache-jmeter-5.6.3"
JMETER_BIN="$JMETER_HOME/bin"

# Check if JMeter exists
if [ ! -d "$JMETER_HOME" ]; then
    echo "Extracting JMeter..."
    unzip apache-jmeter-5.6.3.zip
fi

# Make sure jmeter is executable
chmod +x $JMETER_BIN/jmeter.bat

# Run the test using Windows batch file
./$JMETER_BIN/jmeter.bat -n -t music-festival-login-test.jmx -l results.jtl -e -o report

echo "Load test complete. Check report directory for detailed results."
