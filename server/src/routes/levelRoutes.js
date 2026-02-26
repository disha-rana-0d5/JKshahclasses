const express = require('express');
const { getLevels, addLevel, deleteLevel } = require('../controllers/levelController');

const router = express.Router();

router.route('/')
    .get(getLevels)
    .post(addLevel);

router.route('/:id')
    .delete(deleteLevel);

module.exports = router;
