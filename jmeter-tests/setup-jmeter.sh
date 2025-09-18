#!/bin/bash

# Create a tools directory if it doesn't exist
mkdir -p ../tools

# Download JMeter
wget https://downloads.apache.org/jmeter/binaries/apache-jmeter-5.6.2.zip -O ../tools/apache-jmeter.zip

# Unzip JMeter
cd ../tools
unzip apache-jmeter.zip

# Rename the folder to just 'jmeter'
mv apache-jmeter-5.6.2 jmeter

# Add JMeter to PATH in the run script
echo 'export PATH="$PATH:$(pwd)/tools/jmeter/bin"' > ../jmeter-tests/set-jmeter-path.sh

echo "JMeter has been downloaded and extracted. Please download from: https://jmeter.apache.org/download_jmeter.cgi"
echo "After downloading, extract it and add the bin folder to your PATH"
