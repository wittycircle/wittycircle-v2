angular.module('wittyApp')
	.controller('welcomeUcCtrl', function($scope, $stateParams, RetrieveData, $location) {
		$scope.uc = $stateParams.uc;
		RetrieveData.ppdData('/uc/students/', 'GET', null, $scope.uc, null).then(function(res) {
			if (res.success) {
				$scope.students = res.students;
			} else
				$location.path('/');
		});	
	});