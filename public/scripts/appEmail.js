angular.module('Module.email', ["ui.router", 'ngSanitize', 'ngAnimate', 'ngTagsInput'])
        
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider) {
                        $stateProvider
                                .state('email', {
                                    url: "/email",
                                    data: {
                                        permissions: {
                                            except: ['anonymous'],
                                            redirectTo: 'loguin'
                                        }
                                    },
//                                    abstract: true,
                                    templateUrl: "views/email.html",
                                    controller: 'appController',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load(
                                                        {
                                                            name: 'Module.email',
                                                            files: [
                                                                'scripts/controllers/emailController.js',
                                                                'scripts/services/email.js',
                                                            ]
                                                        },
                                                {
                                                    name: 'ngResource',
                                                });
                                            }]
                                    }
                                })
                                .state('email.list', {
                                    url: '/{data}',
                                    templateUrl: 'views/lista.html',
//                                    controller: 'appController',
                                })
                                .state('email.redact', {
                                    url: '/redact/{data}',
                                    views: {
                                        '': {
                                            templateUrl: 'views/redact.html',
                                            controller: 'redactaController',
                                        }
                                    },
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load({
                                                    name: 'ngCkeditor',
                                                    files: [
                                                        '../bower_components/ng-ckeditor-master/libs/ckeditor/ckeditor.js',
                                                        '../bower_components/ng-ckeditor-master/ng-ckeditor.css',
                                                        '../bower_components/ng-ckeditor-master/src/scripts/02-directive.js'
                                                    ]
                                                }
                                                );
                                            }]
                                    }
                                })

                    }
                ]
                );
