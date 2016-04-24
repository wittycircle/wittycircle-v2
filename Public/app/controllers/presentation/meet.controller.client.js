'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller: MeetCtrl
 * @description
 * # MeetCtrl
 * Controller of the wittyApp
 **/


angular.module('wittyApp').controller('MeetCtrl', function(Picture, $stateParams, $http, $scope, $location, $rootScope, Users, Profile, $timeout, showbottomAlert) {


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
	var ww = $(window).width();
	$scope.mmobile = {};

	$scope.openmmodal = function(value) {
		
		if (ww <= 736) {
			$('body').css('overflow-y', 'hidden');
			$scope.mmobile.modal	= value;
			if (value === 1)
				$scope.mmobile.headerText = "Someone with specific skills?";
			if (value === 2)
				$scope.mmobile.headerText = "Show me people looking to...";
			// if (value === 3)
			// 	$scope.mmobile.headerText = "Show me projects near...";
			$scope.mmobile.general 	= true;
		}
	};

	$scope.closemmodal = function() {
		$('#mmmodal').css("display", "none");
		$('body').css('overflow-y', 'scroll');
		$scope.mmobile.general 	= false;
	}

	Users.getCardProfiles(function(result){
		$scope.cardProfiles = result.data;
		if ($rootScope.globals.currentUser) {
			Profile.getFollowedUser(result.data, function(res){
				$scope.followed = res;
			});
		}	
	});

	$scope.limit = 12;
	
	$http.get('/skills').success(function(res) {
		$scope.skills = res.skills;
		if ($stateParams.skillParams) {
			$scope.skillList = $stateParams.skillParams;
		}
	});

	$scope.resizePicSmall = function(url) {
		url = Picture.resizePicture(url, 200, 100, "fill");
		return url;
	}

	$scope.expand = function(value) {
		$scope.limit = $scope.limit + value;
	};

	// $scope.$on("$destroy", function(){
	// 	var container = $('.custom-popover');
	// 	if (container.length) {
	// 		$mdBottomSheet.hide();
	// 		$('.md-bottom-sheet-backdrop').css('display', 'none')
	// 		$('#page-wrap').css('display', 'none');
	// 	}
	// });

	/*****-- FUNCTION --*****/
	// setTimeout(function() {
	//     if (!$rootScope.globals.currentUser) {
	//   		$(window).scroll(function () {
	//   			if ($('#meet-body-page')[0]) {
	//   				var x = $(window).scrollTop();
	//   				var container = $('.custom-popover');
	//   				if (x > 350) {
	//   					if (!container.length) {
	//   						$mdBottomSheet.hide();
	//   						showbottomAlert.pop_it_persistance();
	//   						setTimeout(function() {
	//   							$('#main-body .md-bottom-sheet-backdrop').css('display', 'none');
	//   							$('#page-wrap').css('display', 'block');
	//   						}, 150);
	//   					}
	//   				}
	//   				if (x < 350) {
	//   					if (container.length) {
	//   						$mdBottomSheet.hide();
	//   						$('.md-bottom-sheet-backdrop').css('display', 'none')
	//   						$('#page-wrap').css('display', 'none');
	//   					}
	//   				}
	//   			}
	//   		});
	//     }
	// }, 1000);

	$scope.mHelp = "Anything";
	$scope.getAnything = function(help) {
		$scope.mHelp = help;
		if (ww <= 736)
			$scope.closemmodal();
	};

	/*** SECTION SEARCH MEET ***/
	$scope.count = -1;
	$scope.skillList = [];
	$scope.skillListM = [];

	$scope.searchSkill = function(name) {
		$scope.skillName = [];

		if (ww > 736) {
			if (document.getElementById('labelNoText')) {
				document.getElementById('labelNoText').id = "labelText";
				document.getElementById('labelNoText2').id = "labelText2";
				document.getElementById('labelText').style.display = "block";
				document.getElementById('labelText2').style.color = "white";
			}
			document.getElementById('msabox1').style.display = "none";
			document.getElementById('msabox2').style.display = "none";

			if ($scope.skillList.length < 5) {
				if ($scope.skillList.length == 0) {
					$scope.skillList.push({sName: name});
					document.getElementById('input-msa').style.display = "none";

				}
				else {
					for(var i = 0; i < $scope.skillList.length; i++) {
						if ($scope.skillList[i].sName === name)
							break;
					}
					if (i == $scope.skillList.length) {
						$scope.skillList.push({sName: name});
						document.getElementById('input-msa').style.display = "none";
					}
				}
			}
			if ($scope.skillList.length == 5)
				$scope.fullList = true;

			$http.post('/search/users', $scope.skillList).success(function(res) {
				$scope.skillSearch = res.data;
			});

		} else {

			if ($scope.skillListM.length < 5) {
				if ($scope.skillListM.length === 0) {
					$scope.skillListM.push({sName: name});
				}
				else {
					for(var i = 0; i < $scope.skillListM.length; i++) {
						if ($scope.skillListM[i].sName === name)
							break;
					}
					if (i == $scope.skillListM.length) {
						$scope.skillListM.push({sName: name});
					}
				}
			}

			$http.post('/search/users', $scope.skillListM).success(function(res) {
				$scope.skillSearch = res.data;
			});
		}

	}

	$scope.removeSkill = function(name) {

		var index;

		if (ww > 736) {
			var x = document.getElementsByClassName('meet-skill-list');
			
			for (var i = 0; i < $scope.skillList.length; i++) {
				if ($scope.skillList[i].sName === name) {
					x[i].className = "meet-skill-list animated fadeOut";
					index = i;
					break ;
				}
			}
			if (index >= 0)
				$scope.skillList.splice(index, 1);
			if ($scope.skillList.length < 5)
				$scope.fullList = false;
			if($scope.skillList[0]) {
				$http.post('/search/users', $scope.skillList).success(function(res) {
					$scope.skillSearch = res.data;
				});
			} else
				$scope.skillSearch = [];
		} else {
			for (var i = 0; i < $scope.skillListM.length; i++) {
				if ($scope.skillListM[i].sName === name) {
					index = i;
					break ;
				}
			}
			if (index >= 0)
				$scope.skillListM.splice(index, 1);
			if($scope.skillListM[0]) {
				$http.post('/search/users', $scope.skillListM).success(function(res) {
					$scope.skillSearch = res.data;
				});
			} else
				$scope.skillSearch = [];
		}
	}

	/*** SECTION PROFILE CARD ***/
	$scope.goToProfile = function(id) {
	    Users.getUserIdByProfileId(id).then(function(data) {
		$location.path('/' + data.userId.username);
	    });
	};
    
	$scope.followUserFromCard = function(id, index, $event) {
		if (!$rootScope.globals.currentUser) {
			showbottomAlert.pop_it($event);
		} else {
			Users.getUserIdByProfileId(id).then(function(data) {
				if ($rootScope.globals.currentUser.id !== data.userId.id) {
					Profile.followUser(data.userId.username, function(res) {
						if (res.success) {
							if (res.msg === "User followed")
							$scope.followed[index] = true;
							else
							$scope.followed[index] = false;
						}
					});
				}
			});
		}
	};

	/*** Search Section ***/
	$scope.$watchGroup(['mHelp', 'skillSearch', 'searchML'], function(value) {
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
						$scope.cardProfiles = res.data;
						if ($rootScope.globals.currentUser) {
							Profile.getFollowedUser(res.data, function(res){
								$scope.followed = res;
							});
						}	
					}
				});
			} else {
				if (value[0] !== "Anything" || value[2]) {
					$http.post('/search/users/al', object).success(function(res) {
						if (res.success)
							$scope.cardProfiles = res.data;
						if ($rootScope.globals.currentUser) {
							Profile.getFollowedUser(res.data, function(res){
								$scope.followed = res;
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
