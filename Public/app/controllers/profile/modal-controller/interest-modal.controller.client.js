'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:InterestsModalCtrl
 * @description
 * # InterestsModalCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('InterestsModalCtrl', function ($modalInstance, $http, $location, $scope, Profile, $rootScope, $stateParams, Experiences, Skills, Interests) {

    $scope.saveText     = "Save";
    
    $scope.getInterest 	= function(interest) {
    	var object 		= {
    		interest_id 	: interest.id,
    		interest_name 	: interest.name,
    	};

    	$http.post('/interests/add', object).success(function(res) {
        	if (res.success)
        		$scope.getProfileInterest();
        }); 
    };

    $scope.removeInterest = function(index) {
    	console.log(index);
    	$http.delete('/interest/delete/' + index.interest_id).success(function(res) {
        	if (res.success)
          		$scope.getProfileInterest();
      	});
    };

    $scope.saveInterest    = function() {
        $scope.saveText = "Saved";
        setTimeout(function(){
            $modalInstance.dismiss();
        }, 500);
    };

    $scope.dismiss = function () {
      $modalInstance.dismiss();
    };
});