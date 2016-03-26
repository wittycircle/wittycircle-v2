'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:AddUserProjectCtrl
 * @description
 * # AddUserProjectCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('DeleteProjectCtrl', function ($scope, $rootScope, $state, $http, $modalInstance, Projects, $location, $timeout) {

  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

  $scope.goDeleteIt = function () {
    Projects.deleteProject($scope.project.id, function(response) {
      console.log('project is delete');
    });
    $scope.dismiss();
    $timeout(function () {
      $location.path('/');
    }, 500);
  }

});
