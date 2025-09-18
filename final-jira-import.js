// Final Working Jira Import with ADF Format
const axios = require('axios');

const JIRA_CONFIG = {
  baseURL: 'https://abefamily80.atlassian.net',
  email: 'Abefamily80@gmail.com',
  apiToken: 'ATATT3xFfGF0i7INF8mC5uISJp64G3B25-SL1jsu_9mJzVkODvCrKGgvIiQ5yAf9QSq8vfAMkMtSwagNSlfLpt2oNJHcytIUBVsLjXnlE0OXr8tWJ2sDQoeR9qXkC_V6svlCbAg3FMSDGnuFbGpEbqzG0INY8PF-5KZRaIxNTdtcp_oFEUhqHbk=5811EB8A',
  projectKey: 'KAN'
};

// Create ADF format description
function createADFDescription(text) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: text
          }
        ]
      }
    ]
  };
}

const bugData = [
  {
    summary: 'MF-001: Authentication Token Validation Vulnerability (CRITICAL)',
    description: createADFDescription(`JWT token validation middleware allows unauthorized access to protected endpoints due to improper token verification.

SEVERITY: Critical
PRIORITY: P1 (Highest)
STATUS: Resolved
REPORTER: QA Team
ASSIGNEE: Backend Developer
DATE REPORTED: August 25, 2025
DATE RESOLVED: August 27, 2025

STEPS TO REPRODUCE:
1. User has valid credentials (yohani@gmail.com/yohani123)
2. Login to the application using valid credentials
3. Capture the JWT token from the login response
4. Modify the token signature by changing the last few characters
5. Make a request to protected endpoint /users/123 with modified token
6. Expected Result: 401 Unauthorized response
7. Actual Result: 200 OK response with user data

IMPACT ASSESSMENT:
- Security Risk: High - Unauthorized users can access protected endpoints
- Data Breach Risk: Critical - User personal information exposed
- Compliance Impact: OWASP A01:2021 violation
- Business Impact: Complete authentication bypass

ROOT CAUSE ANALYSIS:
- Primary Cause: Missing JWT secret key validation in authentication middleware
- Secondary Cause: No token signature verification implemented
- Code Location: middleware/auth.js - authenticateToken function

PREVENTION STRATEGY:
- Code Reviews: Implemented mandatory security code reviews
- Automated Testing: Added JWT token validation tests
- Security Training: Regular OWASP training for development team
- Static Analysis: Integrated SonarQube security scanning`)
  },
  {
    summary: 'MF-002: Input Validation Missing (MAJOR)',
    description: createADFDescription(`User registration endpoint accepts invalid data without proper validation, leading to data integrity issues.

SEVERITY: Major
PRIORITY: P2 (High)
STATUS: Resolved
REPORTER: QA Team
ASSIGNEE: Backend Developer
DATE REPORTED: August 25, 2025
DATE RESOLVED: August 26, 2025

STEPS TO REPRODUCE:
1. Server is running on localhost:5000
2. Send POST request to /users endpoint
3. Include invalid email format: "email": "invalid-email"
4. Include special characters in name: "name": "<script>alert('xss')</script>"
5. Include empty password: "password": ""
6. Expected Result: 400 Bad Request with validation errors
7. Actual Result: 201 Created with invalid data stored

IMPACT ASSESSMENT:
- Data Integrity: Compromised database with invalid records
- Security Risk: Potential for injection attacks
- User Experience: Poor error handling and feedback
- System Stability: Invalid data causing downstream errors

TECHNICAL DETAILS:
- Location: Controllers/UserController.js
- Function: addUsers()
- Line Numbers: 20-45
- Root Cause: Missing express-validator middleware`)
  },
  {
    summary: 'MF-003: Error Handling Inconsistency (MINOR)',
    description: createADFDescription(`Inconsistent error response formats across different API endpoints causing client-side integration issues.

SEVERITY: Minor
PRIORITY: P3 (Medium)
STATUS: Resolved
REPORTER: QA Team
ASSIGNEE: Backend Developer
DATE REPORTED: August 26, 2025
DATE RESOLVED: August 27, 2025

STEPS TO REPRODUCE:
1. Server running with various endpoints
2. Trigger error in /users/login with invalid credentials
3. Trigger error in /users/123 with non-existent user ID
4. Trigger server error by corrupting database connection
5. Expected Result: Consistent error format across all endpoints
6. Actual Result: Different error formats: some with message, others with error

IMPACT ASSESSMENT:
- API Consistency: Poor developer experience
- Client Integration: Difficult error handling on frontend
- Debugging Complexity: Inconsistent logging format
- Documentation: API documentation inconsistencies`)
  }
];

async function createWorkingJiraIssue(issueData) {
  const auth = Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64');
  
  const issuePayload = {
    fields: {
      project: {
        key: JIRA_CONFIG.projectKey
      },
      summary: issueData.summary,
      description: issueData.description,
      issuetype: {
        name: 'Bug'
      }
    }
  };

  try {
    console.log(`🔄 Creating: ${issueData.summary.substring(0, 50)}...`);
    
    const response = await axios.post(
      `${JIRA_CONFIG.baseURL}/rest/api/3/issue`,
      issuePayload,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`✅ SUCCESS! Created ${response.data.key}`);
    console.log(`   🔗 ${JIRA_CONFIG.baseURL}/browse/${response.data.key}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ FAILED:`, error.response?.data || error.message);
    return null;
  }
}

async function finalImport() {
  console.log('🎯 FINAL JIRA IMPORT ATTEMPT');
  console.log('============================');
  console.log(`🔗 Jira: ${JIRA_CONFIG.baseURL}`);
  console.log(`📋 Project: ${JIRA_CONFIG.projectKey} (Music-Festival-Project)`);
  console.log(`🐛 Bugs: ${bugData.length} issues to create`);
  console.log('');
  
  const results = [];
  
  for (let i = 0; i < bugData.length; i++) {
    const issue = bugData[i];
    console.log(`\n🐛 Bug ${i + 1}/${bugData.length}:`);
    
    const result = await createWorkingJiraIssue(issue);
    if (result) {
      results.push(result);
    }
    
    if (i < bugData.length - 1) {
      console.log('⏱️  Waiting 3 seconds...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n🎉 FINAL RESULTS');
  console.log('================');
  console.log(`✅ Successfully created: ${results.length}/${bugData.length} issues`);
  
  if (results.length > 0) {
    console.log('\n📋 YOUR BUGS IN JIRA:');
    results.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.key}: ${JIRA_CONFIG.baseURL}/browse/${issue.key}`);
    });
    
    console.log(`\n🎯 Project: ${JIRA_CONFIG.baseURL}/projects/${JIRA_CONFIG.projectKey}`);
    console.log(`\n🎊 CONGRATULATIONS! Your defect tracking is now in real Jira!`);
    console.log(`\n📝 For your viva demonstration:`);
    console.log(`   • Login to: ${JIRA_CONFIG.baseURL}`);
    console.log(`   • Navigate to your Music-Festival-Project`);
    console.log(`   • Show the 3 bugs with all details`);
    console.log(`   • Demonstrate real professional bug tracking!`);
  } else {
    console.log('\n❌ No issues were created. Check your Jira configuration.');
  }
}

// Execute the final import
finalImport();
