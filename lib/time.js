const moment = require('moment');

function getLastTime(from, unit = 'h' | 'y' | 'M' | 'w' | 'd' | 'm' | 's') {
    return moment().subtract(from, unit, true)
}

function difference(param1Greater, param2Lower, unit = 'h' | 'm' | 's' | 'ms') {
    const duration = moment.duration(param1Greater - param2Lower)
    if (unit === 'm') return duration.asMinutes()
    else if (unit === 's') return duration.asSeconds()
    else if (unit === 'ms') return duration.asMilliseconds()
    return duration.asHours()
}


module.exports = { getLastTime, difference }