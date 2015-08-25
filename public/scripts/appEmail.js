angular.module('uiRouter.email', ["ui.router", "datatables", 'ngResource', 'ngCkeditor', 'ngTagsInput', 'ngSanitize', 'ngAnimate'])
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider) {
                        $stateProvider
                                .state('email', {
                                    url: "/email",
//                                    abstract: true,
                                    templateUrl: "views/email.html",
                                })
                                .state('email.list', {
                                    url: '/{data}',
                                    templateUrl: 'views/lista.html',
                                    controller: 'appController',    
                                })
                                .state('email.redact', {
                                    url: '/redact/{data}',
                                    views: {
                                        '': {
                                            templateUrl: 'views/redact.html',
                                            controller: 'redactaController',
                                        }
                                    }
                                })

                    }
                ]
                );
