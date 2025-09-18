# 🔍 How to Get Defect Density Data - Step-by-Step Guide

## 📋 **STEP-BY-STEP PROCESS**

### **STEP 1: Select Your Module**

**How to Choose:**
```bash
# List all source files in your project
find . -name "*.js" -not -path "./node_modules/*" | head -10
```

**Selection Criteria:**
- ✅ **Critical functionality** (authentication, payment, security)
- ✅ **High complexity** (many functions, logic branches)
- ✅ **User-facing features** (login, registration, API endpoints)

**Our Choice:** `middleware/access-control.js` (security-critical)

---

### **STEP 2: Count Lines of Code (LOC)**

**Method 1: Using Command Line**
```bash
# Navigate to your project directory
cd "d:\QA project\WEB DEVELOPMENT BACKEND"

# Count lines in specific file
wc -l middleware/access-control.js
```

**Output Example:**
```
75 middleware/access-control.js
```

**Method 2: Using VS Code**
1. Open the file in VS Code
2. Press `Ctrl + G` (Go to Line)
3. The dialog shows total lines at the bottom

**Method 3: Manual Verification**
```bash
# See the actual file with line numbers
cat -n middleware/access-control.js | tail -5
```

**Our Result:** 📏 **75 Lines of Code**

---

### **STEP 3: Identify Defects in the Module**

**Method 1: Bug Tracking System (Recommended)**

**A) Use Real Jira (Our Approach):**
```javascript
// We imported real bugs to: abefamily80.atlassian.net
// Bug KAN-1: Located in middleware/access-control.js
// Bug KAN-2: Located in Controllers/UserController.js  
// Bug KAN-3: Located in app.js
```

**B) Manual Bug Logging:**
```markdown
Bug ID: MF-001
Module: middleware/access-control.js
Severity: Critical
Description: JWT signature not verified
Lines: 15-25
```

**Method 2: Code Analysis Tools**

**A) SonarQube Scan:**
```bash
# Run SonarQube analysis
sonar-scanner -Dsonar.projectKey=my-project -Dsonar.sources=.
```

**B) ESLint for JavaScript:**
```bash
# Install and run ESLint
npm install eslint --save-dev
npx eslint middleware/access-control.js
```

**Method 3: Manual Code Review**
1. **Security Issues:** Missing validation, weak encryption
2. **Logic Errors:** Incorrect conditions, null pointer issues  
3. **Performance Issues:** Memory leaks, infinite loops
4. **Style Issues:** Naming conventions, code duplication

**Our Result:** 🐛 **1 Defect Found** (JWT vulnerability)

---

### **STEP 4: Apply the Formula**

**Standard Formula:**
```
Defect Density = (Number of Defects ÷ Lines of Code) × 1000
```

**Why × 1000?**
- Converts to "defects per KLOC" (Kilo Lines of Code)
- Industry standard measurement unit
- Makes small numbers more meaningful

**Our Calculation:**
```
Module: middleware/access-control.js
LOC: 75
Defects: 1

Defect Density = (1 ÷ 75) × 1000
Defect Density = 0.0133 × 1000
Defect Density = 13.33 defects per KLOC
```

---

## 🛠️ **PRACTICAL DEMONSTRATION**

Let me show you **exactly how we got our data**:

### **Getting LOC Count:**
```bash
# Command I used:
cd "d:\QA project\WEB DEVELOPMENT BACKEND"
wc -l middleware/access-control.js Controllers/UserController.js app.js
```

**Actual Output:**
```
   75 middleware/access-control.js
  247 Controllers/UserController.js  
  127 app.js
  449 total
```

### **Finding Defects:**

**1. Security Testing (OWASP Analysis):**
```javascript
// Found in middleware/access-control.js (lines 15-25)
// VULNERABILITY: JWT token accepted without signature verification
const authenticateToken = (req, res, next) => {
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    
    // BUG: This only decodes, doesn't verify signature!
    const decoded = jwt.decode(token);  // ❌ DEFECT
    req.user = decoded;
    next();
};
```

