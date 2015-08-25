exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
    var EmailSchema = new Schema({
        Body: String,
        Subject: String,
        date:{
            type: Date,
            default: Date.now
        },
        FromName: String,
        AddAddress: new Array(),
    });
    mongoose.model('emails', EmailSchema);
}


