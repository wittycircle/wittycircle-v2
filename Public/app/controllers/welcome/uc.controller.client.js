angular.module('wittyApp')
	.controller('welcomeUcCtrl', function($scope, $stateParams, RetrieveData, $location) {
		RetrieveData.ppdData('/networks/verification', 'POST', {uc: $stateParams.uc, token: $stateParams.token}).then(function(passed) {
			if (passed) {
				$scope.uc = $stateParams.uc;
				$(document).ready(function() {
		        	$.getJSON("https://jsonip.com/", function (data) {
		        		RetrieveData.ppdData('/trackIp/add', 'POST', {ip: data.ip, token: $stateParams.token});
		        	});
		        });
				RetrieveData.ppdData('/uc/students/', 'GET', null, $scope.uc, null).then(function(res) {
					if (res.success) {
						$scope.students = res.students;
					} else
						$location.path('/');
				});
			} else
				$location.path('/');
		});
	});