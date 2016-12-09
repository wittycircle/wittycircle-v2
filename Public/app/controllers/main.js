'use strict';

angular.module('wittyApp').controller('MainCtrl', ['$scope', '$state', '$stateParams', '$rootScope', '$timeout', '$interval', 'Profile', 'Users', 'get_CategoryName', 'Authentication', 'Beauty_encode', 'Public_id', '$location', '$http', 'Projects', 'Data_project', 'showbottomAlert', 'RetrieveData', 'Project_Follow', '$filter',
function ($scope, $state, $stateParams, $rootScope, $timeout, $interval, Profile, Users, get_CategoryName, Authentication, Beauty_encode, Public_id, $location, $http, Projects, Data_project, showbottomAlert, RetrieveData, Project_Follow, $filter) {

    $http.get('/profile').success(function(res){
        Authentication.SetCredentialsSocial(res.user, res.user_info);
    });

    var socket = io.connect('http://127.0.0.1');

    var main    = this,
    n       = 0;

    /*** Controller As Main Function ***/
    main.openmamodal            = openmamodal;
    main.closemmodal            = closemmodal;
    main.stopInterval           = stopInterval;
    main.getShuffleProject      = getShuffleProject;
    main.getShuffleCag          = getShuffleCag;
    main.encodeUrl              = encodeUrl;
    main.goforstarter           = goforstarter;
    main.backtocta              = backtocta;
    main.getProject             = getProject;
    main.getCategory            = getCategory;
    main.savedata               = savedata;
    main.goToProfile            = goToProfile;
    main.goToDiscover           = goToDiscover;
    main.followUserFromCard     = followUserFromCard;
    main.voteProjectCard        = voteProjectCard;
    main.voteProjectCardShuffle = voteProjectCardShuffle;
    main.shuffleSearch          = shuffleSearch;

    /*** Controller As Main Variable ***/
    main.ww                     = $(window).width();
    main.currentUser            = $rootScope.globals.currentUser || false;
    main.isstartclicked         = false;
    main.statusProject          = "Idea";
    main.followed               = {};
    main.cardInfos              = {};

    main.mamobile;
    main.followed;
    main.cardProfiles;
    main.categories;
    main.ctgName;
    main.projectCards;
    main.cardsDisplays;
    main.cardInfo;
    main.idNameP;
    main.idName;
    main.shuffleCag;
    main.shuffleStatus;
    main.selectedname;


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
    
    /***** MOBILE *****/
    main.mamobile = {};

    /*** All Home Functions (Mobile) ***/
    function openmamodal(value) {

        if (main.ww < 736) {
            $('body').css('overflow-y', 'hidden');
            main.mamobile.modal  = value;
            if (value === 1)
            main.mamobile.headerText = "Show me...";
            if (value === 2)
            main.mamobile.headerText = "Show me projects about...";
            main.mamobile.general  = true;
            console.log(main.mamobile.general);
        }
    };

    function closemmodal() {
        $('#mainmmodal').css("display", "none");
        $('body').css('overflow-y', 'scroll');
        main.mamobile.general  = false;
    }

    /***** DESKTOP *****/

    RetrieveData.getData('/projects', 'GET').then(function(response) {
        main.projectCards     = response;
    });

    RetrieveData.getData('/projects/shuffler', 'GET').then(function(response) {
        main.cardsDisplays    = response
        main.cardInfos        = response;
        main.cardInfo         = response[0];
        if (response[0])
        getLocation(response[0].location_city, response[0].location_country, response[0].location_state);

        function hello() {
            $('#mbcardList_0').fadeIn();
        };
        $timeout(hello, 400);
    });

    $(document).ready(function() {
        $.getJSON("https://jsonip.com/", function (data) {
            RetrieveData.ppdData('/user/card/profiles/home', 'POST', {ip: data.ip}).then(function(result) {
                main.cardProfiles = result.data;
                if (main.currentUser) {
                    Profile.getFollowedUser(result.data, function(res){
                        main.followed = res;
                    });
                }
            });
        });
    });

    RetrieveData.getData('/categories', 'GET').then(function(response) {
        main.categories = response;
        main.ctgName    = {name: "Any category", id: null};
    });

    /*** All Home Functions (Desktop) ***/
    function getLocation(city, country, state) {
        if (!state && !country)
        $scope.shufflerLocation = city;
        if (state)
        $scope.shufflerLocation = city + ', ' + state;
        if (!state)
        $scope.shufflerLocation = city + ', ' + country;
    };


    function loop() {
        n++;
        main.idNameP = "#mbcardList_" + (n - 1).toString();
        if (n === 10)
        main.idName = "#mbcardList_0";
        else
        main.idName  = "#mbcardList_" + n.toString();
        $(main.idNameP).fadeOut(800);
        main.cardInfo = main.cardInfos[n];
        if (main.cardInfos[n])
        getLocation(main.cardInfos[n].location_city, main.cardInfos[n].location_country, main.cardInfos[n].location_state);
        $(main.idName).fadeIn(600);
        if (n === 10)
        n = 0;
    };
    main.interval = $interval(loop, 4000);

    function shuffleSearch(searchText) {
        var object = $filter('wittyFilterDiscover')(main.cardsDisplays, searchText);
        main.newCardDisplay = object[0];
        main.shuffleStatus = searchText === "project" ? "project" : object[0].status;
        main.shuffleCag    = object[0].category_name;
        $scope.shufflerLocation = object[0].location_state ? object[0].location_city + ', ' + object[0].location_state.toUpperCase() :
        object[0].location_city + ', ' + object[0].location_country;
    };

    function stopInterval() {
        $interval.cancel(main.interval);
    };

    function voteProjectCardShuffle(public_id, index) {
        if (main.currentUser) {
            if (main.cardsDisplays[index].check_vote === 0) {
                main.cardsDisplays[index].vote = main.cardsDisplays[index].vote + 1;
                main.cardsDisplays[index].check_vote = 1;
            }
            else {
                main.cardsDisplays[index].vote = main.cardsDisplays[index].vote - 1;
                main.cardsDisplays[index].check_vote = 0;
            }
            Project_Follow.followProject(public_id, index, function (response) {
                // if (response.success) {
                //     if (response.msg === 'Project followed')
                //     vm.followText = 'Following';
                //     else
                //     vm.followText = 'Follow';
                // }
            }); 
        } else {
            showbottomAlert.pop_it();
        }
    };

    function getShuffleProject(pName, cCtg) {
        $interval.cancel(main.interval);
        if (!main.shuffleCag)
        main.shuffleCag = cCtg;
        if (pName === "All projects")
        main.shuffleStatus = "project";
        else
        main.shuffleStatus = pName;
        shuffleSearch(main.shuffleStatus);
        $('#mbcardList_0').fadeIn();
    };

    function getShuffleCag(cName, cStatus) {
        $interval.cancel(main.interval);
        main.shuffleCag = cName;
        if (!main.shuffleStatus)
        main.shuffleStatus = cStatus + " project";
        shuffleSearch(cName);
        $('#mbcardList_0').fadeIn();
    };

    function encodeUrl(url) {
        url = Beauty_encode.encodeUrl(url);
        return url;
    };

    function stopInterval() {
        $interval.cancel(main.interval);
    };

    function goforstarter() {
        document.getElementById('main-discover').className = "animated fadeOutLeftBig";
        document.getElementById('main-start-project').className = "animated fadeInRightBig";
        main.isstartclicked = true;
    };

    if ($stateParams.tagStart) {
        console.log("HELLO");
        main.goforstarter();
    }

    function backtocta() {
        document.getElementById('main-discover').className = "animated fadeInLeftBig";
        document.getElementById('main-start-project').className = "animated fadeOutRightBig";
        $timeout(function(){main.isstartclicked = false}, 100);
        //main.isstartclicked = false;
    };

    function getProject(pName) {
        if (main.ww < 736)
        main.closemmodal();
        main.statusProject = pName;
    };

    function getCategory(cName) {
        if (main.ww < 736)
        main.closemmodal();
        main.ctgName = cName;
    };

    function savedata($event) {
        if (!main.currentUser) {
            showbottomAlert.pop_it($event);
        }
        else {
            if (main.ctgName.name === "Any category")
                return ;
            var data          = {},
            errorMessage  = "";


            if ($scope.selectedlocation) {
                var location              = $scope.selectedlocation.split(",");
                if (!location[1]) {
                    var location              = $scope.selectedlocation.split(","),
                    location_country         = location[0].trim();
                    data.location_city        = location_country;
                    data.location_country     = location_country;
                } else {
                    var location              = $scope.selectedlocation.split(","),
                    location_city         = location[0],
                    location_country      = location[1].trim();
                    data.location_city        = location_city;
                    data.location_country     = location_country;
                }
            }


            data.status                 = main.statusProject;
            data.category_id            = main.ctgName.id;
            data.title                  = main.selectedname;
            data.public_id              = Public_id.createPublicId();
            data.creator_user_name      = main.currentUser.first_name + ' ' + main.currentUser.last_name;
            data.project_visibility     = 1;
            if (main.currentUser.profile_picture) {
                data.creator_user_picture = main.currentUser.profile_picture;
            }
            data.category_name = get_CategoryName.get_Name(data.category_id, function(response) {
                data.category_name = response;
                Projects.createProject(data, function(response) {
                    if (response.serverStatus == 2) {
                        Data_project.setProjectId(response.insertId);
                        $location.path('/create-project/basics');
                    }
                    else {
                        errorMessage = response;
                        console.log(console.errorMessage);
                    }
                });
            });
        }
    };

    function voteProjectCard(public_id, index) {
        if (main.currentUser) {
            if (main.projectCards[index].check_vote === 0) {
                main.projectCards[index].vote = main.projectCards[index].vote + 1;
                main.projectCards[index].check_vote = 1;
            }
            else {
                main.projectCards[index].vote = main.projectCards[index].vote - 1;
                main.projectCards[index].check_vote = 0;
            }
            Project_Follow.followProject(public_id, index, function (response) {
                // if (response.success) {
                //     if (response.msg === 'Project followed')
                //     vm.followText = 'Following';
                //     else
                //     vm.followText = 'Follow';
                // }
            });
        } else {
            showbottomAlert.pop_it();
        }
    };

    // socket.on('project-vote', function(data) {
    //     if (data.user_id !== main.currentUser.id) {
    //         RetrieveData.getData('/projects', 'GET').then(function(res) {
    //             main.projectCards[data.index].vote = res[data.index].vote;
    //         });
    //     }
    // });

    // socket.on('project-vote-del', function(data) {
    //     if (data.user_id !== main.currentUser.id) {
    //         RetrieveData.getData('/projects', 'GET').then(function(res) {
    //             main.projectCards[data.index].vote = res[data.index].vote;
    //         });
    //     }
    // });

    function goToProfile(id) {
        Users.getUserIdByProfileId(id).then(function(data) {
            $location.path('/' + data.userId.username);
        });
    };

    function goToDiscover(category) {
        $state.go('discover', {tagParams: category});
    };

    function followUserFromCard(id, index, $event) {
        if (!main.currentUser) {
            showbottomAlert.pop_it();
        } else {
            Users.getUserIdByProfileId(id).then(function(data) {
                if (main.currentUser.id !== data.userId.id) {
                    Profile.followUser(data.userId.username, function(res) {
                        if (res.success) {
                            if (res.msg === "User followed")
                            main.followed[index] = true;
                            else
                            main.followed[index] = false;
                        }
                    });
                }
            });
        }
    };

        function goToDiscover(category) {
            $state.go('discover', {tagParams: category});
        };

        function followUserFromCard(id, index, $event) {
            if (!main.currentUser) {
                showbottomAlert.pop_it();
            } else {
                Users.getUserIdByProfileId(id).then(function(data) {
                    if (main.currentUser.id !== data.userId.id) {
                        Profile.followUser(data.userId.username, function(res) {
                            if (res.success) {
                                if (res.msg === "User followed")
                                    main.followed[index] = true;
                                else
                                    main.followed[index] = false;
                            }
                        });
                    }
                });
            }
        };

        /*** Destroy Controller ***/
        $scope.$on("$destroy", function(){
            $interval.cancel(main.interval);
        });

}])
.directive('mainBody3', function() {
    return {
        restrict: 'AE',
        scope: {
            data: '='
        },
        link: function(scope, element, attrs) {
            var scopeD = scope.data;
            /*** Hover Follow ***/
            $('.main-body3-body').mouseup(function(e) {
                if (scopeD.currentUser) {
                    var id      = e.target.id;
                    var index   = e.target.id.slice(3);
                    scopeD.idName  = "fop" + index;
                    scopeD.idName2 = "foc" + index;
                    if (id.indexOf("cfs") !== -1 || id.indexOf("fop") !== -1 || id.indexOf("foc") !== -1) {
                        if (document.getElementById(scopeD.idName).className === "fa fa-plus" || document.getElementById(scopeD.idName).className === "fa fa-plus animated fadeIn") {
                            document.getElementById(scopeD.idName).className = "fa fa-plus animated fadeOut";
                            document.getElementById(scopeD.idName2).className = "fa fa-check animated fadeIn";
                        } else {
                            document.getElementById(scopeD.idName).className = "fa fa-plus animated fadeIn";
                            document.getElementById(scopeD.idName2).className = "fa fa-check animated fadeOut";
                        }
                    }
                }
            });
        }
    }
})
.directive('slick', [
    '$timeout',
    function ($timeout) {
        return {
            restrict: 'AEC',
            scope: {
                initOnload: '@',
                data: '=',
            },
            link: function (scope, element, attrs) {
                var destroySlick, initializeSlick, isInitialized;
                destroySlick = function () {
                    return $timeout(function () {
                        var slider;
                        slider = $(element);
                        slider.unslick();
                        slider.find('.slick-list').remove();
                        return slider;
                    });
                };

                initializeSlick = function () {
                    return $timeout(function () {
                        var currentIndex, customPaging, slider;
                        slider = $(element);
                        if (scope.currentIndex != null) {
                            currentIndex = scope.currentIndex;
                        }
                        customPaging = function (slick, index) {
                            return scope.customPaging({
                                slick: slick,
                                index: index
                            });
                        };
                        slider.slick({
                            centerMode: true,
                            variableWidth: true,
                            mobileFirst: true,
                            dots: true,
                            nextArrow: "",
                            swipeToSlide: true,
                            speed: 200,

                            responsive: [{
                                breakpoint: 768,
                                settings: {
                                    arrows: false,
                                    centerMode: true,
                                    centerPadding: '40px',
                                    slidesToShow: 3
                                }
                            },
                            {
                                breakpoint: 480,
                                settings: {
                                    arrows: false,
                                    centerMode: true,
                                    centerPadding: '40px',
                                    slidesToShow: 1
                                }
                            }]
                        });
                        slider.on('init', function (sl) {
                            if (attrs.onInit) {
                                scope.onInit();
                            }
                            if (currentIndex != null) {
                                return sl.slideHandler(currentIndex);
                            }
                        });
                        slider.on('afterChange', function (event, slick, currentSlide, nextSlide) {
                            if (scope.onAfterChange) {
                                scope.onAfterChange();
                            }
                            if (currentIndex != null) {
                                return scope.$apply(function () {
                                    currentIndex = currentSlide;
                                    return scope.currentIndex = currentSlide;
                                });
                            }
                        });
                        return scope.$watch('currentIndex', function (newVal, oldVal) {
                            if (currentIndex != null && newVal != null && newVal !== currentIndex) {
                                return slider.slick('slickGoTo', newVal);
                            }
                        });
                    });
                };
                if (scope.initOnload) {
                    isInitialized = false;
                    return scope.$watch('data', function (newVal, oldVal) {
                        if (newVal != null) {
                            if (isInitialized) {
                                destroySlick();
                            }
                            initializeSlick();
                            return isInitialized = true;
                        }
                    });
                } else {
                    return initializeSlick();
                }
            }
        };
    }
])
.directive('slickMain', [
    '$timeout',
    function ($timeout) {
        return {
            restrict: 'AEC',
            scope: {
                initOnload: '@',
                data: '=',
            },
            link: function (scope, element, attrs) {
                var destroySlick, initializeSlick, isInitialized;
                destroySlick = function () {
                    return $timeout(function () {
                        var slider;
                        slider = $(element);
                        slider.unslick();
                        slider.find('.slick-list').remove();
                        return slider;
                    });
                };

                // initializeSlick = function () {
                //     return $timeout(function () {
                //         var currentIndex, customPaging, slider;
                //         slider = $(element);
                //         if (scope.currentIndex != null) {
                //             currentIndex = scope.currentIndex;
                //         }
                //         customPaging = function (slick, index) {
                //             return scope.customPaging({
                //                 slick: slick,
                //                 index: index
                //             });
                //         };
                //         slider.slick({
                //             dots: true,
                //             infinite: true,
                //             autoplay: true,
                //             prevArrow:"<img class='a-left control-c prev slick-prev' src='images/arrow-back-w-01.svg'>",
                //             nextArrow:"<img class='a-right control-c next slick-next' src='images/arrow-back-w-02.svg'>",
                //             swipeToSlide: true,
                //             speed: 200,
                //         });
                //         slider.on('init', function (sl) {
                //             if (attrs.onInit) {
                //                 scope.onInit();
                //             }
                //             if (currentIndex != null) {
                //                 return sl.slideHandler(currentIndex);
                //             }
                //         });
                //         slider.on('afterChange', function (event, slick, currentSlide, nextSlide) {
                //             if (scope.onAfterChange) {
                //                 scope.onAfterChange();
                //             }
                //             if (currentIndex != null) {
                //                 return scope.$apply(function () {
                //                     currentIndex = currentSlide;
                //                     return scope.currentIndex = currentSlide;
                //                 });
                //             }
                //         });
                //         return scope.$watch('currentIndex', function (newVal, oldVal) {
                //             if (currentIndex != null && newVal != null && newVal !== currentIndex) {
                //                 return slider.slick('slickGoTo', newVal);
                //             }
                //         });
                //     });
                // };
                if (scope.initOnload) {
                    isInitialized = false;
                    return scope.$watch('data', function (newVal, oldVal) {
                        if (newVal != null) {
                            if (isInitialized) {
                                destroySlick();
                            }
                            initializeSlick();
                            return isInitialized = true;
                        }
                    });
                } else {
                    return initializeSlick();
                }
            }
        };
    }
])
.directive('googlePlace', function($timeout) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
	    $timeout(function() {
		var options = {
                    types: ['(cities)'],
		};
		
		scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
		
		google.maps.event.addListener(scope.gPlace, 'place_changed',
					      function() {
						  scope.$apply(function() {
						      model.$setViewValue(element.val());
						      var x = model.$viewValue.indexOf(',');
						      scope.searchHL = model.$viewValue.slice(0, x);
						  });
					      });
		
		scope.$watch('selectedlocation', function(value) {
                    if (value) {
			var checkCountry = value.indexOf('United States');
			if (checkCountry >= 0) {
                            scope.selectedlocation = value.slice(0, checkCountry - 2);
                            var x = scope.selectedlocation.length;
			} else
			    var x = value.length;
			if (x > 11) {
                            var x = value.length,
                            y = $(window).width();
                            if (x > 11) {
				$("#searchTextField").css('width', function() {
                                    var el = $('<span />', {
					text : value,
					css  : {left: -9999, position: 'relative', 'font-family': 'FreigLight', 'font-size': '32px'}
                                    }).appendTo('body');
                                    var w = parseInt(el.css('width').replace(/[^-\d\.]/g, '')) + 30;
                                    el.remove();
                                    if (y > 736)
					return w.toString() + "px";
                                    else
					return "260px";
				});
                            } else
				$("#searchTextField").css('width', '200px');
			}
                    }
		});
		
		scope.$watch('shufflerLocation', function(value, oldvalue) {
                    if (value !== oldvalue) {
			var checkCountry = value.indexOf('United States');
			if (checkCountry >= 0) {
                            scope.shufflerLocation = value.slice(0, checkCountry - 2);
                            var x = scope.shufflerLocation.length;
			} else {
                            var x = value.length;
                            if (x > 7) {
				$("#mbsLocation").css('width', function() {
                                    var el = $('<span />', {
					text : value,
					css  : {left: -9999, position: 'relative', 'font-family': 'FreigLight', 'font-size': '32px'}
                                    }).appendTo('body');
                                    var w = parseInt(el.css('width').replace(/[^-\d\.]/g, '')) + 50;
                                    el.remove();
                                    return w.toString() + "px";
				});
                            }
			}
                    }
		});
	    }, 1000);
        }
    }
});
