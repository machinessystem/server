const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');

const fieldName = "modules";
const pinDefinitionsFieldName = 'pinDefinitions';

const pinDefinitiionValidationSchema = Joi.array().items(Joi.object({
    no: Joi.string().required(),
    name: Joi.string().required(),
    mode: Joi.string().required()
}));

const getPinConfigurationsByModuleId = (moduleId) => {
    return db.ref(`${fieldName}/${moduleId}`).child('description/pin_configuration').once('value')
};

const getPinNoConfiguration = (moduleId, pinNo) => {
    return db.ref(`${fieldName}/${moduleId}`).child(`description/pin_configuration/${pinNo}`).once('value')
};

const getPinDefinitionsByInstanceId = (instanceId) => {
    return getPinDefinitionsRefByInstanceId(instanceId).once('value');
}

const addPinDefinition = (instanceId, values) => {
    return db.ref(`${pinDefinitionsFieldName}/${instanceId}`).set(values);
}
const updatePinDefinition = (instanceId, values) => {
    return db.ref(`${pinDefinitionsFieldName}/${instanceId}`).update(values);
}

const deletePinDefinitions = (instanceId) => {
    return getPinDefinitionsRefByInstanceId(instanceId).remove()
}

const getPinRefBInstanceId = (instanceId, pinNo) => {
    return db.ref(`${pinDefinitionsFieldName}/${instanceId}/${pinNo}`)
}
const getPinDefinitionsRefByInstanceId = (instanceId) => {
    return db.ref(`${pinDefinitionsFieldName}/${instanceId}`)
}

const validateSchema = (input) => {
    return pinDefinitiionValidationSchema.validate(input)
}



module.exports = {
    validateSchema,
    getPinConfigurationsByModuleId,
    getPinDefinitionsByInstanceId,
    addPinDefinition,
    updatePinDefinition,
    getPinRefBInstanceId,
    getPinDefinitionsRefByInstanceId,
    getPinNoConfiguration,
    deletePinDefinitions
}