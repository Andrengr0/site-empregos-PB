var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var usuarioSchema = new Schema({
    nome: String,
    email: String,
    senha: String,
    codigoRecuperacao: String
},{collection:'usuarios'})

var Usuarios = mongoose.model("Usuarios",usuarioSchema);

module.exports = Usuarios;