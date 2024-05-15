var express = require('express');
var router = express.Router();
const restric = require('../middleware/restricted');
const { register, verifyEmail, requestVerifyEmail } = require('../controllers/auth.controllers');

router.post('/register', register);
router.get('/verify', verifyEmail);
router.get('/request-verify', requestVerifyEmail);
module.exports = router;
