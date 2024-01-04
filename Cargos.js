var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var cargoSchema = new Schema({
    cargo: String
},{collection:'cargos'})

var Cargos = mongoose.model("Cargo",cargoSchema);

module.exports = Cargos;