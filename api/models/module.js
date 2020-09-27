const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');
const customize = require('../../lib/customize');

const fieldName = 'modules';

const moduleValidationSchema = Joi.object({
    moduleTypeId: Joi.string().required(),
    name: Joi.string().required(),
    description: Joi.object().required()
});

const createModule = ({ moduleTypeId, name, description, creatorUid }) => {
    return db.ref(fieldName).push({ moduleTypeId, name, description, creatorUid, addedOn: Date.now().toString() })
}

const getModules = () => {
    return db.ref(fieldName).once('value');
}

const getModulesByModuleTypeId = (moduleTypeId) => {
    const type = customize.strToUnique(moduleTypeId);
    return db.ref(fieldName).orderByChild('moduleTypeId').equalTo(type).once('value');
}

const getModulesByModuleId = (moduleId) => {
    return db.ref(`${fieldName}/${moduleId}`).once('value');
}

const getModuleRef = (moduleId) => {
    return db.ref(`${fieldName}/${moduleId}`);
}
const validateSchema = (input) => {
    return moduleValidationSchema.validate(input);
}

module.exports = { createModule, getModules, getModulesByModuleTypeId, getModulesByModuleId, validateSchema, getModuleRef }