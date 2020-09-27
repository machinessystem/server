const admin = require('firebase-admin');
const auth = admin.auth();
const _ = require('lodash')
const userModel = require('../models/user');

const verify = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(400).json({ error: { code: 'invalid token', message: 'Invalid token' } });
    const decoded = await auth.verifyIdToken(token.substring('Bearer '.length));
    if (!decoded) return res.status(401).json({ error: { code: 'invalid-user', message: 'Invalid user' } });
    req.user = decoded;
    next();
}

const sendAuthorization = async (req, res) => {

    let customClaims = {}
    const { user, claims } = req.auth;

    const record = (await userModel.getUserInfo(user.uid)).val();
    const params = _.pick(record, 'displayName', 'roles', 'uid', 'email');

    if (claims)
        customClaims = { ...claims };

    const { roles } = record;

    if (roles) {
        if (roles.admin) customClaims.admin = roles.admin === true;
        if (roles.member) customClaims.member = roles.member === true;
    }
    const createCustomToken = await userModel.setCustomClaims({ uid: user.uid, customClaims });
    const token = await userModel.createCustomToken(user.uid)
    if (token)
        res.header('x-auth-token', token)
            .header('access-control-expose-headers', 'x-auth-token')
            .json(params)
}

module.exports = { verify, sendAuthorization }