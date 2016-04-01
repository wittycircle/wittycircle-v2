'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:DiscoverCtrl
 * @description
 * # DiscoverCtrl
 * Controller of the wittyApp
 **/

 angular.module('wittyApp')
 	.controller('DiscoverCtrl', function($scope, $http, $rootScope, $stateParams, Categories, Projects, showbottomAlert, $mdBottomSheet, Beauty_encode, algolia, $timeout) {

 		/*** ALGOLIA ***/
 		var client = algolia.Client("YMYOX3976J", "994a1e2982d400f0ab7147549b830e4a");
		var ProjectSearch = client.initIndex('ProjectSearch');

	 	/*****-- DATA --*****/
	 	$http.get('/skills').success(function(res) {
			$scope.skills = res.skills;
		});

	 	$scope.helps = ['Teammate', 'Freelancer', 'Feedback', 'Mentor', 'Tips', 'Fundings', 'Any help'];
	 	$scope.cProject = 'All Projects';
	 	$scope.cHelp = 'Any help';
	 	$scope.limit = 12;

	 	function getDiscoverCard() {
		 	$http.get('/projects/discover').success(function(res) {
		 		$scope.cards = res;
		 	});
		}; getDiscoverCard();


		/*** Discover Card Page ***/
		$scope.$parent.seo = {
			pageTitle: "Wittycircle | Discover",
			pageDescription: "What do you want to discover? Art, Design, Music, Science, Technology, Sport, find projects that fit your favorite categories."
		};

		$scope.$parent.card = {
			title: "Wittycircle | Discover",
			url: "http://www.wittycircle.com/discover",
			image: "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1458394081/Bf-cover/background-footer1.jpg",
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
		// setTimeout(function() {
		//     if (!$rootScope.globals.currentUser) {
		//   		$(window).scroll(function () {
		//   			if ($('#discover-body-page')[0]) {
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

		$scope.goToProfile 		= function(id) {
			Users.getUserIdByProfileId(id).then(function(data) {
				$location.path('/' + data.userId.username);
			});
		};
		/*** get project name ***/
		$scope.getProject 		= function (pName, number) {
			switch (number) {
				case 1:
					$scope.cProject = "Idea";
					$scope.searchStatus = pName;
					break ;
				case 2:
					$scope.cProject = "Drafted projects";
					$scope.searchStatus = pName;
					break ;
				case 3:
					$scope.cProject = "Beta projects";
					$scope.searchStatus = pName;
					break ;
				case 4:
					$scope.cProject = "Live projects";
					$scope.searchStatus = pName;
					break ;
				case 5:
					$scope.cProject = "All projects";
					$scope.searchStatus = pName;
					break ;
			};
		};

		/*** get category name ***/
		$scope.getCategory 		= function (cName) {
			$scope.ctgName 		= cName;
			$scope.searchCtg 	= cName;
		};

		/*** get tag category name ***/
		$scope.getTagCag		= function(tagName) {
			$scope.ctgName 		= tagName;
			$scope.searchCtg 	= tagName;
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
			$scope.searchHelp 		= hName;
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
		$scope.expand = function() {
			if ($scope.allowExpand) {
				$scope.limit += 6;
				if ($scope.limit >= $scope.cards.length)
					$scope.allowExpand = false; 
			}
		};

		$scope.skillList = [];
		$scope.count = -1;
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
			$http.post('/search/projects/skills', $scope.skillList).success(function(res) {
				if (res.success)
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
			if (index >= 0) {
				$scope.skillList.splice(index, 1);
				if ($scope.skillList[0]) {
					$http.post('/search/projects/skills', $scope.skillList).success(function(res) {
						if (res.success)
							$scope.skillSearch = res.data;
					});
				} else
					$scope.skillSearch = [];
			}
			if ($scope.skillList.length < 5)
				$scope.fullList = false;
		}

		/*** Search Section ***/
		function searchScl(object) {
			$http.post('/search/projects/scl', object).success(function(res) {
				console.log(res);
				if (!res.success) return getDiscoverCard();
				$scope.cards = res.data; 
			});
		};
		function searchSkill(object) {
			$http.put('/search/projects/skills', object).success(function(res) {
				if (res.success)
					$scope.cards = res.data;
			});
		};
		function searchHelp(val, object) {
			$http.post('/search/projects/help/' + val, object).success(function(res) {
				if (!res.success) return getDiscoverCard();
				$scope.cards = res.data;
			});
		};

		$scope.$watch('cards', function(value) {
			if (value)
				value.length > 6 ? $scope.allowExpand = true : $scope.allowExpand = false;
		});

		$scope.$watchGroup(['searchStatus', 'searchCtg', 'searchHelp', 'skillSearch', 'searchDL'], function(value) {

			if (value) {

				$('#hoho').css('display', 'block');
				$('#haha').css('display', 'none');

				$timeout(function() {
					$('#hoho').css('display', 'none');
					$('#haha').css('display', 'block');
				}, 500);

				if (value[2] || value[3]) {

					var object = {
						status 	: value[0],
						ctg 	: value[1],
						list 	: value[3],
						geo 	: value[4]
					};

					if (value[2])
						return searchHelp(value[2], object);
					else {
						if (value[0] || value[1] || value[4]) {
							if (!value[3][0])
								return searchScl(object);
							return searchSkill(object);
						} else
							if (value[3][0])
								$scope.cards = value[3];
					}
				}
				else {
					var object = {
						status 	: value[0],
						ctg 	: value[1],
						geo 	: value[4]
					};

					if (value[0] || value[1] || value[4])
						return searchScl(object);
				}
			}	
		});
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
					scope.searchDL = model.$viewValue.slice(0, x).toLowerCase();
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
								if (w < 200)
									return "200px";
								return w.toString() + "px";
							});
						}
					}
				}
			});
    	}	
	}
});
