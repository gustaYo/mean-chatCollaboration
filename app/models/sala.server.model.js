exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
    var SalaSchema = new Schema({
       name: {
            type: String,
            unique: true,
            required: 'Name is required',
            trim: true
        },
        description: String,
        date:{
            type: Date,
            default: Date.now
        },
        create: String,
        listUsers: new Array(),
    });
    mongoose.model('salas', SalaSchema);
}
