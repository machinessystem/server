const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');

const fieldName = "instanceIAMs";

const deleteInstanceIAMs = (instanceId) => {
    return getInstanceReadingRef(instanceId).remove()
}

const getInstanceIAMsRefByUid = (instanceId, uid) => {
    return db.ref(`${fieldName}/${instanceId}/${uid}`)
}

const getInstanceIAMsRef = (instanceId) => {
    return db.ref(`${fieldName}/${instanceId}`)
}


const getUserInstancesByIam = (uid) => {
    return db.ref('instanceIAMs').orderByChild(uid).once('value');
}


module.exports = {
    deleteInstanceIAMs, getInstanceIAMsRefByUid, getInstanceIAMsRef, getUserInstancesByIam
}