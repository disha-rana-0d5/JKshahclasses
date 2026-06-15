const https = require('https');
const http = require('http');
const { URL } = require('url');

/**
 * Resolves a URL to its final destination by following redirects recursively.
 * @param {string} url - The URL to resolve.
 * @param {number} depth - Current recursion depth.
 * @returns {Promise<string>} - The resolved long URL.
 */
async function resolveUrl(url, depth = 0) {
    if (depth > 5 || !url) return url;
    
    // Only resolve short Google Maps URLs to avoid unnecessary traffic
    if (!url.includes('maps.app.goo.gl') && !url.includes('goo.gl/maps') && !url.includes('bit.ly') && !url.includes('t.co')) {
        return url;
    }

    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Handle relative redirects
                let nextUrl = res.headers.location;
                if (!nextUrl.startsWith('http')) {
                    const parsed = new URL(url);
                    nextUrl = `${parsed.protocol}//${parsed.host}${nextUrl.startsWith('/') ? '' : '/'}${nextUrl}`;
                }
                resolve(resolveUrl(nextUrl, depth + 1));
            } else {
                resolve(url);
            }
        }).on('error', (err) => {
            console.error(`Error resolving URL (${url}):`, err.message);
            resolve(url);
        });
    });
}

/**
 * Converts a Google Maps URL (short or long) to an embeddable format.
 * @param {string} url - The URL to convert.
 * @returns {Promise<string>} - The embeddable URL.
 */
async function getEmbeddableMapUrl(url) {
    if (!url) return '';
    
    let processedUrl = url.trim();

    // If it's an iframe, extract the src
    if (processedUrl.startsWith('<iframe')) {
        const srcMatch = processedUrl.match(/src=["']([^"']+)["']/);
        if (srcMatch && srcMatch[1]) {
            processedUrl = srcMatch[1];
        } else {
            // If it's an iframe but no src, just return empty
            return '';
        }
    }

    // If it's already an embed URL, return it
    if (processedUrl.includes('/embed') || processedUrl.includes('output=embed')) {
        return processedUrl;
    }

    // Resolve short URLs recursively
    let longUrl = await resolveUrl(processedUrl);
    
    console.log('Resolving Map URL:', processedUrl, '->', longUrl);

    // 1. Try to extract hex-encoded coordinates (!3d and !4d) - High Precision
    // Format: ...!3d19.174197!4d72.9551354...
    const hexCoordMatch = longUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (hexCoordMatch && hexCoordMatch.length >= 3) {
        return `https://maps.google.com/maps?q=${hexCoordMatch[1]},${hexCoordMatch[2]}&hl=en&z=17&output=embed`;
    }

    // 2. Try to extract coordinates from the @ format
    // Format: ...@19.174197,72.9525605,17z...
    const atCoordMatch = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atCoordMatch && atCoordMatch.length >= 3) {
        return `https://maps.google.com/maps?q=${atCoordMatch[1]},${atCoordMatch[2]}&hl=en&z=17&output=embed`;
    }

    // 3. Try to extract place name from the long URL
    // Format: .../place/Place+Name/...
    const placeMatch = longUrl.match(/\/place\/([^/?]+)/);
    if (placeMatch && placeMatch[1]) {
        return `https://maps.google.com/maps?q=${placeMatch[1]}&hl=en&z=17&output=embed`;
    }

    // 4. Fallback: If it's a search URL, use it with output=embed
    if (longUrl.includes('/maps/search/')) {
        const query = longUrl.split('/maps/search/')[1].split('/')[0];
        return `https://maps.google.com/maps?q=${query}&hl=en&z=17&output=embed`;
    }

    // 5. Final Fallback: If it's a google.com/maps URL but none of the above matched, 
    // try to append output=embed if it doesn't have it (CAUTION: might still fail)
    if (longUrl.includes('google.com/maps')) {
        const connector = longUrl.includes('?') ? '&' : '?';
        return `${longUrl}${connector}output=embed`;
    }

    return longUrl;
}

module.exports = {
    resolveUrl,
    getEmbeddableMapUrl
};
