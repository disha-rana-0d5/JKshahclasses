const express = require('express');
const router = express.Router();
const careerOpportunityController = require('../controllers/careerOpportunityController');

router.get('/', careerOpportunityController.getAllCareerOpportunities);
router.post('/', careerOpportunityController.addOrUpdateCareerOpportunity);
router.delete('/:id', careerOpportunityController.deleteCareerOpportunity);

module.exports = router;
