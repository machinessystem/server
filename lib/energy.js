

/*
 *@param integer voltage 
 *@param float current 
 *@param float time 
 *@return float 
 */
const calculatePower = (current, time, voltage = 220) => {
    if (!voltage || !current || !time) return 0;
    return voltage * current * time;
}


module.exports = { calculatePower }