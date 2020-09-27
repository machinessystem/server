const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const userModel = require('../models/user');

router.post('/', [async (req, res,next) => {
    const returnUri = req.query.returnUri ? req.query.returnUri : `${req.protocol}://${req.hostname}`;

    const values = _.pick(req.body, ['email', 'displayName', 'password', 'agreement']);

    const { error } = userModel.validateSchema(values);
    if (error) return res.status(400).json({ error: { code: 'invalid-input', message: 'Invalid input' } });

    const hashed = await userModel.hashPwd(values.password);
    const user = await userModel.create(values)
    const saved = await userModel.saveUser({
        uid: user.uid, email: user.email, displayName: user.displayName,
        password: hashed, agreement: values.agreement
    });

    const role = await userModel.saveRole(user.uid, 'admin');

    req.auth = { user, claims: {} };
    next();
}, auth.sendAuthorization]);

router.get('/', async (req, res) => {
    res.json('Hello');
});

router.get('/:uid', [auth.verify], async (req, res) => {
    const { uid } = req.params;

    if (uid == req.user.uid || (req.user.admin && req.user.admin === true)) {
        const user = await userModel.getUserInfo(req.user.uid);
        const params = _.pick(user.val(), ['displayName', 'roles', 'uid', 'email']);
        return res.json(params);
    }
    return res.status(401).json({ error: { code: 'unauthorized', message: 'Unauthorized' } });
});

module.exports = router;