const NodeCache = require("node-cache");

module.exports.pairedUser = new NodeCache({ stdTTL: 0, checkperiod: 0 });
