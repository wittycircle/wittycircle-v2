'use strict';

angular.module('wittyApp').controller('MeetCtrl', function(Picture, $stateParams, $http, $scope, $location, $rootScope, Users, Profile, $timeout, showbottomAlert, RetrieveData, $mdBottomSheet, $state) {


	var meet = this;
	var ww = $(window).width();

	/* global var */
	$scope.limit = 20;
	$scope.limitc = 20;
	meet.mmobile = {};
	meet.mHelp = "Anything";
	meet.count = -1;
	meet.skillList = [];
	meet.skillListM = [];
	meet.logIn = $rootScope.globals.currentUser ? true : false;
	/* functions */
	meet.openmmodal = openmmodal;
	meet.closemmodal = closemmodal;
	meet.getAnything = getAnything;
	// meet.getCardProfiles = getCardProfiles;
	meet.searchSkill = searchSkill;
	meet.removeSkill = removeSkill;
	meet.goToProfile = goToProfile;
	meet.followUserFromCard = followUserFromCard;

	var skillListUrl = "";
	// var allHelp = ['Teammate', 'Feedback', 'Mentor', 'Tips', 'Any help'];

	// checkParams();

	// $scope.onLoadSearch = true;
	meet.cardProfiles = false;

	/*** Meet Card Page ***/
	$scope.$parent.seo = {
		pageTitle: "Wittycircle | Meet",
		// pageDescription: "What do you want to discover? Art, Design, Music, Science, Technology, Sport, find projects that fit your favorite categories."
	    pageDescription: "Meet thousands of designers, programmers, engineers and creative people ready to help you grow your project."
	};

	$scope.$parent.card = {
		title: "Wittycircle | Meet",
		url: "http://127.0.0.1/meet",
		image: "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1465994773/Share_Link_Cards_Facebook/Share_Pic_Facebook_Meet.png",
	};

	$scope.$on('$stateChangeStart', function(next, current) {
		if(window.stop !== undefined)
        {
             window.stop();
        }
        else if(document.execCommand !== undefined)
        {
             document.execCommand("Stop", false);
        }
	});

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

	function loaderDisplay(check) {
		if (check)
			document.getElementById('ldm').style.display = "block";
		else
			document.getElementById('ldm').style.display = "none";
	};

	function loaderMore(check) {
		if (check)
			document.getElementById('ldmis').style.display = "block";
		else
			document.getElementById('ldmis').style.display = "none";
	};

	function initializeProfile() {
		RetrieveData.getData('/user/card/profiles', 'GET').then(function(result) {
			loaderDisplay(false);
			meet.cardProfiles = result.data;
			if ($rootScope.globals.currentUser) {
				Profile.getFollowedUser(result.data, function(res){
					meet.followed = res;
				});
			}
			reInitializeProfile();
			loaderMore(true);
		});
	}; initializeProfile();

	function reInitializeProfile() {
		RetrieveData.ppdData('/user/card/profiles', 'PUT', meet.cardProfiles, false, true).then(function(res) {
			meet.cardProfiles = res.data;
		});
	};

	RetrieveData.getData('/skills', 'GET').then(function(res) {
		meet.skills = res.skills;
		if ($stateParams.skillParams) {
			meet.skillList = $stateParams.skillParams;
		}
	});

	$scope.$on('$destroy', function() {
		$stateParams.skillParams = [];
	});

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

	function getAnything (help) {
		meet.mHelp = help.toLowerCase();
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
					var tempo = meet.cardProfiles;
					loaderDisplay(true);
					meet.cardProfiles = false;
					$http.post('/search/users', meet.skillList).success(function(res) {
						if (res.success)
							meet.skillSearch = res.newList;
						else
							meet.cardProfiles = tempo;
					});
					// $state.transitionTo('meet', {skills: skillListUrl}, { notify: false, inherit: true });
					document.getElementById('input-msa').style.display = "none";

				} else {
					for(var i = 0; i < meet.skillList.length; i++) {
						if (meet.skillList[i].sName === name)
							break;
					}
					if (i == meet.skillList.length) {
						meet.skillList.push({sName: name});
						skillListUrl = skillListUrl + "," + name;
						var tempo = meet.cardProfiles;
						loaderDisplay(true);
						meet.cardProfiles = false;
						$http.post('/search/users', meet.skillList).success(function(res) {
							if (res.success)
								meet.skillSearch = res.newList;
							else
								meet.cardProfiles = tempo;
						});
						// $state.transitionTo('meet', {skills: skillListUrl}, { notify: false, inherit: true });
						document.getElementById('input-msa').style.display = "none";
					}
				}
			}
			if (meet.skillList.length === 5)
				meet.fullList = true;
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
						var tempo = meet.cardProfiles;
						loaderDisplay(true);
						meet.cardProfiles = false;
						$http.post('/search/users', meet.skillListM).success(function(res) {
							if (res.success)
								meet.skillSearch = res.newList;
							else
								meet.cardProfiles = tempo;
						});
					}
				}
			}
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
					if (res.success)
						meet.skillSearch = res.newList;
					else
						return ;
				});
			} else {
				$scope.searchSk = false;
				meet.cardProfiles = [];
				initializeProfile();
				meet.skillSearch = null;
			}
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
					if (res.success)
						meet.skillSearch = res.newList;
					else
						return ;
				});
			} else {
				$scope.searchSk = false;
				meet.cardProfiles = [];
				initializeProfile();
				meet.skillSearch = null;
			}
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
				meet.followed[index] = meet.followed[index] ? false : true;	
				if ($rootScope.globals.currentUser.id !== data.userId.id) {
					Profile.followUser(data.userId.username, function(res) {
						return ;	
					});
				}
			});
		}
	};

	/*** Scroll to display Popover ***/
	// var unique = 0;
 //        setTimeout(function() {
	// 	if (ww >= 736) {
	// 		if (!$rootScope.globals.currentUser) {
			    
	// 		    $(document).unbind('scroll');
	// 			$(document).scroll(function () {
	// 				if ($('#meet-body-page')[0]) {
	// 					var y = $(this).scrollTop();

	// 					if (!unique && y > 350) {
	// 						unique = 1;
	// 						showbottomAlert.pop_it_persistance();
	// 					}
	// 					if (y <= 350) {
	// 						unique = 0;
	// 						$mdBottomSheet.cancel();
	// 					}
	// 				}
	// 			});
	// 		}  else { 
	// 			unique = 0;
	// 			$(document).scroll(function() {
	// 				if ($('#discover-body-page')[0] && !$rootScope.socialCheck) {
	// 					var y = $(this).scrollTop();

	// 					if (!unique && y > 350) {
	// 						unique = 1;
	// 						$http.get('/share/' + $rootScope.globals.currentUser.id).success(function(res) {
	// 							if (!res.success) {
	// 								$rootScope.socialCheck = true;
	// 								showbottomAlert.pop_share();
	// 							}
	// 						});
	// 					}
	// 					if (y <= 350) {
	// 						$mdBottomSheet.cancel();
	// 					}
	// 				}
	// 			});
	// 		}
	// 	}
	// }, 1000);

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

