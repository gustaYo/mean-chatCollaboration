'use strict';
/**
 * @ngdoc service
 * @name myapp.users
 * @description
 * # Todo
 * Factory in the emailANGULAR.  GUstavo Crespo Sanchez gcrespo@uci.cu
 */
angular.module(AppName)
        .factory('sharedValues', function() {
    // private stuff
    var model = {
        value: {}
    };
    // public API
    return {
        getValue: function(value) {
            if(typeof model[value] =='undefined'){
                model[value]={}
            }
            return model[value];
        },
        updateValue: function(value,data) {
            model[value] = data;
             return model[value];
        }
    };
});