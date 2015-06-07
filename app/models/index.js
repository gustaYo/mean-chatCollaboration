
module.exports = function(mongoose) {
    require('./user.server.model')(mongoose);
    require('./email.server.model')(mongoose);
    require('./user-email.server.model')(mongoose);
}

