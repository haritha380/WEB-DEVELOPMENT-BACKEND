const scanner = require('sonarqube-scanner');

scanner(
  {
    serverUrl: 'http://localhost:9000',
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.projectKey': 'music-festival-backend',
      'sonar.sources': '.',
      'sonar.exclusions': '**/node_modules/**,**/tests/**',
      'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info'
    }
  },
  () => process.exit()
);
