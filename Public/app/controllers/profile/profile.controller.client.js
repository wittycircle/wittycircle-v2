'use strict';

/**
* @ngdoc function
* @name wittyApp.controller:ProfileCtrl
* @description
* # ProfileCtrl
* Controller of the wittyApp
**/
angular.module('wittyApp').controller('ProfileCtrl', function (Beauty_encode ,$modal , $state, $timeout, $cookieStore, Authentication, Upload, $http, $location, $scope, Profile, $rootScope, $stateParams, Experiences, Users, Skills, Interests, Locations, Projects, showbottomAlert, RetrieveData) {

	console.time('loading profile');
	var y           = $(window).width();

	$(document).ready(function() {
		$timeout(function() {
			if (y >= 736) {
				$('#header-section').css("position", "absolute");
		        $('#header-content').css("backgroundColor", "transparent");
		        $('#header-content').css("borderBottom", "none");
		        $('#hbp').attr("src", "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg");
		        $('#hnl').attr("class", "header-nav-list");
		        $('#hsb').attr("class", "header-searchBar");
		        $('#notif-w-i').attr("src", "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-w_wslyzh.png");
		    	$('#notif-m-i').attr("src", "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-w_sji3lw.png");
		    	$('#c-img').attr("src", "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-w_csniet.svg");
		        $('.header-log-dropdown').first().css("color", "white");
		        $('#hnlog').attr("class", "header-nav-log");
		    } else {
		    	$('#header-section').css("position", "absolute");
		    	$('#header-content').css("backgroundColor", "transparent");
	            $('#header-content').css("borderBottom", "none");
	            $('#hbp').attr("src", "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg");
	            document.getElementById('srpimg').src = "/images/littleman-w.svg";
	            document.getElementById('hsmobileimg').src = "/images/search-icon-w.svg";
	            document.getElementById('hnmid').className = "header-nav-list";
		    }
		}, 1500);
    });
	
	var profileVm = this;
	var socket = io.connect('http://127.0.0.1');

	/* Vm Variable */
	profileVm.currentUser = $rootScope.globals.currentUser || false;
	profileVm.trueUser = $stateParams.username === profileVm.currentUser.username ? true : false;
	profileVm.paramUsername = $stateParams.username;
	profileVm.showEditLocation;
    profileVm.currentUrl = 'http://127.0.0.1' + $location.path();

	if (profileVm.currentUser && profileVm.currentUser.moderator)
	    profileVm.moderator = true;

	/* Vm Function */
	profileVm.encodeUrl             = encodeUrl;
	profileVm.followUser            = followUser;
	profileVm.reloadCredential      = reloadCredential;
	profileVm.goToDiscover          = goToDiscover;
	profileVm.uploadProfilePicture  = uploadProfilePicture;
	profileVm.uploadProfileCover    = uploadProfileCover;
	profileVm.goToMessage           = goToMessage;
	profileVm.showEditL             = showEditL;
	profileVm.hideEditL             = hideEditL;
	profileVm.openMobileEdit        = openMobileEdit;
	profileVm.closeMobileEdit       = closeMobileEdit;
	profileVm.init                  = init;
	profileVm.editLocation          = editLocation;
	profileVm.getProfileInfo        = getProfileInfo;
	profileVm.showEditA             = showEditA;
	profileVm.hideEditA             = hideEditA;
	profileVm.openEditA             = openEditA;
	profileVm.getProfileSkill       = getProfileSkill;
	profileVm.showEditS             = showEditS;
	profileVm.hideEditS             = hideEditS;
	profileVm.openEditS             = openEditS;
	profileVm.getProfileInterest    = getProfileInterest;
	profileVm.showEditI             = showEditI;
	profileVm.hideEditI             = hideEditI;
	profileVm.openEditI             = openEditI;
	profileVm.getProfileExp         = getProfileExp;
	profileVm.showAddE              = showAddE;
	profileVm.hideAddE              = hideAddE;
	profileVm.showEditE             = showEditE;
	profileVm.hideEditE             = hideEditE;
	profileVm.openAddE              = openAddE;
	profileVm.openEditE             = openEditE;
	profileVm.removeExp             = removeExp;
	profileVm.getSlideProjects      = getSlideProjects;

	if (!profileVm.currentUser || (profileVm.currentUser && !profileVm.trueUser))
		Users.getProfileView(profileVm.paramUsername);

	if (profileVm.currentUser) {
		Profile.getUserbyUsername(profileVm.paramUsername).then(function(res) {
			if(!profileVm.trueUser && res) {
				socket.emit('view-notification', {
					viewer: profileVm.currentUser.username,
					viewed: profileVm.paramUsername,
				});
			}
		});
	}

	if (profileVm.trueUser) {
		profileVm.cannotFollow   = true;
		profileVm.canUpload      = true;
		profileVm.canUploadCover = true;
	}
	if (profileVm.moderator) {
	    profileVm.canUpload      = true;
            profileVm.canUploadCover = true;
	}

	if (profileVm.moderator) {
		profileVm.canUpload      = true;
		profileVm.canUploadCover = true;
	}


	/***** MOBILE *****/

	/*** All Home Functions (Mobile) ***/
	function getSlideProjects() {
		if (profileVm.initSlide) {
			$('#profile-mobile-slideDown').slideToggle();
		} else
			profileVm.initSlide = true;
	};

	/***** DESKTOP *****/

	/*** All Home Functions (Desktop) ***/
	function encodeUrl(url) {
		return Beauty_encode.encodeUrl(url);
	}

	function followUser() {
		if (!profileVm.currentUser)
			showbottomAlert.pop_it();
		else {
			if (profileVm.paramUsername !== profileVm.currentUser.username) {
				Profile.followUser(profileVm.paramUsername, function(res) {
					if (res.success) {
						if (res.msg === "User unfollowed") {
							profileVm.followText = "Follow";
						} else {
							profileVm.followText = "Following";
						}
					}
				});
			}
		}
	};

	function reloadCredential() {
		$http.get('/profile').success(function(res){
			Authentication.SetCredentialsSocial(res.user, res.user_info);
		});
	};

	function checkHideUser(username) {
		var array = ["Morgan.Denis", "Hélène.deLépinau"];
		if (array.indexOf(username) > -1)
			return false
		else
			return true;
	};

	function init() {
		RetrieveData.ppdData('/username/', 'GET', null, profileVm.paramUsername).then(function(res) {
			if (res && res[0]) {
				// Get Profile Project Involved
				Projects.getUserProject(res[0].id, function(res) {
					profileVm.inProjects = res;
				});

				// Get Ranking Profile
				RetrieveData.ppdData('/rank/statistic', 'POST', { user_id: res[0].id }).then(function(res) {
					if (res.success) {
						$scope.myRank = res.rank;
						$scope.myCompareRank = res.compareR || null;
						if ($scope.myRank <= 10)
							$scope.topRank = 10;
						else if ($scope.myRank > 10 && $scope.myRank <= 50)
							$scope.topRank = 50;
						else if ($scope.myRank > 50 && $scope.myRank <= 100)
							$scope.topRank = 100;
						else
							$scope.topRank = 0;
					}
				});
			}
		});

		// RetrieveData.getData('/setting/rank', 'GET').then(function(res) {
		// 	console.log(res);
		// 	if (res.success)
		// 		$scope.pRank = res.data;
		// });


		if (profileVm.currentUser) {
			if (profileVm.currentUser.username !== profileVm.paramUsername) {
				RetrieveData.ppdData('/follow/user/', 'GET', null, profileVm.paramUsername).then(function(res) {
					if (res.success) {
						// profileVm.follow         = true;
						profileVm.followText     = "Following";
					}
					else {
						// profileVm.follow         = false;
						profileVm.followText     = "Follow";
					}
				});

				RetrieveData.ppdData('/username/', 'GET', null, profileVm.currentUser.username).then(function(res) {
					if (res && res[0]) {
						Projects.getUserProject(res[0].id, function(res) {
							profileVm.askProjects = res;
						});
					}
				});
			}
		} else
			// profileVm.follow                 = true;
		profileVm.followText             = "Follow";

		RetrieveData.ppdData('/follow/projects/number/', 'GET', null, profileVm.paramUsername).then(function(res) {
			if (res.success) {
				profileVm.projectsFollow = res.list;
			}
		});

		RetrieveData.ppdData('/follow/users/', 'GET', null, profileVm.paramUsername).then(function(res) {
			profileVm.usersFollow          = res.data;
		});

		RetrieveData.ppdData('/follow/followUsers/', 'GET', null, profileVm.paramUsername).then(function(res) {
			profileVm.followers            = res.data;
		});

		RetrieveData.ppdData('/username/', 'GET', null, profileVm.paramUsername, 0).then(function(res) {
			if (res && res[0]) {
				Experiences.getExperiences(res[0].id).then(function(res1) {
					profileVm.experiences      = res1;
				});
				Skills.getUserSkills(res[0].id).then(function(res2) {
					profileVm.user_skills      = res2;
				});
				Interests.getUserInterests(res[0].id).then(function(res3) {
					profileVm.user_interests   = res3;
				})
				profileVm.user               = res[0];
				profileVm.profile            = res[0].profile[0];
				if (profileVm.profile.cover_picture) {
					$http.post('/picture/get/cover', {url: profileVm.profile.cover_picture}).success(function(res) {
						if (res.success && res.data[0])
							profileVm.randomCover  = true;
						else
							profileVm.randomCover  = false;
						$('#profile-header').css('background-image', "url('" + $rootScope.resizePic(profileVm.profile.cover_picture, 1200, 410, 'fill') + "')");
					});
				}
			    /* SEO */
			    var hideUser = $location.path().slice(1);

			    if (checkHideUser(hideUser)) {
				    $scope.$parent.seo = {
						pageTitle: profileVm.profile.first_name + " " + profileVm.profile.last_name + " | Wittycircle",
						pageDescription: profileVm.profile.description || "Take a look at " + profileVm.profile.first_name + " " + profileVm.profile.last_name + "'s profile" ,
				    };
				    
				    $scope.$parent.card = {
						title: profileVm.profile.first_name + " " + profileVm.profile.last_name,
						url: profileVm.currentUrl,
						image: $rootScope.resizePic(profileVm.profile.profile_picture, 160, 160, 'fill')
				    };
				}
			} else {
				console.log("error");
				$location.path('/');
			}
		});
	}; init();

	/*** Go to Discover ***/
	function goToDiscover(category) {
		$state.go('discover', {tagParams: category});
	};

	/*** Go To Profile ***/
	$scope.goToProfile = function(id) {
	    Users.getUserIdByProfileId(id).then(function(data) {
			if (data.userId)
				$location.path('/' + data.userId.username);
		});
	};

	/*** Upload picture ***/
	function uploadProfilePicture(file) {
	    var data = {};
	    if (file) {
		profileVm.imageProfileLoading           = true;
		Upload.dataUrl(file, true).then(function(url){
		    data.url = url;
		    $http.post('/upload/profile_pic_icon', data).success(function(res1) {
			var object = {
			    picture: {
				profile_picture: res1.secure_url,
				profile_picture_icon: res1.secure_url
			    },
			    profile_id: profileVm.profile.id
			}
			$http.put('/profile/picture', object).success(function(res2) {
			    if (res2.success) {
				init();
				profileVm.reloadCredential();
				profileVm.imageProfileLoading = false;
			    }
			});
		    });
		});
	    }
	};
    
	function uploadProfileCover(file) {
	    var data = {};
	    if (file) {
		profileVm.imageCoverLoading          = true;
		profileVm.randomCover                = false;
		Upload.dataUrl(file, true).then(function(url){
		    data.url = url;
		    $http.post('/upload/profile/cover', data).success(function(res) {
			var object = {
			    picture: {
				cover_picture: res.secure_url,
			    },
			    profile_id: profileVm.profile.id
			}
			$http.put('/profile/picture', object).success(function(response) {
			    if (response.success) {
				init();
				profileVm.imageCoverLoading  = false;
				profileVm.currentUser.profile_cover = res.secure_url;
				$cookieStore.put('globals', $rootScope.globals);
			    }
			});
		    }).error(function(res) {
			console.log(res);
		    });
		    
		    $http.post('/upload/profile/cover_card', data).success(function(res) {
			var object = {
			    picture: {
				cover_picture_cards: res.secure_url,
			    },
			    profile_id: profileVm.profile.id
			}
			$http.put('/profile/picture', object).success(function(res) {
			});
		    }).error(function(res) {
			console.log(res);
		    });
		    
		});
	    }
	};

	// profileVm.$watch('imageLoading', function (value) {
	//   if(value === true) {
	//     console.log('file uploading');
	//   }
	// });

	/*** Message ***/
	function goToMessage(id, check) {
		if (!profileVm.currentUser)
			showbottomAlert.pop_it();
		else {

			if (!check)
				$scope.sendNeed = false;
			if (!$scope.sendNeed)
				$scope.textPlaceholder = "Write a message..."
			else
				$scope.textPlaceholder = "Add a personal note..."

			$scope.sendMess = true;
		    Users.getUserIdByProfileId(id).then(function(res) {
			if (res.success)
				$rootScope.$broadcast("message-params", {profile: profileVm.profile, user_id: res.userId.id, username: res.userId.username});
			    // $state.go('messages', {profile: profileVm.profile, user_id: res.userId.id, username: res.userId.username});
		    });
		}
	};

	/*** Message NEED ***/ 
	$scope.getToNeed = function(public_id, project_status, project_title, project_picture) {
		if (!project_picture) {
			if (project_status === "Idea")
				$scope.nPpicture = "/images/Thumbnail_Idea.svg";
			else if (project_status === "Drafted project")
				$scope.nPpicture = "/images/Thumbnail_Drafted.svg";
			else if (project_status === "Beta project" )
				$scope.nPpicture = "/images/Thumbnail_Beta.svg";
			else
				$scope.nPpicture = "/images/Thumbnail_Live.svg"
		} else {
			$scope.nPpicture = $rootScope.resizePic(project_picture, 40, 40, 'fill');		
		}

		$http.get('/openings/project/' + public_id).success(function(res) {
			$scope.needToHelp = res;
		});
		$scope.addNeedPublicId = public_id;
		$scope.nPtitle = project_title;
	};

	$scope.goToAddNeed = function() {
		$location.path('/project/' + $scope.addNeedPublicId + '/update/needs');
	};

	$scope.selectNeed = function(index, p_picture, p_title, n_status, n_skill, n_tags, p_id) {
		$scope.activeCard = index;
		$scope.needSelected = true;
		$scope.demandForm = {nSta: n_status, nSkill: n_skill, nTags: n_tags};
		$scope.project_p_id = p_id;
	};

	$scope.displayDemand = function() {
		$scope.sendNeed = true;
		$scope.textPlaceholder = "Add a personal note...";
		goToMessage(profileVm.profile.id, true);
	};

	/*** MOBILE EDIT ***/
	function openEditMobile() {
		classie.add(document.getElementById('psmb'), 'animate-psm-open');
		classie.remove(document.getElementById('psmb'), 'animate-psm-close');
		$('#pebutton').toggle();
	};

	function closeEditMobile() {
		classie.add(document.getElementById('psmb'), 'animate-psm-close');
		classie.remove(document.getElementById('psmb'), 'animate-psm-open');
		$('#pebutton').toggle();
	}

	function openMobileEdit() {
		openEditMobile();
		profileVm.showEditLocation = true;
	};

	function closeMobileEdit() {
		closeEditMobile();
		profileVm.showEditLocation = false;
		profileVm.modifyLocation = false;
	}

	/*** DESKTOP EDIT ***/

	/*** LOCATION ***/
	function showEditL() {
		if (profileVm.trueUser)
			profileVm.showEditLocation = true;
	};

	function hideEditL() {
		if (profileVm.trueUser)
			profileVm.showEditLocation = false;
	};

	function editLocation() {
		if (profileVm.modifyLocation)
			profileVm.modifyLocation     = false;
		else
			profileVm.modifyLocation     = true;
	};

	/*** ABOUT ***/
	function getProfileInfo() {
		Profile.getUserbyUsername(profileVm.paramUsername).then(function(response) {
			if (response)
				profileVm.profile          = response.profile[0];
			else {
				console.log("error");
				$location.path('/');
			}
		});
	};

	function showEditA() {
		if (profileVm.trueUser)
			profileVm.showEditAbout    = true;
	};

	function hideEditA() {
		if (profileVm.trueUser)
			profileVm.showEditAbout    = false;
	};

	function openEditA() {
		profileVm.modalInstance          = $modal.open({
			animation: true,
			templateUrl: 'views/profile/modal/profile.edit.about.view.client.html',
			controller: 'AboutModalCtrl',
			windowClass: 'large-Modal',
			scope: $scope
		});
	};

	/*** SKILLS ***/
	function getProfileSkill() {
		$http.get('/skills/' + profileVm.paramUsername).success(function(res) {
			if (res.success)
				profileVm.profileSkills    = res.data;
		});
	}; getProfileSkill();

	function showEditS() {
		if (profileVm.trueUser)
			profileVm.showEditSkill    = true;
	};

	function hideEditS() {
		if (profileVm.trueUser)
			profileVm.showEditSkill = false;
	};

	function openEditS() {
		profileVm.modalInstance        = $modal.open({
			animation: true,
			templateUrl: 'views/profile/modal/profile.edit.skill.view.client.html',
			controller: 'SkillsModalCtrl',
			windowClass: 'large-Modal',
			scope: $scope
		});
	};

	/*** INTEREST ***/
	function getProfileInterest() {
		$http.get('/interest/' + profileVm.paramUsername).success(function(res) {
			if (res.success)
				profileVm.profileInterests = res.data;
		});
	}; getProfileInterest();

	function showEditI() {
		if (profileVm.trueUser)
			profileVm.showEditInterest = true;
	};

	function hideEditI() {
		if (profileVm.trueUser)
			profileVm.showEditInterest = false;
	};

	function openEditI() {
		profileVm.modalInstance        = $modal.open({
			animation: true,
			templateUrl: 'views/profile/modal/profile.edit.interest.view.client.html',
			controller: 'InterestsModalCtrl',
			windowClass: 'large-Modal',
			scope: $scope
		});
	};

	/*** EXPERIENCE ***/
	// profileVm.startMonth           = "Month";
	// profileVm.startYear            = "Year";
	// profileVm.endMonth             = "Month";
	// profileVm.endYear              = "Year";
	// profileVm.startPeriod          = {};
	// profileVm.endPeriod            = {};

	function getProfileExp() {
		$http.get('/experiences/' + profileVm.paramUsername).success(function(res) {
		    if (res.success)
			    profileVm.profileExps      = res.data;
			else
				profileVm.profileExps 	   = [];
		});
	}; getProfileExp();

	function showAddE() {
		if (profileVm.trueUser)
			profileVm.showAddExp       = true;
	};

	function hideAddE() {
		if (profileVm.trueUser)
			profileVm.showAddExp       = false;
	};

	function showEditE(index) {
		if (profileVm.trueUser)
			profileVm.showEditExp      = index;
	};

	function hideEditE() {
		if (profileVm.trueUser)
			profileVm.showEditExp      = -1;
	};

	function openAddE() {
		profileVm.modalInstance          = $modal.open({
			animation    : true,
			templateUrl  : 'views/profile/modal/profile.add.experience.view.client.html',
			controller   : 'AddExperiencesModalCtrl',
			windowClass  : 'small-Modal',
			scope        : $scope
		});
	};

	function openEditE(index) {
		profileVm.modalInstance          = $modal.open({
			animation     : true,
			templateUrl   : 'views/profile/modal/profile.edit.experience.view.client.html',
			controller    : 'EditExperiencesModalCtrl',
			windowClass   : 'small-Modal',
			scope         : $scope,
			resolve       : {
				indexId     : function() {
					return index;
				}
			}
		});
	};

	function removeExp(id) {

		RetrieveData.ppdData('/experience/', 'DELETE', null, id).then(function(res) {
			if (res.success)
				getProfileExp();
		});
	};

	$scope.goToStart = function() {
        $state.transitionTo('main', {tagStart: true}, {reload: true, inherit: false, notify: true});
    }
    
	console.timeEnd('loading profile');
})
.directive('profileMessageModal', function() {
	var x = $(window).width();

	if (x >= 736) {
		return {
			templateUrl: 'views/profile/modal/profile.message.view.client.html',
			restrict: "E",
			scope: false,
			controller: 'MessageCtrl'
		}
	}
})
.directive('profileHelpNeed', function() {
	var x = $(window).width();

	if (x >= 736) {
		return {
			templateUrl: 'views/profile/modal/profile.help.view.client.html',
			restrict: "E",
			scope: false,
		}
	}
})
.directive('profileLocationSearch', function($http, Locations) {
	return {
		require: 'ngModel',
		scope: false,
		link: function(scope, element, attrs, model) {
			var options = {
				types: ['(cities)'],
			};

			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

			google.maps.event.addListener(scope.gPlace, 'place_changed',
				function() {
					scope.$apply(function() {
						model.$setViewValue(element.val());
						scope.profileLocation = model.$viewValue;
					});
				});

			scope.$watch('profileLocation', function(value) {
				var object = {};

				scope.profileLocation = value;
				Locations.setplaces(scope.profileLocation, object);
				if (object.location_country) {
					$http.put('/profile/location', object).success(function(res) {
						scope.profileVm.init();
						scope.profileVm.editLocation();
					});
				}
			});


			scope.$watch('displayLocation2', function(value) {
				if (value) {
					var checkCountry2         = value.indexOf('United States');
					if (checkCountry2 >= 0) {
						scope.displayLocation2  = value.slice(0, checkCountry2 - 2);
					}
				}
			});
		}
	};
})
.directive('slickSlider', function () {
	return {
		restrict: 'A',
		scope: {'data': '=',
			'check': '=',
		},
		replace: true,
		link: function (scope, element, attrs) {
			var isInitialized = false;

			scope.$watchGroup(['data', 'check'], function(newVal, oldVal) {
				if (newVal[0] && newVal[0].length > 0 && newVal[1] && !isInitialized) {
					$('#profile-mobile-slideDown').slideToggle();
					$(element).slick(scope.$eval(attrs.slickSlider));
					isInitialized = true;
				}
			});
		}
	}
});
