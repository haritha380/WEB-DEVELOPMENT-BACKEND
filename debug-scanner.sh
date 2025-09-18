#!/bin/bash
cd "/d/QA project/WEB DEVELOPMENT BACKEND"
"/d/QA project/sonar-scanner-4.7.0.2747-windows/bin/sonar-scanner.bat" \
  -Dsonar.projectKey=music_festival_backend \
  -Dsonar.projectName="Music Festival Backend" \
  -Dsonar.sources=. \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.login=sqa_f1eec143850b16da3a6ab0fa3f5b53badab1d582 \
  -X
