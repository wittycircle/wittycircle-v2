'use strict';

angular.module('wittyApp').controller('ValidateNetworkCtrl', 
	function ($scope, $http, access, $interval, $stateParams, $location, Beauty_encode) {
		$scope.second = 3;

		var projectInfo = {};
		$http.get('/project/network/validated/' + $stateParams.token).success(function(res) {
			$scope.first_name = res.first_name;
			projectInfo.title = res.title;
			projectInfo.public_id = res.public_id;
			$scope.show = true;
		});

		function updateCounter() {
			$scope.second--;
			if ($scope.second === 0) {
				$location.path('/project/' + projectInfo.public_id + '/' + Beauty_encode.encodeUrl(projectInfo.title)).replace();
			}
		};

		$interval(updateCounter, 1000);
	});