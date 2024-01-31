var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var apoiadorSchema = new Schema({
    nome: String,
    link: String,
    imagem: String,
    plano: String,
    statusPayment: String,
    dataCriada: String,
    idUsuario: String,
    idPagamento: String
},{collection:'apoiadores'})

var Apoiadores = mongoose.model("Apoiadores",apoiadorSchema);

module.exports = Apoiadores;