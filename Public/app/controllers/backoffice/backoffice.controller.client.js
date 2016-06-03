angular.module('wittyApp')
	.controller('BackOfficeCtrl', function(access, $location, $scope, $http) {
		if (!access.data) {
			$location.path('/');
		} else {
			$scope.getIncompleteProfile = function() {
				$scope.loading = true;
				$http.get('/admin/mailpanel/profile/incomplete').success(function(res) {
					if (res.success) {
						$scope.loading = false;
						$scope.updateComplete = true;
						setInterval(function() {
							$scope.updateComplete = false;
						}, 3);
					}
				});
			};
		}
	});