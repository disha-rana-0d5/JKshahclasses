const fetch = require('node-fetch');

async function test() {
    const headers = { 'x-auth-key': 'jkshah_cloud_secret_auth_live_2025', 'Content-Type': 'application/json' };
    
    console.log("--- Branches ---");
    const br = await fetch('https://edu.jkshahcloud.com:5004/courses/api/course/branchDetails', { method: 'POST', headers });
    console.log(await br.json());
    
    console.log("--- Fee Catg ---");
    const fc = await fetch('https://edu.jkshahcloud.com:5004/courses/api/course/feeCatgDetails', { method: 'POST', headers });
    console.log(await fc.json());
    
    console.log("--- Courses ---");
    const cr = await fetch('https://edu.jkshahcloud.com:5004/courses/api/course/list', { method: 'POST', headers });
    const cData = await cr.json();
    console.log(cData.data?.slice(0, 2));

    console.log("--- Batch details for course 150, level 201 ---");
    const bReq = await fetch('https://edu.jkshahcloud.com:5004/courses/api/course/batchDetails', { method: 'POST', headers, body: JSON.stringify({ courseId: "150", levelId: "201" }) });
    console.log(await bReq.json());
}
test();
