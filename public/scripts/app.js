//creamos nuestro modulo llamado app
angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_')
        window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, ['myapp']);
});

var myapp = angular.module('myapp', ["uiRouter.email", "uiRouter.loguin", "uiRouter.chat", "ui.router", "datatables", 'ngResource', 'ngCkeditor', 'ngTagsInput', 'ngSanitize', 'ngAnimate', 'pascalprecht.translate', 'ngCookies', 'LocalStorageModule', 'ui.bootstrap','angularFileUpload']);
var translation = new Array()
angular.module('myapp').run(
        ['$rootScope', '$state', '$stateParams',
            function($rootScope, $state, $stateParams) {
            }
        ]
        ).config(router);
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
//    $translateProvider.translations('en', {
//        TITLE: 'Hello',
//        FOO: 'This is a paragraph.',
//        BUTTON_LANG_EN: 'english',
//        BUTTON_LANG_DE: 'german'
//    });
//    $translateProvider.translations('es', {
//        TITLE: 'Hola mundo',
//        FOO: 'Dies ist ein Paragraph.',
//        BUTTON_LANG_EN: 'englisch',
//        BUTTON_LANG_DE: 'deutsch'
//    });

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
    $scope.authentication = Authentication;
    if ($scope.authentication.user == null) {
        $location.path('/')
    }
    $scope.socket = Socket;
});