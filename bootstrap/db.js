const mongoose = require('mongoose');
const winston = require('winston');
const admin = require('firebase-admin');
module.exports = async () => {
    try {
        const serviceAccount = require('../machinesproject-firebase-adminsdk-xv7vk-e9dc047287.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://machinesproject.firebaseio.com"
        });
        winston.info('Database connection has been established successfully.');
    } catch (err) {
        winston.error(err)
    }
}