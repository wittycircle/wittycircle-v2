'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:MyProjectCtrl
 * @description
 * # MyProjectCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('MyProjectCtrl', function (get_CategoryName, Beauty_encode, Project_Follow, $stateParams, Feedbacks, $location, $scope, $rootScope, $state, $http, Upload, Data_project, Users, $modal, Projects, Categories) {

  $scope.backPic = $rootScope.globals.currentUser.profile_cover;

  $scope.encodeUrl = function(url) {
    url = Beauty_encode.encodeUrl(url);
    return url;
  }

  var new_array = [];

  /*function getNumberofProjects(array) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
      count++;
    }
    return count;
  }*/

  $scope.goToStart = function() {
    $state.go('main', {tagStart: true});
  };

  //Put this to respective service because i think we can need it at other parts
  function addUsertoProjects(proj) {
    Object.keys(proj).forEach(function (key) {
      proj[key].user = Users.getUserbyId(proj[key].creator_user_id, function(response) {
        proj[key].user = response.profile;
      });
    });
    return (proj);
  };

  function addCategoryNametoProjects(proj) {
    Object.keys(proj).forEach(function (key) {
      proj[key].category_name = get_CategoryName.get_Name(proj[key].category_id, function(response) {
        proj[key].category_name = response;
      });
    });
    return (proj);
  };

  function createArraybyProjectId(proj_id) {
    var new_project;
    var error_message;
    var count;

    count = 0;
    error_message = "";
    new_project = [];

    Object.keys(proj_id).forEach(function (key) {
      Projects.getProjectbyId(proj_id[key].project_id, function(response) {
          if (response[0] == undefined) {
            error_message = "no project found";
            //proj_id = proj_id.slice(key);
          }
          else {
            new_project[key] = response[0];
            new_project[key].visited_at = proj_id[key].date;
            new_project[key].category_name = get_CategoryName.get_Name(response[0].category_id, function(response) {
              new_project[key].category_name = response;
            });
          }
      });
    });
    return (new_project);
  };
  //Yes this

  $scope.getMyProject = function() {
    var error_message;

    if (!$rootScope.globals.currentUser) {
      error_message = "You don't have access to this area while you're not logged in";
      $location.path('/');
      return error_message;
    } else {
      Projects.getUserProject($rootScope.globals.currentUser.id, function(response) {
          if (!response[0]) {
            Projects.getProjectsInvolvedByUser($rootScope.globals.currentUser.id, function (response) {
              if (!response[0]) {
                $scope.numberofprojects = 0;
                $scope.myprojects = false;
                return;
              } else {
                $scope.myprojects = response;
                $scope.myprojects = addUsertoProjects($scope.myprojects);
                $scope.myprojects = addCategoryNametoProjects($scope.myprojects);
              }
            });
          }
          else {
            $scope.myprojects = response;
            $scope.myprojects = addUsertoProjects($scope.myprojects);
            $scope.myprojects = addCategoryNametoProjects($scope.myprojects);
            /*Projects.getProjectsInvolvedByUser($rootScope.globals.currentUser.id, function (resi) {
              for (var i = 0; i < resi.length; i++) {
                $scope.myprojects.push(resi[i]);
              }
              $scope.myprojects = addUsertoProjects($scope.myprojects);
              $scope.myprojects = addCategoryNametoProjects($scope.myprojects);
            });*/
          }
      });
    }
  }; $scope.getMyProject();

  $scope.getProjectFollowed = function() {
    if($rootScope.globals.currentUser.username) {
        Project_Follow.getFollowedProject($rootScope.globals.currentUser.username, function(response) {
          $scope.projectFollowed = response.data;
          $scope.projectFollowed = addUsertoProjects($scope.projectFollowed);
        });
    }
  }; $scope.getProjectFollowed();

  $scope.getProjectHistory = function() {
    if ($rootScope.globals.currentUser) {
      $http.get('http://127.0.0.1/history/project/'+ $rootScope.globals.currentUser.id).then(function (response) {
        $scope.project_history = createArraybyProjectId(response.data);
        //$scope.project_history = addCategoryNametoProjects(createArraybyProjectId(response.data));
      });
    }
  };;

  function getProjectsInvolvedByUser() {
    if ($rootScope.globals.currentUser) {
      Projects.getProjectsInvolvedByUser($rootScope.globals.currentUser.id, function (response) {
        console.log(response);
        console.log($scope.myprojects);
        $scope.myprojects.push(response);
      })
    }
  };

});
