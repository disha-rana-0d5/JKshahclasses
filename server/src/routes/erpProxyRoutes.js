const express = require('express');
const router = express.Router();

router.post('/proxy', async (req, res) => {
    try {
        const { targetUrl, body, headers } = req.body;
        if (!targetUrl) {
            return res.status(400).json({ success: false, message: "targetUrl is required" });
        }

        // Dynamically fetch using node fetch
        const fetch = (await import('node-fetch')).default;

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: headers || {},
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error('ERP Proxy Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
