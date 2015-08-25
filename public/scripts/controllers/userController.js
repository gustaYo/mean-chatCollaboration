'use strict';

/**
 * @ngdoc function
 * @name email_angular.controller:userController
 * @description
 * # userController
 * Controller of the myApp
 */
angular.module('myapp').controller('userController', userController);
function userController($scope, $window, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
        $location.path('/');
    $scope.error = '';
    $scope.registerUser = function() {
        $http.post('/auth/signup', $scope.usuario).success(function(response) {
            //If successful we assign the response to the global user model
            $scope.authentication.user = response;
            //And redirect to the index page
            window.location.reload();
        }).error(function(response) {
            $scope.error = response.message;
        });
    }
    $scope.loguinUser = function() {
        $http.post('/auth/signin', $scope.usuario).success(function(response) {
            //If successful we assign the response to the global user model
            $scope.authentication.user = response;
            window.user=response;
            //And redirect to the index page
            window.location.reload()
        }).error(function(response) {
            $scope.error = response.message;
        });
    }

}