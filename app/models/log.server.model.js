exports = module.exports = function(mongoose) {
	Schema = mongoose.Schema;
	var LogSchema = new Schema({
		send: String,
		recibe: String,
		mensaje: String,
		public:Boolean,
		date:String,
		type:String,
		create:{
			type: Date,
			default: Date.now
		}
	});
	mongoose.model('logs', LogSchema);
}
