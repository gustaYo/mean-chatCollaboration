angular.module('uiRouter.loguin', ["ui.router", 'ngResource', 'ngCkeditor', 'ngTagsInput', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'])
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider) {
                        $stateProvider
                                .state('user', {
                                    url: '/user',
                                    templateUrl: 'views/user.html',
                                })
                                .state('loguin', {
                                    url: '/loguin',
                                    templateUrl: 'views/loguin.html',
                                     controller: 'userController',
                                })
                                .state('reset_password', {
                                    url: '/loguin',
                                    templateUrl: 'views/rest-password.html',
                                })
                                .state('register_user', {
                                    url: '/loguin',
                                    templateUrl: 'views/register-user.html',
                                    controller: 'userController',
                                })
                    }
                ]
                );
angular.module('uiRouter.loguin').controller('TabsDemoCtrl', function($scope, $window, $http) {
    $scope.selected = '';
    $scope.states = ['Cuba', 'EE.UU', 'Venezuela', 'Espanna', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
});