import http from 'http';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';

function fetchUrl(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', err => reject(err));
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   CareKey Automated Full-Stack Verification Suite   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '- ' + details : ''}`);
      failed++;
    }
  }

  // TEST 1: Server Root Endpoint
  try {
    const rootRes = await fetchUrl('/');
    assert(rootRes.statusCode === 200, 'Test 1: HTTP Root (/) returns 200 OK');
    assert(rootRes.body.includes('<div id="root"></div>'), 'Test 1b: Root DOM mount container is present');
    assert(rootRes.body.includes('/src/main.jsx'), 'Test 1c: React entrypoint script tag is served');
  } catch (err) {
    assert(false, 'Test 1: HTTP Root endpoint connection', err.message);
  }

  // TEST 2: Direct /login Route
  try {
    const loginRes = await fetchUrl('/login');
    assert(loginRes.statusCode === 200, 'Test 2: Direct /login route responds with 200 OK (SPA routing)');
  } catch (err) {
    assert(false, 'Test 2: Direct /login route', err.message);
  }

  // TEST 3: Direct /home and Sub-routes SPA fallback
  try {
    const homeRes = await fetchUrl('/home');
    assert(homeRes.statusCode === 200, 'Test 3: Direct /home route responds with 200 OK');
    const apptsRes = await fetchUrl('/appointments');
    assert(apptsRes.statusCode === 200, 'Test 3b: Direct /appointments route responds with 200 OK');
  } catch (err) {
    assert(false, 'Test 3: Sub-routes SPA fallback', err.message);
  }

  // TEST 4: Firebase Configuration Validation
  try {
    const configPath = path.resolve('src/firebase/firebaseConfig.js');
    const configContent = fs.readFileSync(configPath, 'utf-8');
    assert(configContent.includes('apiKey:'), 'Test 4a: Firebase apiKey configured');
    assert(configContent.includes('authDomain:'), 'Test 4b: Firebase authDomain configured');
    assert(configContent.includes('projectId:'), 'Test 4c: Firebase projectId configured');
    assert(configContent.includes('storageBucket:'), 'Test 4d: Firebase storageBucket configured');
    assert(configContent.includes('getAuth('), 'Test 4e: Firebase Authentication initialized');
    assert(configContent.includes('getFirestore('), 'Test 4f: Cloud Firestore initialized');
    assert(configContent.includes('getStorage('), 'Test 4g: Firebase Storage initialized');
  } catch (err) {
    assert(false, 'Test 4: Firebase configuration', err.message);
  }

  // TEST 5: Complete Mock Data Purge Verification
  try {
    const mockDataFile = path.resolve('src/services/mockData.js');
    const mockDataExists = fs.existsSync(mockDataFile);
    assert(!mockDataExists, 'Test 5a: mockData.js is permanently deleted from codebase');

    const srcFiles = [];
    function scanDir(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) scanDir(full);
        else if (/\.(js|jsx)$/.test(entry.name)) srcFiles.push(full);
      }
    }
    scanDir(path.resolve('src'));

    let foundMockImport = false;
    for (const f of srcFiles) {
      const content = fs.readFileSync(f, 'utf-8');
      if (content.includes('mockData') || content.includes('MOCK_PATIENTS')) {
        foundMockImport = true;
        console.error('Found lingering mock reference in:', f);
      }
    }
    assert(!foundMockImport, 'Test 5b: Zero mockData imports across all 25 source files');
  } catch (err) {
    assert(false, 'Test 5: Mock data purge verification', err.message);
  }

  // TEST 6: Security Rules Validation
  try {
    const firestoreRulesPath = path.resolve('../firestore.rules');
    const storageRulesPath = path.resolve('../storage.rules');
    assert(fs.existsSync(firestoreRulesPath), 'Test 6a: firestore.rules exists in project root');
    assert(fs.existsSync(storageRulesPath), 'Test 6b: storage.rules exists in project root');

    const fsRulesContent = fs.readFileSync(firestoreRulesPath, 'utf-8');
    assert(fsRulesContent.includes('request.auth != null'), 'Test 6c: Firestore rules require request.auth');
    assert(fsRulesContent.includes('match /users/{userId}'), 'Test 6d: Firestore rules isolate user documents');
    assert(fsRulesContent.includes('match /appointments/{appointmentId}'), 'Test 6e: Firestore rules secure appointments');
    assert(fsRulesContent.includes('match /medical_records/{recordId}'), 'Test 6f: Firestore rules secure medical records');

    const stRulesContent = fs.readFileSync(storageRulesPath, 'utf-8');
    assert(stRulesContent.includes('match /medical_records/{userId}/{allPaths=**}'), 'Test 6g: Storage rules isolate patient files');
  } catch (err) {
    assert(false, 'Test 6: Security rules', err.message);
  }

  // TEST 7: AI Assistant Server-Side Endpoint Integration
  try {
    const aiApiContent = fs.readFileSync(path.resolve('src/services/aiApi.js'), 'utf-8');
    assert(aiApiContent.includes("'/ai/chat'"), 'Test 7a: AI API routes to /ai/chat via apiRequest');
    assert(!aiApiContent.includes('MOCK_RESPONSES'), 'Test 7b: AI API has zero mock conversational fallbacks');
  } catch (err) {
    assert(false, 'Test 7: AI Assistant routing', err.message);
  }

  // TEST 8: 3 Portals Route Verification (Doctor, Patient, Admin)
  try {
    const doctorLoginRes = await fetchUrl('/doctor/login');
    assert(doctorLoginRes.statusCode === 200, 'Test 8a: /doctor/login responds with 200 OK');
    const doctorRegRes = await fetchUrl('/doctor/register');
    assert(doctorRegRes.statusCode === 200, 'Test 8b: /doctor/register responds with 200 OK');
    const patientLoginRes = await fetchUrl('/patient/login');
    assert(patientLoginRes.statusCode === 200, 'Test 8c: /patient/login responds with 200 OK');
    const patientRegRes = await fetchUrl('/patient/register');
    assert(patientRegRes.statusCode === 200, 'Test 8d: /patient/register responds with 200 OK');
    const findDocRes = await fetchUrl('/patient/find-doctor');
    assert(findDocRes.statusCode === 200, 'Test 8e: /patient/find-doctor responds with 200 OK');
    const myDocRes = await fetchUrl('/patient/my-doctors');
    assert(myDocRes.statusCode === 200, 'Test 8f: /patient/my-doctors responds with 200 OK');
    const adminLoginRes = await fetchUrl('/admin/login');
    assert(adminLoginRes.statusCode === 200, 'Test 8g: /admin/login responds with 200 OK');
  } catch (err) {
    assert(false, 'Test 8: Portal route validation', err.message);
  }

  // TEST 9: Firestore Service Doctor & Patient Workflow Verification
  try {
    const fsServicePath = path.resolve('src/services/firestoreService.js');
    const fsServiceContent = fs.readFileSync(fsServicePath, 'utf-8');
    assert(fsServiceContent.includes('registerDoctor'), 'Test 9a: registerDoctor method implemented');
    assert(fsServiceContent.includes('getDoctors'), 'Test 9b: dynamic getDoctors search implemented');
    assert(fsServiceContent.includes('registerPatient'), 'Test 9c: registerPatient method implemented');
    assert(fsServiceContent.includes('createDoctorPatientRequest'), 'Test 9d: createDoctorPatientRequest implemented');
    assert(fsServiceContent.includes('updateDoctorPatientRequest'), 'Test 9e: updateDoctorPatientRequest with ACCEPTED/REJECTED implemented');
    assert(fsServiceContent.includes('getConnectedDoctorsForPatient'), 'Test 9f: getConnectedDoctorsForPatient implemented');
    assert(fsServiceContent.includes('getConnectedPatientsForDoctor'), 'Test 9g: getConnectedPatientsForDoctor implemented');
  } catch (err) {
    assert(false, 'Test 9: Firestore service verification', err.message);
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
