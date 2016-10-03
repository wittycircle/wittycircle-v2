'use strict';

angular.module('wittyApp').
	controller('ProfileHelpCtrl', function ($rootScope, $http, $scope, $location) {
		$rootScope.$on('sendMyNeed', function(event, data) {
			$scope.askUser = {first_name: data.p_first_name, last_name: data.p_last_name};
			$scope.projectInfo = {public_id: data.public_id, picture: data.pPic, title: data.pTitle};
			$http.get('/openings/project/' + data.public_id).success(function(res) {
				$scope.needToHelp = res;
			});
		});

		$scope.goToAddNeed = function() {
			$location.path('/project/' + $scope.projectInfo.public_id + '/update/needs');
		};

		$scope.selectNeed = function(index, p_picture, p_title, n_status, n_skill, n_tags) {
			$scope.activeCard = index;
			$scope.needSelected = true;
			$scope.demandForm = {pPic: p_picture, pTit: p_title, nSta: n_status, nSkill: n_skill, nTags: n_tags};
		};

		$scope.displayDemand = function() {
			$scope.sendNeed = true;
		};
	});
