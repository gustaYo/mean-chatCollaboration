exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
    var FTPSchema = new Schema({
        name: {
            type: String,
            unique: true,
            required: 'Name is required',
            trim: true
        },
        user: String,
        pass: String,
        uri: String,
        dirscan: String,
        update: {
            type: Date,
            default: Date.now
        },
        create: {
            type: Date,
            default: Date.now
        }
        //files:[]
    });
    mongoose.model('ftps', FTPSchema);
    var FileFtpSchema = new Schema(
            {
                name: String,
                extname: String,
                directory: String,
                ftp: {type: Schema.Types.ObjectId, ref: 'ftps'},
                size: String,
                time: String
            });
    mongoose.model('ftpfiles', FileFtpSchema);

}