'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:Signup_modalCtrl
 * @description
 * # Signup_modalCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('Signup_modalCtrl', function ($http, $location, $scope, $state, Authentication, Data_auth) {

    $scope.formData = {};

    // var createUsername = function (first_name, last_name) {
    //   var username;
    //   var random_number;

    //   random_number = Math.floor((Math.random() * 10000) + 1);
    //   username = first_name + last_name + random_number;

    //   return username;
    // };

    // $scope.fbSignUp = function () {

    //   $http.get('/auth/facebook')
    //     .success(function(res) {
    //       console.log(res);
    //     });
    // }
    $scope.fnf = true;
    $scope.lnf = true;
    $scope.emf = true;
    $scope.pwf = true;

    $scope.$watch('formData.password', function(value) {
      if (!value) {
        $scope.week   = false;
        $scope.okey   = false;
        $scope.strong = false;
      } else {
        if (value.length >= 1 && value.length < 6) {
          $scope.week   = true;
          $scope.okey   = false;
          $scope.strong = false;
        }
        if (value.length >= 6 && value.length <= 10) {
          $scope.week   = false;
          $scope.okey   = true;
          $scope.strong = false;
        }
        if (value.length >= 11) {
          $scope.week   = false;
          $scope.okey   = false;
          $scope.strong = true;
        }
      }
    });

    $scope.signupto = function () {
        console.log('ici');
      // var username = createUsername($scope.formData.first_name, $scope.formData.last_name);
      // $scope.formData.username = username;
      $scope.eat = false;
      if ($scope.formData) {
        if (!$scope.formData.first_name)
          $scope.fnf = false;
        else
          $scope.fnf = true;
        if (!$scope.formData.last_name)
          $scope.lnf = false;
        else
          $scope.lnf = true;
        if (!$scope.formData.email)
          $scope.emf = false;
        else
          $scope.emf = true;
        if (!$scope.formData.password)
          $scope.pwf = false;
        else
          $scope.pwf = true;
        if (!$scope.fnf || !$scope.lnf || !$scope.emf || !$scope.pwf)
          return ;
      }

      $http.post('/users', $scope.formData).success(function(res) {
        if (!res.success) {
          $scope.eat = true;
        } else {
          Authentication.Login($scope.formData.email, $scope.formData.password, function (response) {
            if (response.success) {
              $scope.closeModal = true;
              Authentication.SetCredentials(response.user.email, response.user.id, response.user.profile_id, response.user.username, response.user.moderator, response.user.ambassador, function(done) {
                $scope.formData = [];
                $state.go('signup', {tagCheckFirst: true});
              });
            } else {
              console.log('error for login');
            }
          })
        }
        Data_auth.addData($scope.formData);
      }).error(function (response) {
        console.log('error');
      });
    };

    $scope.$watch('closeModal', function(value) {
      var filter = $("#page-wrap");
      var x = $(window).height();
      var margeS = (x - 600)/2/2;

      if (value) {
        filter.fadeOut(500);
          $('#main-signup-modal').animate({top: '-700px'}, 400, function() {
            $('#main-signup-modal').hide(100, function() {
              $('#main-signup-modal').css({'top': margeS.toString() + "px"});
            });
          });
      }
    });

    // $scope.dismiss = function() {
    //   $modalInstance.dismiss();
    // }

  });
