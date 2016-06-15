angular.module('wittyApp')
	.controller('BackOfficeCtrl', function(access, $location, $scope, $http) {
		if (!access.data) {
			$location.path('/');
		} else {
			$scope.getUpdateMail = function(value) {
				var url;

				if (value && value === "all")
					url = '/admin/mailpanel/profiles';
				if (value && value === "experience")
					url = '/admin/mailpanel/profile/incomplete/experience';
				if (value && value === "skill")
					url = '/admin/mailpanel/profile/incomplete/skill';
				if (value && value === "about")
					url = '/admin/mailpanel/profile/incomplete/about';
				if (value && value === "pProject")
					url = '/admin/mailpanel/project/incomplete/picture';
				if (value && value === "tProject")
					url = '/admin/mailpanel/project/incomplete/post';
				if (value && value === "tpProject")
					url = '/admin/mailpanel/project/incomplete/pp';
				if (value && value === "prProject")
					url = '/admin/mailpanel/project/incomplete/private';
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

			$http.get('/admin/list/profiles/complete').success(function(res) {
				if (res.success) {
					$scope.lists = res.list;
				}
			});
		}
	});
