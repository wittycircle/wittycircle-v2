'use strict';

angular.module('wittyApp').controller('InterestsModalCtrl', function ($modalInstance, $http, $scope, RetrieveData) {

    $scope.saveText     = "Save";

    RetrieveData.getData('/interests', 'GET').then(function(res) {
        $scope.cInterests = res.interests;
    });
    
    $scope.getInterest 	= function(interest) {
    	var object 		= {
    		interest_id 	: interest.id,
    		interest_name 	: interest.name,
    	};

    	$http.post('/interests/add', object).success(function(res) {
        	if (res.success) {
        		$scope.profileVm.getProfileInterest();
            }
        }); 
    };

    $scope.removeInterest = function(index) {
    	$http.delete('/interest/delete/' + index.interest_id).success(function(res) {
        	if (res.success)
          		$scope.profileVm.getProfileInterest();
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