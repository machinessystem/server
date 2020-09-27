const admin = require('firebase-admin');
const db = admin.database()

const getNews = () => {
    return db.ref('/news').once('value');
}
module.exports = { getNews }