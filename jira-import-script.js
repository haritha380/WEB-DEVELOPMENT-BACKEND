# 🔗 REAL JIRA INTEGRATION - NOT MANUAL COPY-PASTE

## 🎯 **YOU'RE RIGHT - LET'S DO REAL INTEGRATION!**

### **Option 1: Jira REST API Integration (Automated Import)**

<function_calls>
<invoke name="create_file">
<parameter name="content">// Automated Jira Import Script for Music Festival Project
const axios = require('axios');

// STEP 1: UPDATE YOUR JIRA DETAILS HERE
const JIRA_CONFIG = {
  baseURL: 'https://abefamily80.atlassian.net',  // Your Jira URL
  email: 'Abefamily80@gmail.com',                // Your email
  apiToken: 'ATATT3xFfGF0i7INF8mC5uISJp64G3B25-SL1jsu_9mJzVkODvCrKGgvIiQ5yAf9QSq8vfAMkMtSwagNSlfLpt2oNJHcytIUBVsLjXnlE0OXr8tWJ2sDQoeR9qXkC_V6svlCbAg3FMSDGnuFbGpEbqzG0INY8PF-5KZRaIxNTdtcp_oFEUhqHbk=5811EB8A',  // Your API token
  projectKey: 'MF'                               // Your project key
};

// Your bug data from defect-tracking-report.md
const bugData = [
  {
    summary: 'Authentication Token Validation Vulnerability',
    description: `JWT token validation middleware allows unauthorized access to protected endpoints due to improper token verification.

**Severity:** Critical
**Priority:** P1 (Highest)
**Status:** Resolved
**Reporter:** QA Team
**Assignee:** Backend Developer
**Date Reported:** August 25, 2025
**Date Resolved:** August 27, 2025

**Steps to Reproduce:**
1. User has valid credentials (yohani@gmail.com/yohani123)
2. Login to the application using valid credentials
3. Capture the JWT token from the login response
4. Modify the token signature by changing the last few characters
5. Make a request to protected endpoint /users/123 with modified token
6. Expected Result: 401 Unauthorized response
7. Actual Result: 200 OK response with user data

**Impact Assessment:**
- Security Risk: High - Unauthorized users can access protected endpoints
- Data Breach Risk: Critical - User personal information exposed
- Compliance Impact: OWASP A01:2021 violation
- Business Impact: Complete authentication bypass

**Root Cause Analysis:**
- Primary Cause: Missing JWT secret key validation in authentication middleware
- Secondary Cause: No token signature verification implemented
- Code Location: middleware/auth.js - authenticateToken function

**Fix Applied:**
{code:javascript}
// BEFORE (Vulnerable):
app.use('/users', userRoutes); // No authentication

// AFTER (Secure):
const { authenticateToken, authorizeUser } = require('./middleware/auth');
app.use('/users/:id', authenticateToken, authorizeUser, userRoutes);
{code}

**Prevention Strategy:**
- Code Reviews: Implemented mandatory security code reviews
- Automated Testing: Added JWT token validation tests
- Security Training: Regular OWASP training for development team
- Static Analysis: Integrated SonarQube security scanning`,
    priority: 'Highest',
    labels: ['security', 'authentication', 'critical']
  },
  {
    summary: 'Input Validation Missing',
    description: `User registration endpoint accepts invalid data without proper validation, leading to data integrity issues.

**Severity:** Major
**Priority:** P2 (High)
**Status:** Resolved
**Reporter:** QA Team
**Assignee:** Backend Developer
**Date Reported:** August 25, 2025
**Date Resolved:** August 26, 2025

**Steps to Reproduce:**
1. Server is running on localhost:5000
2. Send POST request to /users endpoint
3. Include invalid email format: "email": "invalid-email"
4. Include special characters in name: "name": "<script>alert('xss')</script>"
5. Include empty password: "password": ""
6. Expected Result: 400 Bad Request with validation errors
7. Actual Result: 201 Created with invalid data stored

**Impact Assessment:**
- Data Integrity: Compromised database with invalid records
- Security Risk: Potential for injection attacks
- User Experience: Poor error handling and feedback
- System Stability: Invalid data causing downstream errors

**Technical Details:**
- Location: Controllers/UserController.js
- Function: addUsers()
- Line Numbers: 20-45
- Root Cause: Missing express-validator middleware

**Resolution:**
{code:javascript}
// Added comprehensive validation
const { validateUser } = require('../middleware/validation');
router.post('/', validateUser, UserController.addUsers);
{code}`,
    priority: 'High',
    labels: ['validation', 'security', 'data-integrity']
  },
  {
    summary: 'Error Handling Inconsistency',
    description: `Inconsistent error response formats across different API endpoints causing client-side integration issues.

**Severity:** Minor
**Priority:** P3 (Medium)
**Status:** Resolved
**Reporter:** QA Team
**Assignee:** Backend Developer
**Date Reported:** August 26, 2025
**Date Resolved:** August 27, 2025

**Steps to Reproduce:**
1. Server running with various endpoints
2. Trigger error in /users/login with invalid credentials
3. Trigger error in /users/123 with non-existent user ID
4. Trigger server error by corrupting database connection
5. Expected Result: Consistent error format across all endpoints
6. Actual Result: Different error formats: some with message, others with error

**Impact Assessment:**
- API Consistency: Poor developer experience
- Client Integration: Difficult error handling on frontend
- Debugging Complexity: Inconsistent logging format
- Documentation: API documentation inconsistencies

**Resolution:**
Implemented standardized error handling middleware with consistent response format.`,
    priority: 'Medium',
    labels: ['api', 'error-handling', 'consistency']
  }
];

