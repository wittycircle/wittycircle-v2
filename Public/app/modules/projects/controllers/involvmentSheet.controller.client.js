'use strict';


angular.module('wittyProjectModule').controller('InvolvmentSheetCtrl', function ($scope, $mdBottomSheet, $rootScope, $http, $timeout) {

  $scope.hasJoined = false;
  $scope.hasDeclined = false;

  $scope.joinProject = function() {
    $http.post('/project/involvment/accepted/' + $scope.project.id + '/' + $rootScope.globals.currentUser.id).then(function(response) {
      $scope.hasJoined = true;
      $scope.editable = true;
      $timeout(function() {
        $scope.dismiss();
      }, 2500);
    });
  }

  $scope.declineProject = function() {
    $http.post('/project/involvment/declined/' + $scope.project.id + '/' + $rootScope.globals.currentUser.id).then(function(response) {
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
