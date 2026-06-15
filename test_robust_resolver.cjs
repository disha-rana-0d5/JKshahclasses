const { getEmbeddableMapUrl } = require('./server/src/utils/urlResolver');

async function test() {
    const urls = [
        'https://maps.app.goo.gl/2ZEVUKw4tieEZMGT8',
        'https://www.google.com/maps/place/J+K+Shah+Commerce+Classes/@19.174197,72.9525605,17z/data=!3m1!4b1!4m6!3m5!1s0x3be7b8fa8ba833ff:0xeb11b6e565847d64!8m2!3d19.174197!4d72.9551354!16s%2Fg%2F11f0kv83yr?entry=tts&g_ep=EgoyMDI2MDMxMS4wIPu8ASoASAFQAw%3D%3D&skid=be56de0c-06d0-4fe8-80ca-df6e24d40a42'
    ];

    for (const url of urls) {
        console.log(`Input: ${url}`);
        const result = await getEmbeddableMapUrl(url);
        console.log(`Result: ${result}`);
        console.log('---');
    }
}

test();