function displaySkProfiles(value) {
	var count = 0;

	$scope.limitSkp = 0;
	$scope.limitSk = 0;
	$scope.limitSk1 = value;
	for(var i = 0; i < meet.cardProfiles.length; i++) {
		for (var n = 0; n < meet.cardProfiles[i].length; n++) {
			if (!isNaN(meet.cardProfiles[i][n].length))
				count = count + meet.cardProfiles[i][n].length;
			if (count > value) {
				if (value === 20)
					$scope.limitSk1 = 20;
				else
					$scope.limitSk1 = count;
				$scope.limitSkp = i;
				$scope.limitSk = n;
				break ;
			}
		}
		if (count > value)
			break ;
	}

	if (meet.cardProfiles.length === i) {
		$scope.limitSkp = 100;
		$scope.limitSk = 100;
		loaderMore(false);
	}
};


$scope.$watchGroup(['meet.mHelp', 'meet.skillSearch', 'searchML'], function (value) {
	if (value[0] !== "Anything" || value[1] || value[2]) {
		
		meet.cardProfiles = false;
		loaderDisplay(true);
		// $timeout(function() {
		// 	$('#ldm').css('display', 'none');
		// 	$('#mbd').css('display', 'block');
		// }, 1500);

		var object = {
			about: value[0],
			list: value[1],
			geo: value[2],
			country: $scope.searchMLC,
		};

		if (value[1] && value[1][0]) {
			$scope.searchAl = false
			if (value[0] === "Anything" && !value[2] && !value[1])
				return ;
			else if (value[0] !== "Anything" || typeof value[2] !== "undefined") {
				loaderMore(true);
				$scope.noAl = false;
				$http.put('/search/users', object).success(function(res) {
					if (res.success) {
						loaderDisplay(false);
						$scope.searchSk = true;
						$scope.limit4 = 20;
						meet.cardProfiles = res.data;

						displaySkProfiles(20);
						// if ($rootScope.globals.currentUser) {
						// 	Profile.getFollowedUser(res, function(res) {
						// 		meet.followed = res;
						// 	});
						// }
					}
				});
			} else {
				loaderMore(true);
				$scope.noAl = true;
				$http.post('/search/users/skills', object).success(function(res) {
					if (res.success) {
						loaderDisplay(false);
						$scope.searchSk = true;
						$scope.limit4 = 20;
						meet.cardProfiles = [res.data];

						displaySkProfiles(20);
						// if ($rootScope.globals.currentUser) {
						// 	Profile.getFollowedUser(res, function(res) {
						// 		meet.followed = res;
						// 	});
						// }
					}
				});
			}
		} else if (value[0] !== "Anything" || value[2]){
			loaderMore(true);
			$scope.searchSk = false;

			$http.post('/search/users/al', object).success(function(res) {
                if (res.success) {
                	loaderDisplay(false);
                	$scope.searchAl = true;
                	for (var i = 0; i < res.data.length; i++) {
                		if (res.data[i].length > 20) {
                			$scope.limitAl = i;
                			$scope.limitAl1 = 20;
                			break ;
                		} else {
                			if (res.data[i + 1].length + res.data[i].length > 20) {
                				$scope.limitAl = i + 1;
                				$scope.limitAl1 = res.data[i].length + 20;
                				break ;
                			}
                		}
                	};
                	meet.cardProfiles = res.data;
                }
                // if ($rootScope.globals.currentUser) {
                //         Profile.getFollowedUser(res, function(res){
                //                 meet.followed = res;
                //         });
                // }
        	});
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
	var wait = 1,
		first = 0;
	$(window).scroll(function() {
        if($(window).scrollTop() > $(document).height() - $(window).height() - 1400) {
        	$timeout(function() {
        		wait = 0;
        	}, 1000);
        	if (!wait) {
        		wait = 1;
        		if (!$scope.searchAl && !$scope.searchSk) {
	        		$scope.limitc += 12;
	            	// $scope.limit = $scope.limit + 12;
	            	if ($scope.limitc > meet.cardProfiles.length) {
	            		loaderMore(false);
	            	}
	            } else if ($scope.searchAl && !$scope.searchSk) {
	            	$scope.limitAl1 += 12;
	            	if (meet.cardProfiles[$scope.limitAl].length < $scope.limitAl1) {
	            		if (meet.cardProfiles[$scope.limitAl + 1]) {
	            			$scope.limitAl += 1;
	            		} else {
	            			loaderMore(false);
	            		}
	            	}
	            } else {
	            	$scope.limitSk1 += 12;
	            	var count = 0;
	            	if ($scope.limitSk1 > 20)
	            		displaySkProfiles($scope.limitSk1);
	            }
      //       	if (meet.cardProfiles.length > 1) {
	     //        	if (meet.cardProfiles[$scope.limit2 - 1].length < $scope.limit3) {
	     //        		$scope.limit2 = $scope.limit2 + 1;
	     //        		$timeout(function() {$scope.limit3 = 1}, 1000);
	     //        	} else {
	     //        		if (meet.cardProfiles[$scope.limit2 - 1][$scope.limit3 - 1].length < $scope.limit4) {
		    //         		$scope.limit3 += 1;
		    //  				$timeout(function() {$scope.limit4 = 20}, 1000);
		    //         	} else
		    //         		$scope.limit4 += 12;
	     //        	}
	     //        } else {
	     //        		if (meet.cardProfiles[0][$scope.limit3 - 1]){
						// if	(meet.cardProfiles[0][$scope.limit3 - 1].length < $scope.limit4) {
		    //         		$scope.limit3 = $scope.limit3 + 1;
		    //  				$timeout(function() {$scope.limit4 = 20}, 1000);
		    //  			} else
	     //        			$scope.limit4 += 12;
	     //        		} else
	     //        			$scope.limit4 = 20;
	     //        }
        	}
        }
    });
});

$scope.$watch('limit', function(value) {
	if (meet.cardProfiles.length === 2) {
		if (meet.cardProfiles[0].length > 20 && meet.cardProfiles[0].length > value) {
			$scope.limit1 = 1;
		} else if (value > meet.cardProfiles[0].length) {
 			$scope.limit1 = 2;
 			$timeout(function() {
 				$scope.limit1 = 20;
 			}, 1000)
    	}// else if (meet.cardProfiles.length === 3) {
    }
});
})
.directive('preGoLocation', function($state) {
	return {
		require: 'ngModel',
		link: function(scope, element, attrs, model) {
			var options = {
				types: ['(cities)'],
			};

			setTimeout(function() {
			scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

			google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
				scope.$apply(function() {
					model.$setViewValue(element.val());
					// $state.transitionTo('meet', {loc: model.$viewValue}, { notify: false, inherit: true });
					var x = model.$viewValue.indexOf(',');
					var y = model.$viewValue.lastIndexOf(',');
					scope.searchML = model.$viewValue.slice(0, x).toLowerCase();
					scope.searchMLC = model.$viewValue.slice(y + 2).toLowerCase();
					scope.fCity = model.$viewValue;
					scope.fCountry = model.$viewValue.slice(y + 2);
				});
			});
			}, 1000);
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