async function createJiraIssue(issueData) {
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
      },
      priority: {
        name: issueData.priority
      },
      labels: issueData.labels
    }
  };

  try {
    console.log(`🔄 Creating issue: ${issueData.summary}...`);
    
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
    
    console.log(`✅ Created issue: ${response.data.key} - ${issueData.summary}`);
    
    // Transition to Done status (since bugs are resolved)
    await transitionIssueToDone(response.data.key, auth);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create issue:`, error.response?.data || error.message);
    return null;
  }
}

async function transitionIssueToDone(issueKey, auth) {
  try {
    // Get available transitions
    const transitionsResponse = await axios.get(
      `${JIRA_CONFIG.baseURL}/rest/api/3/issue/${issueKey}/transitions`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }
    );
    
    // Find Done transition (usually ID 31 or name "Done")
    const doneTransition = transitionsResponse.data.transitions.find(
      t => t.name.toLowerCase().includes('done') || t.to.name.toLowerCase().includes('done')
    );
    
    if (doneTransition) {
      await axios.post(
        `${JIRA_CONFIG.baseURL}/rest/api/3/issue/${issueKey}/transitions`,
        {
          transition: {
            id: doneTransition.id
          }
        },
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`✅ Transitioned ${issueKey} to Done status`);
    }
  } catch (error) {
    console.log(`⚠️  Could not transition ${issueKey} to Done:`, error.response?.data?.errorMessages?.[0] || 'Transition not available');
  }
}

async function importAllBugs() {
  console.log('🚀 STARTING AUTOMATED JIRA IMPORT');
  console.log('================================');
  console.log(`Target Jira: ${JIRA_CONFIG.baseURL}`);
  console.log(`Project: ${JIRA_CONFIG.projectKey}`);
  console.log(`Issues to import: ${bugData.length}`);
  console.log('');
  
  // Validate configuration
  if (JIRA_CONFIG.baseURL.includes('YOUR-DOMAIN')) {
    console.error('❌ ERROR: Please update JIRA_CONFIG with your actual Jira details');
    console.log('');
    console.log('📋 SETUP INSTRUCTIONS:');
    console.log('1. Replace YOUR-DOMAIN with your Jira domain');
    console.log('2. Replace YOUR-EMAIL with your email');
    console.log('3. Get API token from: https://id.atlassian.com/manage-profile/security/api-tokens');
    console.log('4. Replace YOUR-API-TOKEN with the generated token');
    return;
  }
  
  const results = [];
  
  for (let i = 0; i < bugData.length; i++) {
    const issue = bugData[i];
    console.log(`📋 Processing bug ${i + 1}/${bugData.length}...`);
    
    const result = await createJiraIssue(issue);
    if (result) {
      results.push(result);
    }
    
    // Rate limiting - wait 2 seconds between requests
    if (i < bugData.length - 1) {
      console.log('⏱️  Waiting 2 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 IMPORT COMPLETED!');
  console.log('===================');
  console.log(`✅ Successfully imported: ${results.length}/${bugData.length} issues`);
  
  if (results.length > 0) {
    console.log('\n📋 Created Issues:');
    results.forEach(issue => {
      console.log(`   • ${issue.key}: ${issue.self}`);
    });
    
    console.log(`\n🔗 View your project: ${JIRA_CONFIG.baseURL}/browse/${JIRA_CONFIG.projectKey}`);
  }
}

// Check if axios is available
try {
  importAllBugs();
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('❌ Missing dependency: axios');
    console.log('📦 Run this command first: npm install axios');
    console.log('🔄 Then run: node jira-import-script.js');
  } else {
    console.error('❌ Error:', error.message);
  }
}
