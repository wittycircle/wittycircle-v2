angular.module('wittyApp')
	.controller('welcomeUcCtrl', function($scope, $stateParams, RetrieveData, $location) {
		RetrieveData.ppdData('/networks/verification', 'POST', {ucUrl: $stateParams.uc, token: $stateParams.token}).then(function(passed) {
			if (passed.success) {
				$scope.uc = $stateParams.uc;
				$(document).ready(function() {
		        	$.getJSON("https://jsonip.com/", function (data) {
		        		RetrieveData.ppdData('/trackIp/add', 'POST', {ip: data.ip, token: $stateParams.token});
		        	});
		        });
				RetrieveData.ppdData('/uc/students/', 'GET', null, passed.uc_name, null).then(function(res) {
					if (res.success) {
						console.log(res);
						$scope.students = res.students;
					} else
						$location.path('/');
				});
			} else
				$location.path('/');
		});
	});