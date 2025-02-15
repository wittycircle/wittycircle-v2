angular.module('wittyApp')
	.controller('BackOfficeCtrl', function(access, $location, $scope, $http, $timeout, $filter, RetrieveData, $sce, $templateRequest, $compile, Users) {
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

			RetrieveData.getData('/users', 'GET').then(function (resource) {
				$scope.profiles = resource;
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
						RetrieveData.ppdData('/uc/invitation/campaign', 'POST', {uc: $scope.ucSend}, '', false).then(function(res) {
							if (res.success) {
								$scope.onCharge3 = false;
								$scope.numberSend = null;
								$scope.ucDatas = res.data;
								$scope.numberSend 	= [];
							}
						});
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

			$scope.getTextHtml = function(index) {
				$scope.currentUcData = $scope.ucDatas[index];
				Users.getProfileByUserId($scope.currentUcData.sender, function(res) {
					Users.getProfilesByProfileId(res.content.profile_id, function(res2) {
						$scope.senderUc = res2.content;
						$scope.ucUrlToken = $scope.ucDatas[index].ucUrl;
						$('#bsc1').show();
						// RetrieveData.ppdData('/uc/token', 'POST', {uc: $scope.ucDatas[index].university}, '', false).then(function(res3) {
						// 	$scope.ucToken = res3;
						// 	$scope.ucUrlToken = 'https://www.wittycircle.com/welcome/' + $scope.currentUcData.university.replace(/\s+/g, '') + '/' + res3;
						// 	$('#bsc1').show();
						// });
					});
				});
			};

			$scope.getUserId = function(id, fullname) {
				$scope.ucSender = fullname;
				$scope.ucSenderId = id;
			}

			/********* UNIVERSITY CAMPAIGN *********/

			$scope.initUniversityCampaign = function() {
				RetrieveData.getData('/uc/invitation/list', 'GET').then(function(res) {
					if (res.success) 
						$scope.ucDatas = res.data;
				});
			};

			function retrieveUC() {
		        RetrieveData.ppdData('/data/uc/list', 'GET').then(function(res) {
		            $scope.uclist = res;
		        });
		    };
		    retrieveUC();

		    $scope.getUniversityName = function(name) {
		    	$scope.ucName = name;
		    }

			$scope.giveInvitPermission = function(sender_id) {
				if (sender_id) {
					RetrieveData.ppdData('/uc/invitation/permission', 'POST', {id: sender_id}, '', false).then(function(res) {
						alert('Success !')
					});
				} else {
					alert('Error occurs !');
				}
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
				if ($scope.ucName && $scope.ucSenderId && $scope.ucMessage) {
					$scope.onCharge4 = true;

					var object = {
						university_name 		: $scope.ucName.capitalizeFirstLetter(),
						university_sender		: $scope.ucSenderId,
						university_message 		: $scope.ucMessage,
						university_customName 	: $scope.ucCustomUrl,
						university_customDate 	: $scope.ucCustomDate
					}

					RetrieveData.ppdData('/uc/invitation/add', 'POST', object, '', false).then(function(res) {
						if (res.success) {
							$scope.ucName = null;
							$scope.ucSender = null;
							$scope.ucSenderId = null;
							$scope.ucCustomUrl = null;
							$scope.ucMessage = null;
							$scope.ucCustomDate = null;
							object = {};
							$scope.onCharge4 = false;
							$scope.initUniversityCampaign();
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
