const express = require('express');
const router = express.Router();
const _ = require('lodash');
const userModel = require('../models/user');
const auth = require('../middlewares/auth');

router.post('/', [async (req, res, next) => {

    const { identifier: identifierReq, email, username, phoneNumber, password } = req.body;
    const identifier = identifierReq || email || username || phoneNumber;

    if (!identifier || !password) return res.status(400).json({ error: { code: 'invalid-credentials', message: 'Invalid Credentials' } });

    const user = await userModel.findUserByEmail(identifier);
    if (!user) return res.status(404).json({ error: { code: 'invalid-credentials', message: 'Invalid Credentials' } });

    const matchedHash = await userModel.verifyPassword(user.uid, password);
    if (!matchedHash) return res.status(404).json({ error: { code: 'invalid-credentials', message: 'Invalid Credentials' } });

    if (!user.emailVerified) return res.status(401).json({ error: { code: 'auth/email-not-verified', message: 'Email is not verified' } });

    req.auth = { user, claims: {} };
    next();
}, auth.sendAuthorization]);


module.exports = router;