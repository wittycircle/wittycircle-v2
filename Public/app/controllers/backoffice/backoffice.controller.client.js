angular.module('wittyApp')
	.controller('BackOfficeCtrl', function(access, $location, $scope, $http) {
		if (!access.data) {
			$location.path('/');
		} else {
			$scope.getUpdateMail = function(value) {
				var url;

				if (value && value === "all")
					url = '/admin/mailpanel/profiles';
				if (value && value === "profile")
					url = '/admin/mailpanel/profile/incomplete';
				if (value && value === "pProject")
					url = '/admin/mailpanel/project/incomplete/picture';
				if (value && value === "tProject")
					url = '/admin/mailpanel/project/incomplete/post';
				if (value && value === "tpProject")
					url = '/admin/mailpanel/project/incomplete/pp';
				if (value && value === "upvote")
					url = '/admin/mailpanel/upvote';

				$scope.loading = true;
				$http.get(url).success(function(res) {
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
