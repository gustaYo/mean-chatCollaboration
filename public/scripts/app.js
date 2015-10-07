//creamos nuestro modulo llamado app
var AppName = 'meanColaborationApp';

angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_')
        window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [AppName]);
});

var myapp = angular.module(AppName, ["Module.email", "Module.user", 'Module.chess', "Module.chat", "Module.ftp", "ui.router", 'ngResource', 'ngSanitize', 'ngAnimate', 'pascalprecht.translate', 'LocalStorageModule', 'oc.lazyLoad']);

angular.module(AppName).run(
        ['$rootScope', '$location',
            function($rootScope, $state, $stateParams, $location) {

            }
        ]
        ).config(router)
        .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
                $ocLazyLoadProvider.config({
                    cssFilesInsertBefore: 'ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files',           
                    modules: [
                        {
                            name: 'ngResource',
                            files: [
                                '../bower_components/vendor/angular-resource/angular-resource.min.js',
                            ]
                        },
                        {
                            name: 'ui.multiselect',
                            files: [
                                '../bower_components/angular-bootstrap-multiselect/angular-bootstrap-multiselect.js',
                            ]
                        },
                        {
                            name: 'ui.bootstrap',
                            files: [
                                '../bower_components/ui-bootstrap-tpls/ui-bootstrap-tpls-0.13.3.js',
                            ]
                        }
                    ]
                });
            }]);
//router.$inject = ['$stateProvider', '$urlRouterProvider'];

//hacemos el ruteo de nuestra aplicación
function router($stateProvider, $locationProvider, $urlRouterProvider, $translateProvider, localStorageServiceProvider) {
    // For any unmatched url, send to /route1    
    localStorageServiceProvider.setPrefix('email');
    // $locationProvider.hashPrefix('!');
    $urlRouterProvider
            // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
            // Here we are just setting up some convenience urls.
//            .when('/c?id', '/email/:data', '/loguin')

            // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
            .otherwise('/home');
    $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: 'views/home.html'
            })

    $translateProvider.useStaticFilesLoader({
        prefix: '/translations/trans_',
        suffix: '.json'
    });
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.preferredLanguage('es');
}
myapp.controller('menu_control', function($location, $scope, $translate, localStorageService, Authentication, Socket) {
    var value = localStorageService.get('idioma_active');
    if (value != null) {
        $translate.use(value);
    } else {
        localStorageService.add('idioma_active', 'es');
    }
    $scope.changeLanguage = function(key) {
        localStorageService.add('idioma_active', key);
        $translate.use(key);
    };
    $scope.authentication = Authentication.getUser();
    if ($scope.authentication == null) {
        $location.path('/')
    } else {
        $location.path('/home')
    }
    $scope.socket = Socket;
});