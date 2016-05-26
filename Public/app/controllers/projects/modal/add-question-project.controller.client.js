'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:AddQuestionProjectCtrl
 * @description
 * # AddQuestionProjectCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('AddQuestionProjectCtrl', function (Public_id, Feedbacks, $q, $scope, $location, $rootScope, $state, $http, Upload, Data_project, Users, $modalInstance) {

  $scope.type_project = ['Question', 'Help'];

  function addUsertoFeedbacks(quest) {
    Object.keys(quest).forEach(function (key) {
      quest[key].user = Users.getUserbyId(quest[0].user_id, function(response) {
        quest[key].user = response.profile;
      });
    });
    return (quest);
  };

  //console.log($rootScope.globals.currentUser);

  function addingBadge() {
    if ($rootScope.globals.currentUser.id == $scope.project.creator_user_id) {
      return ("creator");
    } else {
      return ("project member");
    }
  }

  $scope.addquestion = function() {
    $scope.feedbacks.project_id = $scope.project.id;
    $scope.feedbacks.public_id = $scope.project.public_id;
    $scope.feedbacks.creator_img = $rootScope.globals.currentUser.profile_picture_icon;
    $scope.feedbacks.badge = addingBadge();
    $scope.feedbacks.first_name = $rootScope.globals.currentUser.first_name;
    $scope.feedbacks.last_name = $rootScope.globals.currentUser.last_name;
    $scope.feedbacks.url = 'https://www.wittycircle.com' + $location.path();
    Feedbacks.createFeedbacks($scope.feedbacks, function(response) {
      $scope.feedbacks.id = response.insertId;
      $scope.feedbacks.user = $rootScope.globals.currentUser;
      $scope.questions.push($scope.feedbacks);
      $scope.dismiss();
    });
  };

  $scope.dismiss = function() {
    $modalInstance.dismiss();
  };

});
