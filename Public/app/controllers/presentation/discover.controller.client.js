'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:DiscoverCtrl
 * @description
 * # DiscoverCtrl
 * Controller of the wittyApp
 **/

 angular.module('wittyApp')
 	.controller('DiscoverCtrl', function($scope, $http, $rootScope, $stateParams, Categories, Projects, showbottomAlert, $mdBottomSheet, Beauty_encode) {

	 	/*****-- DATA --*****/
	 	$http.get('http://127.0.0.1/skills').success(function(res) {
			$scope.skills = res.skills;
		});

	 	$scope.projects = ['Idea', 'Drafted Projects', 'Beta Projects', 'Live Projects', 'All Projects'];
	 	$scope.helps = ['Teammate', 'Freelancer', 'Feedback', 'Mentor', 'Tips', 'Fundings', 'Any help'];
	 	$scope.cProject = 'All Projects';
	 	$scope.cHelp = 'Any help';
	 	$scope.limit = 12;

	 	$http.get('http://127.0.0.1/projects/discover').success(function(res) {
	 		$scope.cards = res;
	 	});


		/*** Discover Card Page ***/
		$scope.$parent.seo = {
			pageTitle: "Wittycircle | Discover",
			pageDescription: "What do you want to discover? Art, Design, Music, Science, Technology, Sport, find projects that fit your favorite categories."
		};

		$scope.$parent.card = {
			title: "Discover",
			type: "Discover page",
			url: "http://www.wittycircle.com/discover",
			image: "http://res.cloudinary.com/dqpkpmrgk/image/upload/v1458394081/Bf-cover/background-footer1.jpg",
		};

    $scope.encodeUrl = function(url) {
      return Beauty_encode.encodeUrl(url);
    }

		Categories.getCategories(function (response) {
			$scope.categories = response;
			if ($stateParams.tagParams) {
				$scope.searchCtg = $stateParams.tagParams;
				$scope.ctgName = $stateParams.tagParams;
			}
			else
				$scope.ctgName = "Art";
		});

		$scope.$on("$destroy", function(){
			$scope.skills = 0;
			var container = $('.custom-popover');
			if (container.length) {
				$mdBottomSheet.hide();
				$('.md-bottom-sheet-backdrop').css('display', 'none')
				$('#page-wrap').css('display', 'none');
			}
		});

		/*****-- FUNCTION --*****/
		setTimeout(function() {
		    if (!$rootScope.globals.currentUser) {
		  		$(window).scroll(function () {
		  			if ($('#discover-body-page')[0]) {
		  				var x = $(window).scrollTop();
		  				var container = $('.custom-popover');
		  				if (x > 350) {
		  					if (!container.length) {
		  						$mdBottomSheet.hide();
		  						showbottomAlert.pop_it_persistance();
		  						setTimeout(function() {
		  							$('#main-body .md-bottom-sheet-backdrop').css('display', 'none');
		  							$('#page-wrap').css('display', 'block');
		  						}, 150);
		  					}
		  				}
		  				if (x < 350) {
		  					if (container.length) {
		  						$mdBottomSheet.hide();
		  						$('.md-bottom-sheet-backdrop').css('display', 'none')
		  						$('#page-wrap').css('display', 'none');
		  					}
		  				}
		  			}
		  		});
		    }
		}, 1000);

		$scope.displayProjects = function(data) {
			if (data > 6) {
				$scope.allowExpand = true;
			} else {
				$scope.allowExpand = false;
				$scope.limit = 6;
			}
		}

		$scope.goToProfile 		= function(id) {
			Users.getUserIdByProfileId(id).then(function(data) {
				$location.path('/' + data.userId.username);
			});
		};
		/*** get project name ***/
		$scope.getProject 		= function (pName) {
			$scope.cProject 	= pName;
			$scope.searchStatus = pName;
		};

		/*** get category name ***/
		$scope.getCategory 		= function (cName) {
			$scope.ctgName 		= cName;
			$scope.searchCtg 	= cName;
		};

		/*** get tag category name ***/
		$scope.getTagCag		= function(tagName) {
			$scope.ctgName 		= tagName;
		};

		/*** get help name ***/
		$scope.getHelp = function(hName) {
			if (hName === "Any help" || hName === "Teammate" || hName === "Mentor" || hName === "Tips") {
				document.getElementById('dstext').style.display = "inline-block";
				document.getElementById('dsdrop1').style.display = "inline-block";
				// setTimeout(function() {
				// 	document.getElementById('dsdrop1').style.display = "inline-block";
				// }, 400);
			} else {
				document.getElementById('dstext').style.display = "none";
				document.getElementById('dsdrop1').style.display = "none";
			}
			$scope.cHelp	 		= hName;
			$scope.searcHelp 		= hName;
			if ($scope.cHelp === 'Feedback') {
				$scope.skillList 	= [];
				if (document.getElementById('labelNoText')) {
					document.getElementById('labelNoText').id = "labelText";
					document.getElementById('labelNoText2').id = "labelText2";
					document.getElementById('labelText').style.display = "block";
					document.getElementById('labelText2').style.color = "white";
				}
				document.getElementById('dsabox1').style.display = "none";
				document.getElementById('dsabox2').style.display = "none";
				document.getElementById('input-dsa').style.display = "inline-block";
				$scope.displaySk = true;
			}
			else
				$scope.displaySk = false;
		};

		/*** expand project list ***/
		$scope.expand = function(limit) {
			if ($scope.allowExpand) {
				$scope.limit += 12;
			}
		}

		$scope.skillList = [];
		$scope.count = -1;
		$scope.skillSearch = [];
		/*** add skill to search ***/
		$scope.searchSkill = function(name) {
			$scope.skillName = [];
			if (document.getElementById('labelNoText')) {
				document.getElementById('labelNoText').id = "labelText";
				document.getElementById('labelNoText2').id = "labelText2";
				document.getElementById('labelText').style.display = "block";
				document.getElementById('labelText2').style.color = "white";
			}
			document.getElementById('dsabox1').style.display = "none";
			document.getElementById('dsabox2').style.display = "none";

			if ($scope.skillList.length < 5) {
				if ($scope.skillList.length === 0) {
					$scope.skillList.push({sName: name});
					document.getElementById('input-dsa').style.display = "none";
				}
				else {
					for(var i = 0; i < $scope.skillList.length; i++) {
						if ($scope.skillList[i].sName === name)
							break;
					}
					if (i == $scope.skillList.length) {
						$scope.skillList.push({sName: name});
						document.getElementById('input-dsa').style.display = "none";
					}
				}
			}
			if ($scope.skillList.length == 5)
				$scope.fullList = true;
			$http.post('http://127.0.0.1/skills/search/projects', $scope.skillList).success(function(res) {
				$scope.skillSearch = res.data;
			});

		}

		/*** remove skill added ***/
		$scope.removeSkill = function(name) {

			var x = document.getElementsByClassName('discover-skill-list');
			var index;

			for (var i = 0; i < $scope.skillList.length; i++) {
				if ($scope.skillList[i].sName === name) {
					x[i].className = "discover-skill-list animated fadeOut";
					index = i;
					break ;
				}
			}
			if (index >= 0)
				$scope.skillList.splice(index, 1);
			if ($scope.skillList.length < 5)
				$scope.fullList = false;
			$http.post('http://127.0.0.1/skills/search/users', $scope.skillList).success(function(res) {
				$scope.skillSearch = res.data;
			});
		}
})
.directive('preDisLocation', function() {
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
					scope.searchDL = model.$viewValue.slice(0, x);
				});
			});

			scope.$watch('discoverLocation', function(value) {
				if (value) {
					var checkCountry = value.indexOf('United States');
					if (checkCountry >= 0) {
						scope.discoverLocation = value.slice(0, checkCountry - 2);
						var x = scope.discoverLocation.length;
					} else {
						var x = value.length;
						if (x > 11) {
							$("#dsai").css('width', function() {
								var el = $('<span />', {
								text : value,
								css  : {left: -9999, position: 'relative', 'font-family': 'FreigLight', 'font-size': '32px'}
								}).appendTo('body');
								var w = parseInt(el.css('width').replace(/[^-\d\.]/g, '')) + 30;
								el.remove();
								return w.toString() + "px";
							});
						}
					}
				}
			});
    	}	
	}
});
