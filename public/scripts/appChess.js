angular.module('Module.chess', ["ui.router", 'ngSanitize', 'ngAnimate'])
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider, $location) {
                        $stateProvider
                                .state('chess', {
                                    url: '/chess',
                                    data: {
                                        permissions: {
                                            except: ['anonymous'],
                                            redirectTo: 'loguin'
                                        }
                                    },
                                    templateUrl: 'views/chess.html',
                                    controller: 'chessController',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load(
                                                        {
                                                            name: AppName,
                                                            files: [
                                                                '../bower_components/chessboardjs-0.3.0/css/chessboard-0.3.0.min.css',
                                                                '../bower_components/chessboardjs-0.3.0/js/chess.js',
                                                                '../bower_components/chessboardjs-0.3.0/js/json3.js',
                                                                '../bower_components/chessboardjs-0.3.0/js/chessboard-0.3.0.js',
                                                                '../bower_components/reloj.js',
                                                                'scripts/controllers/chessController.js'
                                                            ]
                                                        }

                                                );
                                            }]
                                    }
                                })
                    }
                ]
                );
