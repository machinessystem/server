const winston = require('winston');
module.exports = (err, req, res, next) => {
    //Log the exception
    winston.error(err.message, err);
    //error
    //warn
    //info
    //verbose
    //silly
    res.status(500).json({ error: err })
}