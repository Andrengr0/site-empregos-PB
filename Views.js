var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var { utcToZonedTime, format } = require('date-fns-tz');

var viewsSchema = new Schema({
    date: { 
        type: String, 
        default: () => {
            var date = new Date();
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);
            var zonedDate = utcToZonedTime(date, 'America/Fortaleza');
            return format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: 'America/Fortaleza' });
        }
    },
    quantidade: Number,
},{collection:'views2'})

var Views = mongoose.model("Views",viewsSchema);

module.exports = Views;
