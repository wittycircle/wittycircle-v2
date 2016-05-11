'use strict';

angular.module('wittyApp').controller('MeetCtrl', function(Picture, $stateParams, $http, $scope, $location, $rootScope, Users, Profile, $timeout, showbottomAlert, cardProfilesResolve, getSkillsResolve, $mdBottomSheet, $state) {

	var meet = this;
	var ww = $(window).width();

	/* global var */
	meet.limit = 12;
	meet.mmobile = {};
	meet.mHelp = "Anything";
	meet.count = -1;
	meet.skillList = [];
	meet.skillListM = [];

	/* functions */
	meet.openmmodal = openmmodal;
	meet.closemmodal = closemmodal;
	meet.getAnything = getAnything;
	meet.getCardProfiles = getCardProfiles;
	meet.getSkills = getSkills;
	meet.searchSkill = searchSkill;
	meet.removeSkill = removeSkill;
	meet.goToProfile = goToProfile;
	meet.followUserFromCard = followUserFromCard;
	meet.expand = expand;

	var skillListUrl = "";
	var allHelp = ['Teammate', 'Feedback', 'Mentor', 'Tips', 'Any help'];

	getSkills();
	getCardProfiles();
	checkParams();

	/*** Meet Card Page ***/
	$scope.$parent.seo = {
		pageTitle: "Wittycircle | Meet",
		pageDescription: "What do you want to discover? Art, Design, Music, Science, Technology, Sport, find projects that fit your favorite categories."
	};

	$scope.$parent.card = {
		title: "Wittycircle | Meet",
		url: "https://www.wittycircle.com/meet",
		image: "https://res.cloudinary.com/dqpkpmrgk/image/upload/c_scale,w_1885/v1458394341/Bf-cover/background-footer3.jpg",
	};

	/*** Discover Mobile ***/
	function openmmodal (value) {
		if (ww < 736) {
			$('body').css('overflow-y', 'hidden');
			meet.mmobile.modal	= value;
			if (value === 1)
			meet.mmobile.headerText = "Someone with specific skills?";
			if (value === 2)
			meet.mmobile.headerText = "Show me people looking to...";
			meet.mmobile.general 	= true;
		} else {
			if (value === 2)
			$('#msdbox2').toggle();
		}
	}

	function closemmodal () {
		$('#mmmodal').css("display", "none");
		$('body').css('overflow-y', 'scroll');
		meet.mmobile.general = false;
	}

	function getCardProfiles () {
		if (cardProfilesResolve.data) {
			meet.cardProfiles = cardProfilesResolve.data.data;
			if ($rootScope.globals.currentUser) {
				Profile.getFollowedUser(cardProfilesResolve.data, function(res){
					meet.followed = res;
				});
			}
		};
	}

	function getSkills () {
		if (getSkillsResolve.data) {
			meet.skills = getSkillsResolve.data.skills;
			if ($stateParams.skillParams) {
				meet.skillList = $stateParams.skillParams;
			}
		}
	}

	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	function checkParams () {
		if ($stateParams.skills) {
			skillListUrl = $stateParams.skills;
			var tab = $stateParams.skills.split(',');
			for (var i = 0; i < tab.length; i++) {
				meet.skillList.push({sName: tab[i]});
			}
		}
		if ($stateParams.help) {
			var str = capitalizeFirstLetter($stateParams.help.toLowerCase());
			var arraycontains = (allHelp.indexOf(str) > -1);
			if (arraycontains === true) {
				meet.mHelp = str;
			} else {
				meet.mHelp = 'Any help';
			}
		}
		if ($stateParams.loc) {
			$scope.meetLocation = $stateParams.loc;
		}
	}

	function expand (value) {
		meet.limit = meet.limit + value;
	};

	function getAnything (help) {
		meet.mHelp = help;
		if (ww < 736)
		closemmodal();
	};

	/*** SECTION SEARCH MEET ***/
	function searchSkill (name) {
		meet.skillName = [];

		if (ww >= 736) {
			if (document.getElementById('labelNoText')) {
				document.getElementById('labelNoText').id = "labelText";
				document.getElementById('labelNoText2').id = "labelText2";
				document.getElementById('labelText').style.display = "block";
				document.getElementById('labelText2').style.color = "white";
			}
			document.getElementById('msabox1').style.display = "none";
			document.getElementById('msabox2').style.display = "none";

			if (meet.skillList.length < 5) {
				if (meet.skillList.length == 0) {
					meet.skillList.push({sName: name});
					skillListUrl = name;
					$state.transitionTo('meet', {skills: skillListUrl}, { notify: false, inherit: true });
					document.getElementById('input-msa').style.display = "none";

				}
				else {
					for(var i = 0; i < meet.skillList.length; i++) {
						if (meet.skillList[i].sName === name)
						break;
					}
					if (i == meet.skillList.length) {
						meet.skillList.push({sName: name});
						skillListUrl = skillListUrl + "," + name;
						$state.transitionTo('meet', {skills: skillListUrl}, { notify: false, inherit: true });
						document.getElementById('input-msa').style.display = "none";
					}
				}
			}
			if (meet.skillList.length == 5)
			meet.fullList = true;

			$http.post('/search/users', meet.skillList).success(function(res) {
				meet.skillSearch = res.data;
			});
		} else {

			if (meet.skillListM.length < 5) {
				if (meet.skillListM.length === 0) {
					meet.skillListM.push({sName: name});
				}
				else {
					for(var i = 0; i < meet.skillListM.length; i++) {
						if (meet.skillListM[i].sName === name)
						break;
					}
					if (i == meet.skillListM.length) {
						meet.skillListM.push({sName: name});
					}
				}
			}

			$http.post('/search/users', meet.skillListM).success(function(res) {
				meet.skillSearch = res.data;
			});
			console.log(meet.skillName);
		}
	}

	function removeSkill (name) {
		var index;

		if (ww >= 736) {
			var x = document.getElementsByClassName('meet-skill-list');

			for (var i = 0; i < meet.skillList.length; i++) {
				if (meet.skillList[i].sName === name) {
					x[i].className = "meet-skill-list animated fadeOut";
					index = i;
					break ;
				}
			}
			if (index >= 0)
			meet.skillList.splice(index, 1);
			if (meet.skillList.length < 5)
			meet.fullList = false;
			if(meet.skillList[0]) {
				$http.post('/search/users', meet.skillList).success(function(res) {
					meet.skillSearch = res.data;
				});
			} else
			meet.skillSearch = [];
		} else {
			for (var i = 0; i < meet.skillListM.length; i++) {
				if (meet.skillListM[i].sName === name) {
					index = i;
					break ;
				}
			}
			if (index >= 0)
			meet.skillListM.splice(index, 1);
			if(meet.skillListM[0]) {
				$http.post('/search/users', meet.skillListM).success(function(res) {
					meet.skillSearch = res.data;
				});
			} else
			meet.skillSearch = [];
		}
	}

	/*** SECTION PROFILE CARD ***/
	function goToProfile (id) {
		Users.getUserIdByProfileId(id).then(function(data) {
			//$location.path('/' + data.userId.username);
			$state.go('profile', {username: data.userId.username});
		});
	};

	function followUserFromCard (id, index, $event) {
		if (!$rootScope.globals.currentUser) {
			showbottomAlert.pop_it();
		} else {
			Users.getUserIdByProfileId(id).then(function(data) {
				if ($rootScope.globals.currentUser.id !== data.userId.id) {
					Profile.followUser(data.userId.username, function(res) {
						if (res.success) {
							if (res.msg === "User followed")
							meet.followed[index] = true;
							else
							meet.followed[index] = false;
						}
					});
				}
			});
		}
	};

	/*** Scroll to display Popover ***/
	var unique = 0;
	setTimeout(function() {
		if (!$rootScope.globals.currentUser) {

			$(document).scroll(function () {
				if ($('#meet-body-page')[0]) {
					var y = $(this).scrollTop();

					if (!unique && y > 350) {
						unique = 1;
						showbottomAlert.pop_it_persistance();
					}
					if (y <= 350) {
						unique = 0;
						$mdBottomSheet.cancel();
					}
				}
			});
		} else {
			unique = 0;
			$(document).scroll(function() {
				if ($('#discover-body-page')[0] && !$rootScope.socialCheck) {
					var y = $(this).scrollTop();

					if (!unique && y > 350) {
						unique = 1;
						$http.get('/share/' + $rootScope.globals.currentUser.id).success(function(res) {
							if (!res.success) {
								$rootScope.socialCheck = true;
								showbottomAlert.pop_share();
							}
						});
					}
					if (y <= 350) {
						$mdBottomSheet.cancel();
					}
				}
			});
		}
	}, 1000);

	/*var shareInterval = $timeout(function() {
	if ($rootScope.globals.currentUser && !$rootScope.socialCheck) {
	$http.get('/share/' + $rootScope.globals.currentUser.id).success(function(res) {
	if (!res.success) {
	$rootScope.socialCheck = true;
	showbottomAlert.pop_share();
}
});
}
}, 0);

$scope.$on('$destroy', function() {
$timeout.cancel(shareInterval);
});*/

// $scope.$on('$destroy', function() {
// 	console.log("OK");
// 	$mdBottomSheet.destroy();
// });

/*** Search Section ***/
$scope.$watchGroup(['meet.mHelp', 'meet.skillSearch', 'searchML'], function (value) {
	if (value) {

		$('#ldm').css('display', 'block');
		$('#mbd').css('display', 'none');

		$timeout(function() {
			$('#ldm').css('display', 'none');
			$('#mbd').css('display', 'block');
		}, 500);

		var object = {
			about: value[0],
			list: value[1],
			geo: value[2],
		};
		if (value[1] && value[1][0]) {
			$http.put('/search/users', object).success(function(res) {
				if (res.success) {
					meet.cardProfiles = res.data;
					if ($rootScope.globals.currentUser) {
						Profile.getFollowedUser(res, function(res){
							meet.followed = res;
						});
					}
				}
			});
		} else {
			if (value[0] !== "Anything" || value[2]) {
				if (value[0]) {
					$state.transitionTo('meet', {help: value[0]}, { notify: false, inherit: true });
				}
				$http.post('/search/users/al', object).success(function(res) {
					if (res.success)
					meet.cardProfiles = res.data;
					if ($rootScope.globals.currentUser) {
						Profile.getFollowedUser(res, function(res){
							meet.followed = res;
						});
					}
				});
			}
		}
	}
});

$(document).ready(function() {
	$('.meet-body-cards').mouseup(function(e) {
		if ($rootScope.globals.currentUser) {
			var id      = e.target.id;
			var index   = e.target.id.slice(3);
			var idName  = "fop" + index;
			var idName2 = "foc" + index;

			if (id.indexOf("cfs") !== -1 || id.indexOf("fop") !== -1 || id.indexOf("foc") !== -1) {

				if (document.getElementById(idName).className === "fa fa-plus" || document.getElementById(idName).className === "fa fa-plus animated fadeIn") {
					document.getElementById(idName).className = "fa fa-plus animated fadeOut";
					document.getElementById(idName2).className = "fa fa-check animated fadeIn";
				} else {
					document.getElementById(idName).className = "fa fa-plus animated fadeIn";
					document.getElementById(idName2).className = "fa fa-check animated fadeOut";
				}
			}
		}
	});
});
})
.directive('preGoLocation', function() {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, model) {
			var options = {
				types: ['(cities)'],
			};

			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

			google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
				scope.$apply(function() {
					model.$setViewValue(element.val());
					var x = model.$viewValue.indexOf(',');
					$state.transitionTo('meet', {loc: model.$viewValue}, { notify: false, inherit: true });
					scope.searchML = model.$viewValue.slice(0, x).toLowerCase();
				});
			});

			scope.$watch('meetLocation', function(value) {
				if (value) {
					var checkCountry = value.indexOf('United States');
					if (checkCountry >= 0) {
						scope.meetLocation = value.slice(0, checkCountry - 2);
						var x = scope.meetLocation.length;
					} else {
						var x = value.length,
						y = $(window).width();
						if (x > 11) {
							$("#msai").css('width', function() {
								var el = $('<span />', {
									text : value,
									css  : {left: -9999, position: 'relative', 'font-family': 'FreigLight', 'font-size': '32px'}
								}).appendTo('body');
								var w = parseInt(el.css('width').replace(/[^-\d\.]/g, '')) + 20;
								el.remove();
								if (w < 200)
								return "200px";
								if (y > 736)
								return w.toString() + "px";
								else
								return "260px";
							});
						}
					}
				}
			});
		}
	}
});
