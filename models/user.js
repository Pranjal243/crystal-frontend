var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {

        unique_id: Number,
        firstname: String,
        lastname: String,
        fathername: String,
        mothername: String,
        XIIyear: String,
        medium: String,
        aspirant:String,
        schoolname: String,
        street: String,
        locality: String,
        pincode: String,
        district: String,
        phone: String,
        password: String,
        email: String
}),
User = mongoose.model('User', userSchema);

module.exports = User;