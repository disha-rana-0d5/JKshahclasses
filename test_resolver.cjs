const { getEmbeddableMapUrl } = require('./server/src/utils/urlResolver');

async function test() {
    const testUrls = [
        'https://maps.app.goo.gl/1VJ46U6vShyGJk466', // Short URL
        'https://www.google.com/maps/place/JK+Shah+Classes/@19.1136,72.8697,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7c9ce3f5a5a5a:0x5a5a5a5a5a5a5a5a!8m2!3d19.1136!4d72.8697!16s%2Fg%2F11b6_1_1_1', // Long URL with coords
        '<iframe src="https://www.google.com/maps/embed?pb=..." width="600" height="450"></iframe>', // Iframe
    ];

    for (const url of testUrls) {
        console.log(`Original: ${url}`);
        const resolved = await getEmbeddableMapUrl(url);
        console.log(`Resolved: ${resolved}`);
        console.log('---');
    }
}

test();
