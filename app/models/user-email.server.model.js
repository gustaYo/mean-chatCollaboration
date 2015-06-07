// relaciona un email a uno a varios usuarios
exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
    var Email = mongoose.model('emails');
    var UserEmailSchema = new Schema({
        state: String,
        bandeja: String,
        user: String,
        email: {type: Schema.Types.ObjectId, ref: 'emails'}
    });
    mongoose.model('useremails', UserEmailSchema);
}
