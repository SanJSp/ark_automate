const express = require('express');

const router = express.Router();

// Require controller modules
const parsingController = require('../controllers/ssotParsingController');
const retrievalController = require('../controllers/ssotRetrievalController');

/// SSOTPARSING ROUTES ///

router.get('/parser/get-robot-code', parsingController.getRobotCode);
router.get('/get/:id', retrievalController.getSingleSourceOfTruth);
router.get('/getAvailableBotsForUser/:userid', retrievalController.getBotList);
router.get('/renameBot', retrievalController.renameBot);

module.exports = router;
