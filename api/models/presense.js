const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');

const fieldName = "instancesPresense";

const deleteInstanceLiveresense = (instanceId) => {
    return getInstanceReadingRef(instanceId).remove()
}

const getInstancePresenseRef = (instanceId) => {
    return db.ref(`${fieldName}/${instanceId}`)
}

const getAllInstancesPresencesRef = () => {
    return db.ref(fieldName)
}

module.exports = {
    deleteInstanceLiveresense, getInstancePresenseRef, getAllInstancesPresencesRef
}