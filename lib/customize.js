const strToUnique = (str = "b f s") => {
    return str.toUpperCase().replace(/ /g, '_');
}

module.exports = { strToUnique }