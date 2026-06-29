const http = require('http');

function makeRequest(method, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 80,
      path: path,
      method: method,
      headers: {
        'Host': 'localhost',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: res.headers,
          data: data.substring(0, 500)
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('\n========== CORS & API Tests ==========\n');

  // Test 1: Preflight OPTIONS request
  console.log('📋 Test 1: CORS Preflight Request');
  try {
    const result = await makeRequest('OPTIONS', '/api/v1/categories', {
      'Origin': 'http://localhost',
      'Access-Control-Request-Method': 'GET'
    });
    console.log(`✓ Status: ${result.status}`);
    console.log(`✓ CORS Origin Header: ${result.headers['access-control-allow-origin'] || 'NOT SET'}`);
    console.log(`✓ CORS Methods Header: ${result.headers['access-control-allow-methods'] || 'NOT SET'}`);
  } catch (e) {
    console.error(`✗ Error: ${e.message}`);
  }

  // Test 2: GET categories
  console.log('\n📋 Test 2: GET /api/v1/categories');
  try {
    const result = await makeRequest('GET', '/api/v1/categories', {
      'Origin': 'http://localhost'
    });
    console.log(`✓ Status: ${result.status}`);
    console.log(`✓ CORS Origin Header: ${result.headers['access-control-allow-origin'] || 'NOT SET'}`);
    console.log(`✓ Response snippet: ${result.data.substring(0, 100)}...`);
  } catch (e) {
    console.error(`✗ Error: ${e.message}`);
  }

  // Test 3: POST with CORS (simulating real call)
  console.log('\n📋 Test 3: OPTIONS Preflight for POST');
  try {
    const result = await makeRequest('OPTIONS', '/api/v1/profile/update', {
      'Origin': 'http://localhost',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type'
    });
    console.log(`✓ Status: ${result.status}`);
    console.log(`✓ CORS Credentials: ${result.headers['access-control-allow-credentials'] || 'NOT SET'}`);
  } catch (e) {
    console.error(`✗ Error: ${e.message}`);
  }

  console.log('\n✅ All tests completed!\n');
}

runTests().catch(console.error);
