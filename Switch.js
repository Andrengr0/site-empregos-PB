var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var switchSchema = new Schema({
    estado: String
},{collection:'switch'})

var Switch = mongoose.model("Switch",switchSchema);

module.exports = Switch;