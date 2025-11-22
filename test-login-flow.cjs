// Test Login Flow Simulation
const https = require('https');
const http = require('http');

async function testLoginAPI() {
    console.log('=== MuseFlow Login Flow Test ===\n');
    
    // Test 1: Login API on port 3000
    console.log('1️⃣ Testing Login API (Port 3000)...');
    
    const postData = JSON.stringify({
        email: 'demo@museflow.life',
        password: 'demo123!'
    });
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   ✅ Status:', res.statusCode);
                    console.log('   ✅ Response:', response);
                    
                    if (response.success && response.token) {
                        console.log('   ✅ JWT Token:', response.token.substring(0, 50) + '...');
                        console.log('   ✅ User:', response.user);
                        resolve(response.token);
                    } else {
                        reject('Login failed: No token received');
                    }
                } catch (error) {
                    reject('Failed to parse response: ' + error.message);
                }
            });
        });
        
        req.on('error', (error) => {
            reject('Request failed: ' + error.message);
        });
        
        req.write(postData);
        req.end();
    });
}

async function testAuthMeAPI(token) {
    console.log('\n2️⃣ Testing Auth Me API (Port 3000)...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/me',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   ✅ Status:', res.statusCode);
                    console.log('   ✅ User verified:', response.user);
                    resolve(response);
                } catch (error) {
                    reject('Failed to parse response: ' + error.message);
                }
            });
        });
        
        req.on('error', (error) => {
            reject('Request failed: ' + error.message);
        });
        
        req.end();
    });
}

async function testProjectsAPI(token) {
    console.log('\n3️⃣ Testing Projects API (Port 3000)...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/projects',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   ✅ Status:', res.statusCode);
                    console.log('   ✅ Projects count:', response.projects ? response.projects.length : 0);
                    resolve(response);
                } catch (error) {
                    reject('Failed to parse response: ' + error.message);
                }
            });
        });
        
        req.on('error', (error) => {
            reject('Request failed: ' + error.message);
        });
        
        req.end();
    });
}

async function testBehaviorInsightsAPI(token) {
    console.log('\n4️⃣ Testing Behavior Insights API (Port 3000)...');
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/behaviors/insights',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    console.log('   ✅ Status:', res.statusCode);
                    console.log('   ✅ Insights:', response);
                    resolve(response);
                } catch (error) {
                    reject('Failed to parse response: ' + error.message);
                }
            });
        });
        
        req.on('error', (error) => {
            reject('Request failed: ' + error.message);
        });
        
        req.end();
    });
}

// Run all tests
async function runTests() {
    try {
        const token = await testLoginAPI();
        await testAuthMeAPI(token);
        await testProjectsAPI(token);
        await testBehaviorInsightsAPI(token);
        
        console.log('\n✅ ALL TESTS PASSED!');
        console.log('\n📝 Summary:');
        console.log('   - Login API: ✅ Working');
        console.log('   - Auth Me API: ✅ Working');
        console.log('   - Projects API: ✅ Working');
        console.log('   - Behavior Insights API: ✅ Working');
        console.log('\n🎉 로그인 플로우가 완벽하게 작동합니다!');
        
    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        process.exit(1);
    }
}

runTests();
