angular.module('Module.chat', ["ui.router", 'ngSanitize', 'ngAnimate'])
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider) {
                        $stateProvider
                                .state('chat', {
                                    url: '/chat',
                                    data: {
                                        permissions: {
                                            except: ['anonymous'],
                                            redirectTo: 'loguin'
                                        }
                                    },
                                    templateUrl: 'views/chat.html',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load([
                                                    {
                                                        name: 'Module.chat', // local
                                                        files: [
                                                            'scripts/controllers/chatController.js',
                                                            'scripts/controllers/chatAudioVideoController.js',
                                                            '../bower_components/bootbox.js',
                                                            '../bower_components/jquery-ui/jquery-ui.min.js',
                                                            'scripts/directives/pagination.js',
                                                            'scripts/directives/ngThumb.js'
                                                        ]
                                                    },
                                                    {
                                                        name: AppName, // local
                                                        files: [
                                                            'scripts/services/sharedModel.js',
                                                        ]
                                                    },
                                                    'ui.bootstrap',
                                                    {
                                                        name: 'angularFileUpload',
                                                        files: [
                                                            '../bower_components/angular-file-upload/lib/angular-file-upload.js',
                                                            '../bower_components/angular-file-upload/lib/angular-file-upload-shim.js'
                                                        ]
                                                    },
                                                    {
                                                        name: 'ui.sortable',
                                                        files: [
                                                            '../bower_components/angular-ui-sortable/sortable.min.js'
                                                        ]
                                                    }
                                                ]);
                                            }]
                                    }
                                })
                                .state('chat.newsala', {
                                    url: '/n',
                                    templateUrl: 'views/chat_newSala.html',
                                    controller: 'salaCtrl',
                                })
                                .state('chat.listsala', {
                                    url: '/r/{data}',
                                    templateUrl: 'views/chatList.html',
                                    controller: 'salaCtrl',
                                })
                    }
                ]
                );
