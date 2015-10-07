crypto = require('crypto')
exports = module.exports = function(mongoose) {
    Schema = mongoose.Schema;
//    var usuario_grupo = new Schema({
//        alias: {
//            type: String,
//            default: "",
//        },
//        username: {
//            type: String,
//        },
//        created: {
//            type: Date,
//            default: Date.now
//        }
//    });
//    var grupo = new Schema({
//        name: {
//            type: String,
//            default: "constacts",
//            trim: true,
//            sparse: true,
//            unique: false // super importante 
//        },
//        open: {
//            type: Boolean,
//            default: true
//        },
//        created: {
//            type: Date,
//            default: Date.now
//        },
//        users: [usuario_grupo]
//    })

    var UserSchema = new Schema({
        firstName: String,
        lastName: String,
        email: {
            type: String,
            match: [/.+\@.+\..+/, "Please fill a valid email address"]
        },
        username: {
            type: String,
            unique: true,
            required: 'Username is required',
            trim: true
        },
        password: {
            type: String,
            validate: [
                function(password) {
                    return password && password.length > 3;
                }, 'Password should be longer'
            ]
        },
        salt: {
            type: String
        },
        provider: {
            type: String,
            required: 'Provider is required'
        },
        urlimg: {
            type: String,
            default: 'img/avatars/usuario.jpg'
        },
        providerData: {},
        created: {
            type: Date,
            default: Date.now
        },
        convAbiertas: {
            type: Array,
            default: ['all']
        },
//        grups: [grupo],
        grups: [],
        peti: [] // peticiones de amistad
    });

// Hook a pre save method to hash the password
    UserSchema.pre('save', function(next) {
        if (this.password) {
            this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
            this.password = this.hashPassword(this.password);
        }
        this.grups = [{
                open: true,
                users: [],
                name: "Contacts"
            }]
        next();
    });

// Create instance method for hashing a password
    UserSchema.methods.hashPassword = function(password) {
        if (password && this.salt) {
            return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
        }
    };

// Create instance method for authenticating user
    UserSchema.methods.authenticate = function(password) {
        return this.password === this.hashPassword(password);
    };

    mongoose.model('User', UserSchema);
}

