angular.module('wittyApp')
	.controller('BackOfficeStatisticCtrl', function($http, $location, $rootScope, $scope, $sce) {

		var currentUser = $rootScope.globals.currentUser || false;

		if (currentUser.moderator) {
			$http.get('/messages/get/all/message').success(function(res) {
				$scope.messages = res;
			});

			$scope.transformHtml = function(html) {
		 		return $sce.trustAsHtml(html);
		 	};
		} else
			$location.path('/').replace();
	});