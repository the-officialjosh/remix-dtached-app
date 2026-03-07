import fetch from 'node-fetch';

async function testTags() {
  console.log('Testing Registration...');
  const regRes = await fetch('http://localhost:8080/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `testuser${Date.now()}@dtached.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    })
  });
  
  if (!regRes.ok) {
    console.error('Registration failed:', await regRes.text());
    process.exit(1);
  }

  const userData = await regRes.json();
  console.log('Registration Success! Data:', userData);
  if (!userData.userTag) {
    console.error('❌ Missing userTag in auth response!');
    process.exit(1);
  }
  console.log(`✅ userTag verified: ${userData.userTag}`);

  // Create Player Profile
  console.log('\nTesting Player Creation...');
  const playerRes = await fetch('http://localhost:8080/api/players/register', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userData.token}`
    },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      position: 'QB',
      height: '6-0',
      weight: '180'
    })
  });

  if (!playerRes.ok) {
    console.error('Player creation failed:', await playerRes.text());
    process.exit(1);
  }

  const playerData = await playerRes.json();
  console.log('Player Creation Success! Data:', playerData);
  if (!playerData.playerTag) {
    console.error('❌ Missing playerTag in player response!');
    process.exit(1);
  }
  console.log(`✅ playerTag verified: ${playerData.playerTag}`);

  console.log('\nAll Tag generation tests passed successfully!');
}

testTags();
