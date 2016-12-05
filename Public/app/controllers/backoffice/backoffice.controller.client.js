angular.module('wittyApp')
	.controller('BackOfficeCtrl', function(access, $location, $scope, $http, $timeout, $filter, RetrieveData, $sce, $templateRequest, $compile) {
		if (!access.data) {
			$location.path('/');
		} else {
			String.prototype.capitalizeFirstLetter = function() {
			    return this.charAt(0).toUpperCase() + this.slice(1);
			}

			$scope.numUsers 	= 0;
			$scope.numProjects 	= 0;
			$scope.suggest1 	= "Don't Panic !";
			$scope.suggest2 	= "Take it easy ...";
			$scope.numberSend 	= [];
			$scope.number

			function initDashboard() {
				RetrieveData.getData('/statistics/mainstat', 'GET').then(function(res) {
					if (res.success) {
						$scope.stats = res.data;
					}
				});
			};	
			initDashboard();

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

			$http.get('/admin/project/network/list').success(function(res) {
				if (res.success)
					$scope.projectLists = res.list;
			});

			$scope.sendInviteToNetwork = function(project, index) {
				$scope.sendOnGoing = true;
				$http.post('/admin/project/network/list', {project: project}).success(function(res) {
					if (res) {
						$scope.sendOnGoing = false;
						$scope.projectLists[index].admin_check = 1;
					}
				});
			};

			function sendSuggestion(value) {
				if (value === 1) {
					$scope.onCharge1 = true;
					RetrieveData.getData('/suggestion/people', 'GET').then(function(res) {
						if (res.success) {
							$timeout(function() {
								$scope.onCharge1 = false;
								$scope.suggest1 = "Relax Now!";
							}, 2000);
					
						}
					});
				} else if (value === 2) {
					$scope.onCharge2 = true;
					RetrieveData.getData('/suggestion/projects', 'GET').then(function(res) {
						if (res.success) {
							$scope.onCharge2 = false;
							$timeout(function() {
								$scope.suggest1 = "Success YAY!";
							}, 2000);
					
						}
					});
				} else if (value === 3) {
					$scope.onCharge3 = true;
					if ($scope.numberSend[$scope.ucIndex] && $scope.numberSend[$scope.ucIndex].num && $scope.numberSend[$scope.ucIndex].students) {
						RetrieveData.ppdData('/uc/invitation/campaign', 'POST', {uc: $scope.ucSend, number: $scope.numberSend[$scope.ucIndex].num, students: $scope.numberSend[$scope.ucIndex].students, category: $scope.numberSend[$scope.ucIndex].category}, '', false).then(function(res) {
							if (res.success) {
								$scope.onCharge3 = false;
								$scope.numberSend = null;
								$scope.ucDatas = res.data;
								$scope.numberSend 	= [];
							}
						});
					} else
						$scope.error = true;
				} else
					$scope.error = true;
			};

			$scope.confirmSug = function() {
				if ($scope.confirmSuggestion === "ADMIN CONFIRM") {
					$scope.confirmSuggestion = null;
					sendSuggestion($scope.suggestValue);
				} else {
					$scope.error = true;
					$timeout(function() {
						$scope.error = false;
					}, 4000);
				}
			};
			
			$scope.suggestion = function(value) {
				if (value === 1) {
					$scope.suggestValue = 1;
				} else {
					$scope.suggestValue = 2;
				}
			};

			/********* UNIVERSITY CAMPAIGN *********/

			$scope.initUniversityCampaign = function() {
				RetrieveData.getData('/uc/invitation/list', 'GET').then(function(res) {
					if (res.success)
						$scope.ucDatas = res.data;
				});
			};

			$scope.loadCsvFile = function(file) {
				if (file) {
					$scope.csvName = file.name;
					var r = new FileReader();
					r.onload = function(e) {
						var content = e.target.result;
						var array 	= content.split('\n');
						var aLength = array.length;
						if (array[0].indexOf(',') >= 0)
							var character = ',';
						else if (array[0].indexOf(';') >= 0)
							var character = ';';
						var s1 = [];
						var s2 = [];
						for (var i = 0; i < aLength; i++) {
							array[i] = array[i].trim();
							s1 = array[i].split(character);
							s2 = s1[0].split(' ');
							array[i] = {
								first_name 	: s2[0],
								email 		: s1[1]
							}
						};
						$scope.ucList = array;
						// content = content.replace(/\r?\n|\r/g, ",");

						// if (typeof content === "string") {
						// 	$scope.addEmailToList(13, content);
						// }
					};

					r.readAsText(file); 
				}
			};

			$scope.addUniversity = function() {
				if ($scope.ucName && $scope.ucList) {
					$scope.onCharge4 = true;
					var object = {
						university_name 		: $scope.ucName.capitalizeFirstLetter(),
						university_mail_list	: $scope.ucList,
					}

					RetrieveData.ppdData('/uc/invitation/add', 'POST', object, '', false).then(function(res) {
						if (res.success) {
							$scope.ucName = null;
							$scope.ucList = [];
							object = {};
							$scope.onCharge4 = false;
						}
					});
				} else
					$scope.errorUc = true;
			};

			$scope.sendUcCampaign = function(uc, index) {
				$scope.suggestValue = 3;
				$scope.ucSend 		= uc;
				$scope.ucIndex 		= index;
			};
		}
	});
