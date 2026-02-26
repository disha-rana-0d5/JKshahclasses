
const http = require('http');

const data = JSON.stringify({
    announcements: ["Test Message 1", "Test Message 2"],
    showAnnouncement: true
});

const options = {
    hostname: 'localhost',
    port: 5003,
    path: '/api/content/landing',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
        console.log('Update Response:', JSON.stringify(JSON.parse(responseBody), null, 2));

        // Now fetch to verify
        http.get('http://localhost:5003/api/content/landing', (res2) => {
            let fetchBody = '';
            res2.on('data', (chunk) => { fetchBody += chunk; });
            res2.on('end', () => {
                const fetched = JSON.parse(fetchBody);
                console.log('Verified Announcements:', fetched.data.announcements);
            });
        });
    });
});

req.on('error', (error) => { console.error(error); });
req.write(data);
req.end();
