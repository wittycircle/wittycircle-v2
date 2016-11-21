angular.module('wittyApp')
	.controller('welcomeUcCtrl', function($scope, $stateParams) {
		$scope.uc = $stateParams.uc;
	});