'use strict';


angular.module('wittyApp').controller('InvolvmentSheetCtrl', function ($scope, $mdBottomSheet, $rootScope, $http, $timeout) {

  $scope.hasJoined = false;
  $scope.hasDeclined = false;

  $scope.joinProject = function() {
    $http.post('http://127.0.0.1/project/involvment/accepted/' + $scope.project.id + '/' + $rootScope.globals.currentUser.id).then(function(response) {
      $scope.hasJoined = true;
      $scope.editable = true;
      $timeout(function() {
        $scope.dismiss();
      }, 2500);
    });
  }

  $scope.declineProject = function() {
    $http.post('http://127.0.0.1/project/involvment/declined/' + $scope.project.id + '/' + $rootScope.globals.currentUser.id).then(function(response) {
      $scope.hasDeclined = true;
      $scope.hasJoined = true;
      $timeout(function() {
        $scope.dismiss();
      }, 2500);
    });
  }

  $scope.dismiss = function() {
    $mdBottomSheet.hide();
  }

});
