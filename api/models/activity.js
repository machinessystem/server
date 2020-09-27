const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');

const fieldName = 'activities';

const activityValidationSchema = Joi.object({
    name: Joi.string().required()
});

const create = ({ name, creatorUid }) => {
    return db.ref(fieldName).push({ name, creatorUid, addedOn: Date.now().toString() })
}

const getActivities = () => {
    return db.ref(fieldName).once('value');
}

const getActivityById = (activityId) => {
    return db.ref(`${fieldName}/${activityId}`).once('value');
}

const getActivityDefinitionsByInstanceId = (instanceId) => {
    return db.ref(`activitiesDefinitions/${instanceId}`).once('value');
}

const addActivitySchema = (activityId, values) => {
    return db.ref(`activitiesSchema/${activityId}`).set(values);
}

const validateSchema = (input) => {
    return activityValidationSchema.validate(input);
}

module.exports = { validateSchema, create, getActivities, addActivitySchema, getActivityById, getActivityDefinitionsByInstanceId }