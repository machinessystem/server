const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');

const fieldName = "instances";

const instanceValidationSchema = Joi.object({
    name: Joi.string().required(),
    cpuId: Joi.string().required(),
    comnDeviceId: Joi.string().required(),
    activityId: Joi.string().required(),
});

const createInstance = ({ ownerUid, name, cpuId, comnDeviceId, activityId }) => {
    return db.ref(fieldName).push({ ownerUid, name, cpuId, comnDeviceId, activityId, addedOn: Date.now().toString() })
}

const getInstanceById = (instanceId) => {
    return getInstanceRef(instanceId).once('value');
}

const updateInstance = ({ instanceId, ...params }) => {
    return getInstanceRef(instanceId).update({ ...params, modified: Date.now().toString() })
}

const getInstancesByOwner = (ownerUid) => {
    return db.ref(fieldName).orderByChild('ownerUid').equalTo(ownerUid).once('value');
}

const deleteInstance = (instanceId) => {
    return getInstanceRef(instanceId).remove()
}

const getInstanceRef = (instanceId) => {
    return db.ref(`${fieldName}/${instanceId}`)
}

const validateSchema = (input) => {
    return instanceValidationSchema.validate(input)
}




module.exports = { validateSchema, getInstanceRef, deleteInstance, createInstance, getInstancesByOwner, updateInstance, getInstanceById }