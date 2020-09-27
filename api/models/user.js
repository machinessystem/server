const admin = require('firebase-admin');
const auth = admin.auth();
const db = admin.database();
const Joi = require('joi');
const bcrypt = require('bcrypt');

const fieldName = "users";

const userValidationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/).min(8).required().label('Password'),
    displayName: Joi.string().required(),
    photoURL: Joi.string().allow('').optional(),
    agreement: Joi.boolean().invalid(false).required()
});

const create = ({ email, password, displayName, photoURL }) => {
    return auth.createUser({ displayName, email, password, photoURL })
}

const createCustomToken = (uid, developerClaims = {}) => {
    return auth.createCustomToken(uid, developerClaims)
}
const saveUser = ({ uid, displayName, email, password, ...rest }) => {
    return db.ref(`${fieldName}/${uid}/`).set({ uid, displayName, email, password, ...rest })
}
const saveRole = (uid, key = 'admin', value = false) => {
    return db.ref(`${fieldName}/${uid}/roles`).set({ [key]: value })
}

const validateSchema = (input) => {
    return userValidationSchema.validate(input)
}
const hashPwd = (pwd) => {
    return bcrypt.hash(pwd, 10)
}

const findUserByEmail = (email) => {
    return auth.getUserByEmail(email)
}

const verifyPassword = async (uid, password) => {
    return new Promise(async (resolve, reject) => {
        const hashed = await db.ref(`${fieldName}/${uid}/password`).once('value')
        const result = await bcrypt.compare(password, hashed.val())
        if (result) return resolve(true);
        return reject({
            error: {
                code: 'auth/password-mismatch', message: 'Password didn\'t match'
            }
        });
    })
}

const setCustomClaims = ({ uid, customClaims=null }) => {
    return auth.setCustomUserClaims(uid, customClaims)
}

const getUserInfo = (uid) => {
    return db.ref(`${fieldName}/${uid}/`).once('value');
}
const getUserRoles = (uid) => {
    return db.ref(`${fieldName}/${uid}/roles`).once('value');
}

module.exports = { validateSchema,getUserRoles, create, createCustomToken, setCustomClaims, saveUser, saveRole, hashPwd, findUserByEmail, verifyPassword, getUserInfo }