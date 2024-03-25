const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inscritosSchema = new Schema({
    nome: String,
    whatsapp: String,
    cargosInteresse: [String]
},{collection:'inscritos'})  // Mudar para views de produção

const Inscritos = mongoose.model("Inscritos",inscritosSchema);

module.exports = Inscritos;
