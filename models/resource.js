var mongoose = require('mongoose');
var Schema = mongoose.Schema;

resourceSchema = new Schema( {
        resource_id: Number,
        course: String,
        description: String,
        link: String,
}),
Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;