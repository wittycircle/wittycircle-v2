angular.module('wittyApp')
	.controller('RankCtrl', function($http, $location, $scope, $rootScope, $timeout, RetrieveData) {

		var currentUser = $rootScope.globals.currentUser || null;

		if (currentUser) {
			
			/*** BACKGROUND ***/
			$scope.backPic = $rootScope.globals.currentUser.profile_cover;
			$scope.mailList = [];
			$scope.inviteW = "Invite";

			$scope.initRanking = function() {
				$http.get('/rank/statistic').success(function(res) {
					if (res.success)
						$scope.pRank = res.data;
				});

				$http.post('/rank/statistic', { user_id: currentUser.id }).success(function(res) {
					if (res.success) {
						$scope.myRank = res.rank;
						$scope.myCompareRank = res.compareR;
					}
				});
			};
			$scope.initRanking();

			/***	EVENT	***/
			$scope.displayInvite = function() {	
		 		if ($scope.dInvite)
		 			$scope.dInvite = false;
		 		else
		 			$scope.dInvite = true;
		 	};

		 	$scope.addEmailToList = function(keycode, email) {
		 		if (keycode === 13 && !email) {
		 			$scope.errorMail = true;
		 			return ;
		 		}
		 		if (keycode == 13 && email) {
		 			$scope.errorMail = false;
		 			$scope.mailList.push(email);
		 			$scope.email = [];
		 		}
		 	};

		 	$scope.removeMailFromList = function(index) {
		 		$scope.mailList.splice(index, 1);
		 	};

		 	$scope.sendInvitation = function() {
		 		if ($scope.mailList[0]) {
		 			RetrieveData.ppdData('/invitation/new', "POST", {user_id: currentUser.id, mailList: $scope.mailList}).then(function(res) {
		 				if (res.success) {
		 					$scope.inviteW = "Invited";
		 					$scope.sended = true;
		 					$timeout(function() {
		 						$("#sinvitem").fadeOut(200);
		 						$scope.mailList = [];
		 						$scope.sended = false;
		 						$scope.inviteW = "Invite";
		 					}, 500);
		 				}
		 			});
		 		}
		 	};
		 	$timeout(function() {
		 		$scope.displayPage = true;
		 	}, 1000)
		
		} else {
			if($location.path() === "/rank") {
	            $location.path('/login').replace();
	        }
		}

	});