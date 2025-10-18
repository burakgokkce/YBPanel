const axios = require('axios');

async function testServer() {
  console.log('🧪 Testing YB Digital Panel Server...\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5002/api/health');
    console.log('✅ Server is running:', healthResponse.data.message);
  } catch (error) {
    console.log('❌ Server health check failed:', error.message);
    console.log('   Make sure to run: npm run dev:server');
    return;
  }

  try {
    // Test admin login
    console.log('\n2. Testing admin login...');
    const adminResponse = await axios.post('http://localhost:5002/api/auth/admin-login', {
      password: 'yb150924'
    });
    console.log('✅ Admin login successful:', adminResponse.data.message);
  } catch (error) {
    console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
  }

  try {
    // Test member registration
    console.log('\n3. Testing member registration...');
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'test123',
      department: 'Test',
      position: 'Test Position'
    };

    const registerResponse = await axios.post('http://localhost:5002/api/auth/register', testUser);
    console.log('✅ Member registration successful:', registerResponse.data.message);

    // Test member login
    console.log('\n4. Testing member login...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/member-login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Member login successful:', loginResponse.data.message);

  } catch (error) {
    console.log('❌ Member registration/login failed:', error.response?.data?.message || error.message);
  }

  console.log('\n🎉 Server testing completed!');
}

testServer();
