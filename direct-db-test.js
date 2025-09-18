const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/music-festival", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("✅ Connected to MongoDB");
    createUser();
}).catch(err => {
    console.log("❌ MongoDB connection error:", err);
    process.exit(1);
});

// Define the schema (same as in User.js)
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name: { type: String, required: false },
    nic: { type: String, required: false },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "N/A"], required: false },
    country: { type: String, enum: ["Belgium", "France", "Sweden"], required: false },
    language: { type: String, enum: ["English", "Spanish", "French", "German", "Dutch", "Japanese"], required: false },
    profilepicture: { type: String, default: "https://example.com/default-avatar.png" },
    isAdmin: { type: Boolean, default: false },
    boughtShows: []
});

const UserModel = mongoose.model("UserModel", userSchema);

async function createUser() {
    try {
        // First, check if user already exists
        const existingUser = await UserModel.findOne({ email: "yohani@gmail.com" });
        
        if (existingUser) {
            console.log("👤 User yohani@gmail.com already exists!");
            console.log("📧 Email:", existingUser.email);
            console.log("🔑 Password:", existingUser.password);
            testLogin();
            return;
        }

        // Create new user
        const newUser = new UserModel({
            name: "Yohani",
            email: "yohani@gmail.com",
            password: "yohani123",
            nic: "123456789V",
            country: "Belgium", 
            gender: "Female",
            language: "English"
        });

        const savedUser = await newUser.save();
        console.log("✅ User created successfully!");
        console.log("📧 Email:", savedUser.email);
        console.log("🔑 Password:", savedUser.password);
        console.log("👤 Name:", savedUser.name);
        
        // Test login after creation
        testLogin();
        
    } catch (error) {
        console.log("❌ Error creating user:", error.message);
        if (error.code === 11000) {
            console.log("📝 Note: User already exists (duplicate key error)");
            testLogin();
        }
    }
}

function testLogin() {
    console.log("\n🔐 Testing login endpoint...");
    
    const http = require('http');
    
    const loginData = JSON.stringify({
        email: "yohani@gmail.com",
        password: "yohani123"
    });
    
    const options = {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/users/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData)
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`📊 LOGIN TEST - Status: ${res.statusCode}`);
            console.log(`📄 Response: ${data}\n`);
            
            if (res.statusCode === 200) {
                console.log("🎯 SUCCESS! Your JMeter test should now work!");
                console.log("📈 Run: jmeter -n -t music-festival-login-test.jmx -l results.jtl");
            } else {
                console.log("❌ Login failed. Check your backend code.");
            }
            
            mongoose.connection.close();
            process.exit(0);
        });
    });
    
    req.on('error', (err) => {
        console.log('❌ Login request error:', err.message);
        mongoose.connection.close();
        process.exit(1);
    });
    
    req.write(loginData);
    req.end();
}
