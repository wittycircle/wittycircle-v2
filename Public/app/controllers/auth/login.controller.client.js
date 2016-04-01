'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('LoginCtrl', function ($cookieStore, $window, $scope, Authentication, $rootScope) {

   // $scope.dismiss = function () {
   //   $modalInstance.dismiss();
   // };

  $scope.lef = true;
  $scope.lpf = true;
  $scope.lf  = true;

  $scope.login = function() {

    if (!$scope.email)
      $scope.lef = false;
    else
      $scope.lef = true;
    if (!$scope.password)
      $scope.lpf = false;
    else
      $scope.lpf = true;

    if (!$scope.lpf || !$scope.lef)
      return ;

   	Authentication.Login($scope.email, $scope.password, function (response) {
   		if (response.success) {
   			Authentication.SetCredentials(response.user.email, response.user.id, response.user.profile_id, response.user.username, function(res) {
          if (res.success)
            window.location.href = "http://localhost:9000";
        });
   		} else {
   			$scope.lf = false;
   		}
   	});
  };
});
