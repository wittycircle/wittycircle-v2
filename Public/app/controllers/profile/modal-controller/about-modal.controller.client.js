'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:AboutModalCtrl
 * @description
 * # AboutModalCtrl
 * Controller of the wittyApp
 **/
angular.module('wittyApp').controller('AboutModalCtrl', function (Users, $timeout, $modalInstance, $http, $location, $scope, Profile, $rootScope, $stateParams, Experiences, Skills, Interests) {

    $scope.aButton          = "Save";
    if ($scope.profileVm.profile.about)
      $scope.aboutText      = $scope.profileVm.profile.about;
    else
      $scope.aboutText      = "join projects";
    $scope.aboutDescription = $scope.profileVm.profile.description;

    $scope.getAboutText     = function(text) {
      $scope.aboutText      = text.toLowerCase();
    };

    $scope.saveAbout        = function() {
      var profileData       = {
        about       : $scope.aboutText,
        description : $scope.aboutDescription,
      };
      if (profileData.about) {
        $http.put('/signup/about', profileData).success(function(res) {
          if (res.success) {
            $scope.aButton  = "Saved";
            $scope.profileVm.getProfileInfo();
            $timeout(function() {
              $modalInstance.dismiss();
            }, 500);
          }
        });
      } else
        console.log("ERROR!");
    };

    $scope.dismiss          = function () {
      $modalInstance.dismiss();
    };

    // $scope.getAbout = function () {
    //   var ret;

    //   Profile.getUserbyUsername($stateParams.username).then(function(response) {
    //     if (response) {
    //       $scope.about = response.profile[0].description;
    //     } else {
    //       ret = "Error trying to get the profile description";
    //     }
    //   });
    // };

    // $scope.dismiss = function () {
    //   $modalInstance.dismiss();
    // };

    // $scope.saveAbout = function() {
    //   var profileData = {};
    //   profileData.description = $scope.data_about;
    //   $scope.profile.description = $scope.data_about;
    //   Users.updateUser($rootScope.globals.currentUser.id, profileData, function (response) {
    //     console.log(response);
    //     $modalInstance.dismiss();
    //   })
    // };
    // /*
    // **END ABOUT
    // */

});
