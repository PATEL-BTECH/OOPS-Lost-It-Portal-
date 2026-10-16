/**
 * Verification script for Phase 6: Admin and Security Staff Dashboards
 * Uses native Node fetch
 */
const BASE_URL = 'http://localhost:5000/api';

async function runPhase6Tests() {
  console.log('🚀 Starting Phase 6 Comprehensive Automated Tests...\n');

  try {
    // 1. Admin Dev Login
    console.log('1️⃣ Authenticating as Administrator (Nand Patel)...');
    const loginRes = await fetch(`${BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'admin',
        name: 'Nand Patel',
        email: 'nand.patel@gsfcuniversity.ac.in'
      })
    });

    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const cookieHeader = loginRes.headers.get('set-cookie');
    if (!cookieHeader) {
      throw new Error('No cookie received from login endpoint');
    }
    const cookie = cookieHeader.split(';')[0];
    const authHeaders = { 
      'Cookie': cookie,
      'Content-Type': 'application/json'
    };
    console.log('   ✅ Authenticated as Admin. Cookie received.');

    // 2. Test Analytics Endpoint
    console.log('\n2️⃣ Testing GET /api/admin/analytics...');
    const analyticsRes = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: authHeaders
    });
    if (!analyticsRes.ok) {
      throw new Error(`Analytics failed with status ${analyticsRes.status}`);
    }
    const analyticsData = await analyticsRes.json();
    const { metrics, categoryDistribution, monthlyTrends, statusDonut } = analyticsData;

    console.log('   ✅ Analytics Metrics Received:');
    console.log(`      - Total Lost Items: ${metrics.totalLost}`);
    console.log(`      - Total Found Items: ${metrics.totalFound}`);
    console.log(`      - Recovered & Handed Over: ${metrics.totalHandedOver}`);
    console.log(`      - Recovery Rate: ${metrics.recoveryRate}%`);
    console.log(`      - Registered Users: ${metrics.totalUsers}`);
    console.log(`      - Category Distribution Items: ${categoryDistribution.length}`);
    console.log(`      - Monthly Velocity Trends: ${monthlyTrends.length} months`);
    console.log(`      - Status Donut Slices: ${statusDonut.length}`);

    if (!Array.isArray(categoryDistribution) || !Array.isArray(monthlyTrends) || !Array.isArray(statusDonut)) {
      throw new Error('Analytics payload format invalid for Recharts consumption');
    }

    // 3. Test Users Directory
    console.log('\n3️⃣ Testing GET /api/admin/users...');
    const usersRes = await fetch(`${BASE_URL}/admin/users`, {
      headers: authHeaders
    });
    if (!usersRes.ok) throw new Error(`Users fetch failed: ${usersRes.status}`);
    const usersData = await usersRes.json();
    console.log(`   ✅ Successfully retrieved ${usersData.users.length} registered campus users.`);

    // 4. Test Campus Announcement Creation
    console.log('\n4️⃣ Testing POST /api/admin/announcements...');
    const announcementPayload = {
      title: 'Phase 6 Operational: Central Lost & Found Desk',
      content: 'All recovered belongings are now cataloged at Ground Floor Security Post. Check the digital receipt archive.',
      priority: 'urgent'
    };
    const postAnnRes = await fetch(`${BASE_URL}/admin/announcements`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(announcementPayload)
    });
    if (!postAnnRes.ok) throw new Error(`Announcement creation failed: ${postAnnRes.status}`);
    const postAnnData = await postAnnRes.json();
    const createdAnnouncementId = postAnnData.announcement._id;
    console.log(`   ✅ Announcement broadcasted with ID: ${createdAnnouncementId}`);

    // 5. Test Public Announcements Endpoint
    console.log('\n5️⃣ Testing Public GET /api/admin/announcements...');
    const publicAnnRes = await fetch(`${BASE_URL}/admin/announcements`);
    if (!publicAnnRes.ok) throw new Error(`Public announcements failed: ${publicAnnRes.status}`);
    const publicAnnData = await publicAnnRes.json();
    const foundAnn = publicAnnData.announcements.find((a) => a._id === createdAnnouncementId);
    if (!foundAnn) {
      throw new Error('Created announcement not found in public list');
    }
    console.log(`   ✅ Publicly verified announcement "${foundAnn.title}" with priority [${foundAnn.priority}]`);

    // 6. Test Security Audit Trail
    console.log('\n6️⃣ Testing GET /api/admin/audit-logs...');
    const auditRes = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: authHeaders
    });
    if (!auditRes.ok) throw new Error(`Audit logs fetch failed: ${auditRes.status}`);
    const auditData = await auditRes.json();
    console.log(`   ✅ Retrieved ${auditData.count} audit log records.`);
    const recentAnnLog = auditData.logs.find((l) => l.action === 'ANNOUNCEMENT_POSTED');
    if (recentAnnLog) {
      console.log(`   ✅ Found audit record: [${recentAnnLog.action}] by ${recentAnnLog.user?.name} (${recentAnnLog.details})`);
    }

    console.log('\n🎉 ALL PHASE 6 AUTOMATED ENDPOINT TESTS PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('\n❌ Phase 6 Test Failed:', error.message);
    process.exit(1);
  }
}

runPhase6Tests();
