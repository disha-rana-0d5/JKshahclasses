const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

console.log('Dashboard routes loaded');

router.get('/test', (req, res) => res.send('Dashboard route working'));
router.get('/stats', (req, res, next) => {
    console.log('Stats route hit');
    next();
}, getDashboardStats);

module.exports = router;
