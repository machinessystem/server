const admin = require('firebase-admin');
const db = admin.database();
const Joi = require('joi');
const _ = require('lodash');
const moment = require('moment');
const time = require('../../lib/time');
const energy = require('../../lib/energy');


const fieldName = 'instancesReadings';


const deleteInstanceReadings = (instanceId) => {
    return getInstanceReadingRef(instanceId).remove()
}

const getInstanceReadingsRefByPin = (instanceId, pinNo) => {
    return db.ref(`${fieldName}/${instanceId}/${pinNo}`)
}

const getInstanceReadingsRef = (instanceId) => {
    return db.ref(`${fieldName}/${instanceId}`)
}

async function sendAutoReading(instanceId, pinNo) {
    const value = Math.random() * (3.00 - 0.00) + 0.00
    const result = await db.ref(`instancesReadings/${instanceId}/${pinNo}`).update({ [Date.now()]: value });
    console.log("DOne", "value: " + value);
}
// setInterval(()=>sendAutoReading('-MH100tNKD_wuB7nMhsr','4'), 10000);


// const readings = await getInstanceReadingsRefByPin(instanceId, pinNo).once('value');
// console.log(readings.val())
async function getReadingsByPinNumber(instanceId, pinNo) {
    const durationInDays = 1;
    const maxTimeDifferenceRageInSeconds = 10 * 1000; // 10 seconds
    let power = 0;
    let totalTime = 0;
    const now = time.getLastTime(1, 'd').unix()
    const result = await getInstanceReadingsRefByPin(instanceId, pinNo)
        .orderByKey()
        .startAt(now.toString())
        .once('value');

    const readings = [];
    result.forEach(reading => {
        readings.push({ time: parseInt(reading.key), value: reading.val() })
    })

    readings.forEach((value, index) => {
        let nextIndex = index + 1;
        if (!(nextIndex >= readings.length)) {

            let timeTaken = moment(Date.now()).diff(value.time, 's')
            if (timeTaken > maxTimeDifferenceRageInSeconds) return;
            // console.log("TIME TAKEN", `${timeTaken} ms`)
            let calculatedPower = energy.calculatePower(readings[index].value, timeTaken / (1000 * 60 * 60))
            totalTime += timeTaken;
            power += calculatedPower;
        }
    })

    // console.log(`TOTAL POWER by ${moment(readings[readings.length - 1])}`, `${power} WH`);
    return { time: moment(readings[readings.length - 1]), power, unit: 'WH' }
}


// getReadingsByPinNumber('-MH100tNKD_wuB7nMhsr', '4');




module.exports = {
    deleteInstanceReadings, getInstanceReadingsRefByPin, getInstanceReadingsRef,

    getReadingsByPinNumber
}