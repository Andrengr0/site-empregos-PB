var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var viewsSchema = new Schema({
    date: { 
        type: String, 
        default: () => {
            var date = new Date();
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            return date.toISOString();
        }
    },
    quantidade: Number,
},{collection:'views'})  // Mudar para views de produção

var Views = mongoose.model("Views",viewsSchema);

module.exports = Views;
