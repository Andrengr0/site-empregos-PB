var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var vagaSchema = new Schema({
    titulo: String,
    categoria: Array,
    experiencia: String,
    descricao: String,
    imagem: String,
    dataCriada: String
},{collection:'vagas'})

var Vagas = mongoose.model("Vagas",vagaSchema);

module.exports = Vagas;