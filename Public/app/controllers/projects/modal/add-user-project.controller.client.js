'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:AddUserProjectCtrl
 * @description
 * # AddUserProjectCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('AddUserProjectCtrl', function ($q, $scope, $rootScope, $state, $http, Upload, Data_project, Users, $modalInstance) {

  $scope.searchUsers = function () {
    Users.getUsers().then(function (resource) {
      //console.log(resource);
      $scope.users = resource;
    });
  };

  function isDouble(user) {
    var ret = false;
    Object.keys($scope.involved_users).forEach(function (key) {
      if ($scope.involved_users[key].id == user.id) {
        ret = true;
      }
    });
    if ($rootScope.globals.currentUser.id === user.id) {
      ret = true;
    }
    return ret;
  };

  $scope.goinvite = function (user) {
    var data = {};

    data.project_id = $scope.project.id;
    data.user_id = user.id;
    if (isDouble(user) == false) {
      $http.post('/project/involve', data).then(function (response) {
        //console.log(response);
      });
      user.profile[0].n_read = 0;
      setTimeout(function(){
        $scope.involved_users.push(user.profile[0]);
      }, 200);
    }

    data = undefined;
    setTimeout(function(){
      $scope.dismiss();
    }, 300);
  }

  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

});
