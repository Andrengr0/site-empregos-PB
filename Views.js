var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var viewsSchema = new Schema({
    quantidade: Number,
},{collection:'views'})

var Views = mongoose.model("Views",viewsSchema);

module.exports = Views;