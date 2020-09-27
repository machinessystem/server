const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');
const customize = require('../../lib/customize');

const fieldName = 'moduleTypes';

const modultTypeValidationSchema = Joi.object({
    name: Joi.string().required(),
});

const createModuleType = ({ name, creatorUid }) => {
    const type=customize.strToUnique(name);
    return db.ref(`${fieldName}/${type}`).set({ name, type, creatorUid, addedOn: Date.now().toString() })
}

const getModuleTypes = () => {
    return db.ref(`${fieldName}`).once('value');
}

const getModuleTypeById = (moduleTypeId) => {
    const type=customize.strToUnique(moduleTypeId);
    return db.ref(`${fieldName}/${type}`).once('value');
}

const validateSchema = (input) => {
    return modultTypeValidationSchema.validate(input);
}

module.exports = { createModuleType, getModuleTypes, getModuleTypeById, validateSchema }