**2. Input Validation Testing:**
```javascript
// Found in Controllers/UserController.js
// VULNERABILITY: No input sanitization
exports.addUsers = async (req, res) => {
    const { username, password } = req.body;  // ❌ DEFECT: No validation
    // Direct database insertion without checks
};
```

**3. Error Handling Review:**
```javascript
// Found in app.js
// ISSUE: Generic error responses expose system info
app.use((err, req, res, next) => {
    console.log(err.stack);  // ❌ DEFECT: Logs sensitive data
    res.status(500).send('Something broke!');
});
```

### **Documenting in Jira:**

**Real Jira Import (What We Did):**
```javascript
// jira-automated-import.js
const bugData = {
    "fields": {
        "project": { "key": "KAN" },
        "summary": "JWT Authentication Bypass Vulnerability",
        "description": "middleware/access-control.js lines 15-25: JWT signature not verified",
        "issuetype": { "name": "Bug" },
        "priority": { "name": "Critical" }
    }
};
```

**Result:** Created KAN-1, KAN-2, KAN-3 in real Jira system

---

## 📊 **COMPLETE CALCULATION EXAMPLE**

### **Multiple Modules Analysis:**

| Step | Module | How to Get LOC | LOC Result | How to Find Defects | Defects Found | Calculation | Result |
|------|--------|----------------|------------|-------------------|---------------|-------------|---------|
| 1 | `access-control.js` | `wc -l middleware/access-control.js` | 75 | Security scan | 1 (JWT bypass) | (1÷75)×1000 | 13.33/KLOC |
| 2 | `UserController.js` | `wc -l Controllers/UserController.js` | 247 | Input validation test | 1 (No validation) | (1÷247)×1000 | 4.05/KLOC |
| 3 | `app.js` | `wc -l app.js` | 127 | Error handling review | 1 (Info disclosure) | (1÷127)×1000 | 7.87/KLOC |

### **Overall Project:**
```
Total LOC: 75 + 247 + 127 = 449
Total Defects: 1 + 1 + 1 = 3
Overall Defect Density = (3 ÷ 449) × 1000 = 6.68 defects/KLOC
```

---

## 🎯 **TOOLS & COMMANDS SUMMARY**

### **For Counting LOC:**
```bash
# Single file
wc -l filename.js

# Multiple files
wc -l *.js

# Exclude certain patterns
find . -name "*.js" -not -path "./node_modules/*" | xargs wc -l

# Total project LOC
find . -name "*.js" -not -path "./node_modules/*" -exec wc -l {} + | tail -1
```

### **For Finding Defects:**
```bash
# Static analysis
npm install eslint --save-dev
npx eslint src/

# Security scanning
npm audit

# Manual grep for common issues
grep -r "password" --include="*.js" .
grep -r "TODO\|FIXME\|BUG" --include="*.js" .
```

### **For Bug Tracking:**
```bash
# Create bug report template
echo "Bug ID: BUG-001
Module: filename.js  
Severity: Critical/Major/Minor
Description: Issue description
Lines: X-Y" > bug-template.md
```

---

## 🏆 **VALIDATION CHECKLIST**

**✅ LOC Count Verification:**
- [ ] Counted executable lines only (not comments/blank lines)
- [ ] Used consistent counting method
- [ ] Documented the tool/command used
- [ ] Verified count with alternative method

**✅ Defect Identification:**
- [ ] Used systematic approach (tools + manual review)
- [ ] Documented each defect with location
- [ ] Assigned severity levels
- [ ] Linked defects to specific code lines

**✅ Calculation Accuracy:**
- [ ] Applied correct formula
- [ ] Double-checked arithmetic
- [ ] Used proper units (defects/KLOC)
- [ ] Compared against industry benchmarks

**This step-by-step approach ensures your defect density calculation is accurate, verifiable, and academically sound!**
