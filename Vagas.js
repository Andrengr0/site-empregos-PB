var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var vagaSchema = new Schema({
    titulo: String,
    empresa: String,
    cidade: String,
    quantidade: String,
    categoria: Array,
    experiencia: String,
    modelo: String,
    descricao: String,
    salario: String,
    link: String,
    contato: String,
    imagem: String,
    dataCriada: String,
    slug: String,
    idUsuario: String,
    usuarioType: Boolean
},{collection:'vagas'})

var Vagas = mongoose.model("Vagas",vagaSchema);

module.exports = Vagas;