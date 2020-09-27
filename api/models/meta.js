const admin = require('firebase-admin');
const db = admin.database()


const getAbout = () => {
    return db.ref('/about').once('value');
}
const getMeta = () => {
    return db.ref('/meta').once('value');
}

module.exports = { getAbout, getMeta };