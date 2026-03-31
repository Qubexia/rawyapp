const http = require('http');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // 1. Login
  console.log('=== Testing Login ===');
  const loginBody = JSON.stringify({ email: 'admin@rawyapp.com', password: 'Admin123!' });
  const loginRes = await makeRequest({
    hostname: 'localhost', port: 3000,
    path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
  }, loginBody);
  console.log('Login status:', loginRes.status);
  console.log('Login response:', JSON.stringify(loginRes.body, null, 2));

  // Extract token
  const token = loginRes.body?.data?.accessToken || loginRes.body?.accessToken;
  if (!token) {
    console.log('No token found, cannot proceed');
    return;
  }
  console.log('Token:', token.substring(0, 20) + '...');

  // 2. Get stats
  console.log('\n=== Testing Stats ===');
  const statsRes = await makeRequest({
    hostname: 'localhost', port: 3000,
    path: '/api/v1/admin/stats', method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Stats status:', statsRes.status);
  console.log('Stats response:', JSON.stringify(statsRes.body, null, 2));

  // 3. Get analytics overview
  console.log('\n=== Testing Analytics Overview ===');
  const analyticsRes = await makeRequest({
    hostname: 'localhost', port: 3000,
    path: '/api/v1/admin/analytics/overview', method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Analytics status:', analyticsRes.status);
  console.log('Analytics response:', JSON.stringify(analyticsRes.body, null, 2));

  // 4. List users
  console.log('\n=== Testing Users List ===');
  const usersRes = await makeRequest({
    hostname: 'localhost', port: 3000,
    path: '/api/v1/admin/users?page=1&limit=5', method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  console.log('Users status:', usersRes.status);
  console.log('Users response:', JSON.stringify(usersRes.body, null, 2));
}

main().catch(console.error);
