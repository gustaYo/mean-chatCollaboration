angular.module('Module.user', ["ui.router", 'ngSanitize', 'ngAnimate', 'permission'])
        .run(function(Permission, Authentication) {
            // Define anonymous role
//            https://github.com/Narzerus/angular-permission
                    Permission.defineRole('anonymous', function(stateParams) {
                        if (!Authentication.isLoggedIn()) {
                            return true; // Is anonymous
                        }
                        return false;
                    });
        })
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider, $location) {
                        $stateProvider
                                .state('user', {
                                    url: '/user',
                                    data: {
                                        permissions: {
                                            except: ['anonymous'],
                                            redirectTo: 'loguin'
                                        }
                                    },
                                    templateUrl: 'views/user.html',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load([
                                                    {
                                                        name: 'Module.user',
                                                        files: [
                                                            'scripts/controllers/userController.js',
                                                        ]
                                                    },
                                                    'ui.bootstrap',
                                                ]);
                                            }]
                                    }
                                })
                                .state('loguin', {
                                    url: '/loguin',
                                    templateUrl: 'views/loguin.html',
                                    controller: 'userController',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load([
                                                    {
                                                        name: 'Module.user',
                                                        files: [
                                                            'scripts/controllers/userController.js',
                                                        ]
                                                    }
                                                ]);
                                            }]
                                    }
                                })
                                .state('reset_password', {
                                    url: '/loguin',
                                    templateUrl: 'views/rest-password.html',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load([
                                                    {
                                                        name: 'Module.user',
                                                        files: [
                                                            'scripts/controllers/userController.js',
                                                        ]
                                                    }
                                                ]);
                                            }]
                                    }
                                })
                                .state('register_user', {
                                    url: '/loguin',
                                    templateUrl: 'views/register-user.html',
                                    controller: 'userController',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load([
                                                    {
                                                        name: 'Module.user',
                                                        files: [
                                                            'scripts/controllers/userController.js',
                                                        ]
                                                    }
                                                ]);
                                            }]
                                    }
                                })
                    }
                ]);
angular.module('Module.user').controller('TabsDemoCtrl', function($scope, $window, $http) {
    $scope.selected = '';
    $scope.states = ['Cuba', 'EE.UU', 'Venezuela', 'Espanna', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
});