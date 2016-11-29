'use strict';

/**
* @ngdoc function
* @name wittyApp.controller:DiscoverCtrl
* @description
* # DiscoverCtrl
* Controller of the wittyApp
**/

angular.module('wittyApp')
.controller('DiscoverCtrl', function($scope, $http, $rootScope, $stateParams, Categories, Projects, Beauty_encode, algolia, $timeout, RetrieveData, $mdBottomSheet, $mdMenu, $state, Project_Follow, showbottomAlert) {

    var socket = io.connect('http://127.0.0.1');

    var discover = this;

    /*** Controller As Discover Function ***/
    discover.logIn          = $rootScope.globals.currentUser ? true : false;
    discover.opendmodal     = opendmodal;
    discover.closemmodal    = closemmodal;
    discover.getProject     = getProject;
    discover.getCategory    = getCategory;
    discover.encodeUrl      = encodeUrl;
    discover.getTagCag      = getTagCag;
    discover.getHelp        = getHelp;
    discover.expand         = expand;
    discover.searchSkill    = searchSkill;
    discover.removeSkill    = removeSkill;
    discover.voteProjectCard= voteProjectCard;

    // discover.goToProfile     = goToProfile;

    /*** Controller As Discover Variable ***/
    discover.ww = $(window).width();
    discover.cProject = 'All Projects';
    discover.cHelp = 'Any help';
    discover.limit = 9;

   // var allHelp = ['Teammate', 'Feedback', 'Mentor', 'Tips', 'Any help'];
   // var allStatu = ['Idea', 'Drafted project', 'Beta project', 'Live project', 'all'];
   // var skillListUrl = "";


    discover.dmobile;
    discover.skills;
    discover.cards;
    discover.categories;
    discover.searchCtg;
    discover.ctgName;
    discover.allowExpand;


    discover.skillList = [];
    discover.skillListM = [];

    getDiscoverCard();

    /*** Scope ***/
    /*** Discover Card Page SEO ***/
    $scope.$parent.seo = {
        pageTitle: "Wittycircle | Discover",
        //pageDescription: "What do you want to discover? Art, Design, Music, Science, Technology, Sport, find projects that fit your favorite categories."
    pageDescription: "Discover ideas, startups, products and many more awesome projects waiting for your help."
    };

    $scope.$parent.card = {
        title: "Wittycircle | Discover",
        url: "http://127.0.0.1/discover",
        image: "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1465994773/Share_Link_Cards_Facebook/Share_Pic_Facebook_Discover.png",
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

    /***** MOBILE *****/
    /*** Discover Mobile ***/
    discover.dmobile = {};

    /*** All Discover Functions (Mobile) ***/
    function opendmodal(value) {

        if (discover.ww <= 736) {
            $('body').css('overflow-y', 'hidden');
            discover.dmobile.modal  = value;
            if (value === 1)
            discover.dmobile.headerText = "Show me...";
            if (value === 2)
            discover.dmobile.headerText = "Show me projects about...";
            if (value === 3)
            discover.dmobile.headerText = "Show me projects looking for...";
            if (value === 4)
            discover.dmobile.headerText = "Someone with specific skills?";
            // if (value === 5)
            //  discover.dmobile.headerText = "Show me projects near...";
            discover.dmobile.general    = true;
        }
    };

    function closemmodal() {
        $('#dmmodal').css("display", "none");
        $('body').css('overflow-y', 'scroll');
        discover.dmobile.general    = false;
    }

    /***** DESKTOP *****/

    /*** All Requests On Load ***/
    RetrieveData.getData('/skills', 'GET').then(function(res) {
        discover.skills = res.skills;
    });

    function getDiscoverCard() {
        RetrieveData.getData('/projects/discover', 'GET').then(function(res) {
            discover.cards = res;
        });
    };

    function voteProjectCard(public_id, index) {
        if ($rootScope.globals.currentUser) {
            if (discover.cards[index].check_vote === 0) {
                discover.cards[index].vote = discover.cards[index].vote + 1;
                discover.cards[index].check_vote = 1;
            }
            else {
                discover.cards[index].vote = discover.cards[index].vote - 1;
                discover.cards[index].check_vote = 0;
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

    socket.on('project-vote', function(data) {
        if (data.user_id !== $rootScope.globals.currentUser.id) {
            RetrieveData.getData('/projects/discover', 'GET').then(function(res) {
                discover.cards[data.index].vote = res[data.index].vote;
            });
        }
    });

    socket.on('project-vote-del', function(data) {
        if (data.user_id !== $rootScope.globals.currentUser.id) {
            RetrieveData.getData('/projects/discover', 'GET').then(function(res) {
                discover.cards[data.index].vote = res[data.index].vote;
            });
        }
    });
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    RetrieveData.getData('/categories', 'GET').then(function(response) {
        discover.categories = response;
        if ($stateParams.category) {
            var str = $stateParams.category.toLowerCase();
            str = capitalizeFirstLetter(str);
            var obj = discover.categories.filter(function ( obj ) {
                return obj.name === str;
            })[0];
            if (obj != undefined) {
                discover.searchCtg = str;
                discover.ctgName = str;
            } else {
                discover.searchCtg = 'Any category';
                discover.ctgName = 'Any category';
            }
        }
        if ($stateParams.help) {
            var str = capitalizeFirstLetter($stateParams.help.toLowerCase());
            var arraycontains = (allHelp.indexOf(str) > -1);
            if (arraycontains === true) {
                discover.cHelp = str;
                discover.searchHelp = str;
            } else {
                discover.cHelp = 'Any help';
                discover.searchHelp = 'Any help';
            }
        }
        if ($stateParams.pstatus) {
            var str = capitalizeFirstLetter($stateParams.pstatus.toLowerCase());
            var arraycontains = (allStatu.indexOf(str) > -1);
            if (arraycontains === true) {
                discover.cProject = str;
                discover.searchStatus = str;
            } else {
                discover.cProject = 'All projects';
                discover.searchStatus = 'all';
            }
        }
        if ($stateParams.skills) {
            skillListUrl = $stateParams.skills;
            var tab = $stateParams.skills.split(',');
            for (var i = 0; i < tab.length; i++) {
                discover.skillList.push({sName: tab[i]});
            }
        }
        if ($stateParams.loc) {
            $scope.discoverLocation = $stateParams.loc;
        }
        if ($stateParams.tagParams) {
            discover.searchCtg = $stateParams.tagParams;
            discover.ctgName = $stateParams.tagParams;
        }
        if (!$stateParams.tagParams && !$stateParams.category) {
            discover.ctgName = "Any category";
        }
    });
    
    $rootScope.$on('$stateChangeStart', function() {
        $stateParams.tagParams = null;
    });

    /*** All Discover Functions (Desktop) ***/

    function encodeUrl(url) {
        return Beauty_encode.encodeUrl(url);
    }

    // $scope.$on("$destroy", function(){
    //  $scope.skills = 0;
    //  var container = $('.custom-popover');
    //  if (container.length) {
    //      $mdBottomSheet.hide();
    //      $('.md-bottom-sheet-backdrop').css('display', 'none')
    //      $('#page-wrap').css('display', 'none');
    //  }
    // });

    // function goToProfile(id) {
    //  Users.getUserIdByProfileId(id).then(function(data) {
    //      $location.path('/' + data.userId.username);
    //  });
    // };

    /*** get project name ***/
    function getProject(pName, number) {
        if (discover.ww <= 736)
        discover.closemmodal();
        switch (number) {
            case 1:
            discover.cProject = "Ideas";
            discover.searchStatus = "Idea";
            break ;
            case 2:
            discover.cProject = "Drafted projects";
            discover.searchStatus = pName;
            break ;
            case 3:
            discover.cProject = "Beta projects";
            discover.searchStatus = pName;
            break ;
            case 4:
            discover.cProject = "Live projects";
            discover.searchStatus = pName;
            break ;
            case 5:
            discover.cProject = "All projects";
            discover.searchStatus = pName;
            break ;
        };
    };

    /*** get category name ***/
    function getCategory(cName) {
        discover.ctgName        = cName;
        discover.searchCtg  = cName;
        if (discover.ww <= 736)
        discover.closemmodal();
    };

    /*** get tag category name ***/
    function getTagCag(tagName) {
        discover.ctgName        = tagName;
        discover.searchCtg  = tagName;
    };

    /*** get help name ***/
    function getHelp(hName) {
        if (discover.ww <= 736)
        discover.closemmodal();

        if (discover.ww > 736) {
            if (hName === "Any help" || hName === "Teammate" || hName === "Mentor" || hName === "Tips") {
                document.getElementById('dstext').style.display = "inline-block";
                document.getElementById('dsdrop1').style.display = "inline-block";
                // setTimeout(function() {
                //  document.getElementById('dsdrop1').style.display = "inline-block";
                // }, 400);
            } else {
                document.getElementById('dstext').style.display = "none";
                document.getElementById('dsdrop1').style.display = "none";
            }
            discover.cHelp          = hName;
            discover.searchHelp         = hName;
            if (discover.cHelp === 'Feedback') {
                discover.skillList  = [];
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
        } else {
            discover.cHelp          = hName;
            discover.searchHelp         = hName;
        }
    };

    /*** expand project list ***/
    function expand() {
        if (discover.allowExpand) {
            discover.limit += 6;
            if (discover.limit >= discover.cards.length)
            discover.allowExpand = false;
        }
    };

    /*** add skill to search ***/
    function searchSkill(name) {
        discover.skillName = [];

        if (discover.ww > 736) {
            if (document.getElementById('labelNoText')) {
                document.getElementById('labelNoText').id = "labelText";
                document.getElementById('labelNoText2').id = "labelText2";
                document.getElementById('labelText').style.display = "block";
                document.getElementById('labelText2').style.color = "white";
            }
            document.getElementById('dsabox1').style.display = "none";
            document.getElementById('dsabox2').style.display = "none";

            if (discover.skillList.length < 5) {
                if (discover.skillList.length === 0) {
                    discover.skillList.push({sName: name});
                    skillListUrl = name;
                    // $state.transitionTo('discover', {skills: skillListUrl}, { notify: false, inherit: true });
                    document.getElementById('input-dsa').style.display = "none";
                }
                else {
                    for(var i = 0; i < discover.skillList.length; i++) {
                        if (discover.skillList[i].sName === name)
                        break;
                    }
                    if (i == discover.skillList.length) {
                        discover.skillList.push({sName: name});
                        skillListUrl = skillListUrl + "," + name;
                       //  $state.transitionTo('discover', {skills: skillListUrl}, { notify: false, inherit: true });
                        document.getElementById('input-dsa').style.display = "none";
                    }
                }
            }

            if (discover.skillList.length == 5)
            discover.fullList = true;

            RetrieveData.ppdData('/search/projects/skills', 'POST', discover.skillList).then(function(res) {
                if (res.success)
                discover.skillSearch = res.data;
            });
        } else {
            if (discover.skillListM.length < 5) {
                if (discover.skillListM.length === 0) {
                    discover.skillListM.push({sName: name});
                }
                else {
                    for(var i = 0; i < discover.skillListM.length; i++) {
                        if (discover.skillListM[i].sName === name)
                        break;
                    }
                    if (i == discover.skillListM.length) {
                        discover.skillListM.push({sName: name});
                    }
                }
            }
            // if (discover.skillListM.length == 5)
            //  discover.fullList = true;

            RetrieveData.ppdData('/search/projects/skills', 'POST', discover.skillListM).then(function(res) {
                if (res.success)
                discover.skillSearch = res.data;
            });
        }

    }

    /*** remove skill added ***/
    function removeSkill(name) {
        var index;

        if (discover.ww > 736) {
            var x = document.getElementsByClassName('discover-skill-list');
            for (var i = 0; i < discover.skillList.length; i++) {
                if (discover.skillList[i].sName === name) {
                    x[i].className = "discover-skill-list animated fadeOut";
                    index = i;
                    break ;
                }
            }
            if (index >= 0) {
                discover.skillList.splice(index, 1);
                skillListUrl = skillListUrl.replace(',' + name, '');
                // $state.transitionTo('discover', {skills: skillListUrl}, { notify: false, inherit: true });
                if (discover.skillList[0]) {
                    RetrieveData.ppdData('/search/projects/skills', 'POST', discover.skillList).then(function(res) {
                        if (res.success)
                        discover.skillSearch = res.data;
                    });
                } else {
                    skillListUrl = skillListUrl.replace(name, '');
                   //  $state.transitionTo('discover', {skills: skillListUrl}, { notify: false, inherit: true });
                    discover.skillSearch = [];
                }
            }
            if (discover.skillList.length < 5)
            discover.fullList = false;
        } else {
            for (var i = 0; i < discover.skillListM.length; i++) {
                if (discover.skillListM[i].sName === name) {
                    index = i;
                    break ;
                }
            }
            if (index >= 0) {
                discover.skillListM.splice(index, 1);
                if (discover.skillListM[0]) {
                    RetrieveData.ppdData('/search/projects/skills', 'POST', discover.skillListM).then(function(res) {
                        if (res.success)
                        discover.skillSearch = res.data;
                    });
                } else {
                    discover.skillSearch = [];
                }
            }
        }
    }

    /*** Search Section ***/
    function searchScl(object) {
        RetrieveData.ppdData('/search/projects/scl', 'POST', object).then(function(res) {
            if (!res.success) return getDiscoverCard();
            discover.cards = res.data;
        });
    };
    function searchSkill2(object) {
        RetrieveData.ppdData('/search/projects/skills', 'PUT', object).then(function(res) {
            if (res.success)
            discover.cards = res.data;
        });
    };
    function searchHelpF(val, object) {
        RetrieveData.ppdData('/search/projects/help/', 'POST', object, val).then(function(res) {
            if (!res.success) return getDiscoverCard();
            discover.cards = res.data;
        });
    };

    /*var shareInterval = $timeout(function() {
        if ($rootScope.globals.currentUser && !$rootScope.socialCheck) {
            $http.get('/share/' + $rootScope.globals.currentUser.id).success(function(res) {
                if (!res.success) {
                    $rootScope.socialCheck = true;
                    showbottomAlert.pop_share();
                }
            });
        }
    }, 0);*/

    $scope.$on('$destroy', function() {
        $mdMenu.hide();
    });

    /*** All watch variable ***/
    $scope.$watch('discover.cards', function(value) {
        if (value)
        value.length > 6 ? discover.allowExpand = true : discover.allowExpand = false;
    });

    $scope.$watch('discover.dmobile.general', function(value) {
        if (value) {
            $('body').css('overflow', 'hidden');
        }
        else {
            $('body').css('overflow', 'auto');
        }
    });

    $scope.$watchGroup(['discover.searchStatus', 'discover.searchCtg', 'discover.searchHelp', 'discover.skillSearch', 'searchDL'], function (value) {
        if (value) {

            $('#hoho').css('display', 'block');
            $('#haha').css('display', 'none');

            $timeout(function() {
                $('#hoho').css('display', 'none');
                $('#haha').css('display', 'block');
            }, 500);
        
        if (value[2] || value[3]) {
                var object = {
                    status : value[0],
                    ctg : value[1],
                    list : value[3],
                    geo : value[4]
                };
                if (value[2]) {
                    // $state.transitionTo('discover', {help: value[2]}, { notify: false, inherit: true });
                    return searchHelpF(value[2], object);
                } else {
                    if (value[0] || value[1] || value[4]) {
                        if (!value[3][0]) {
                            if (value[0]) {
                               // $state.transitionTo('discover', {pstatus: value[0]}, { notify: false, inherit: true });
                            }
                            if (value[1]) {
                               // $state.transitionTo('discover', {category: value[1]}, { notify: false, inherit: true });
                            }
                            return searchScl(object);
                        }
                        return searchSkill2(object);
                    } else {
                        if (value[3][0]) {
                            discover.cards = value[3];
                        }
                    }
                }
            } else {
                var object = {
                    status : value[0],
                    ctg : value[1],
                    geo : value[4]
                };
                if (value[0] || value[1] || value[4]) {
                    // $state.transitionTo('discover', {pstatus: value[0], category: value[1]}, { notify: false, inherit: true });
                    return searchScl(object);
                }
            }
        }
    });
})
// .directive('sharePop', function($http, $rootScope, $mdBottomSheet, $timeout) {
//     return {
//         link: function(scope, element, attrs, model) {
//             /*** Scroll to display Popover ***/
//             var unique = 0;
//             var ww = $(window).width();

//             setTimeout(function() {
//             if (ww >= 736) {
//                 if (!$rootScope.globals.currentUser) {
            
//             $(document).unbind('scroll');
//                     $(document).scroll(function () {
//                         if ($('#discover-body-page')[0]) {
//                             var y = $(this).scrollTop();

//                             if (!unique && y > 350) {
//                                 unique = 1;
//                                 $mdBottomSheet.show({
//                                     templateUrl: 'views/core/popover-login.view.client.html',
//                                     controller: 'PopUpCtrl',
//                                     clickOutsideToClose: false,
//                                     disableParentScroll: false,
//                                 });
//                             }
//                             if (y <= 350) {
//                                 unique = 0;
//                                 $mdBottomSheet.hide();
//                             }
//                         }
//                     });
//                 }/* else {
//                     unique = 0;
//                     $(document).scroll(function() {
//                     if ($('#discover-body-page')[0] && !$rootScope.socialCheck) {
//                     var y = $(this).scrollTop();
            
//                     if (!unique && y > 350) {
//                     unique = 1;
//                     $http.get('/share/' + $rootScope.globals.currentUser.id).success(function(res) {
//                     if (!res.success) {
//                     $rootScope.socialCheck = true;
//                     $mdBottomSheet.show({
//                     templateUrl: 'views/core/popover-share.view.client.html',
//                     controller: 'PopUpCtrl',
//                     clickOutsideToClose: true,
//                     disableParentScroll: false,
//                     });
//                     }
//                     });
//                     }
//                     if (y <= 350) {
//                     $mdBottomSheet.hide();
//                     }
//                 }
//                 });
//             }*/
//             }
//             }, 1000);
//         }
//     }
// })
.directive('preDisLocation', function($state) {
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
                    // $state.transitionTo('discover', {loc: model.$viewValue}, { notify: false, inherit: true });
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
                        var x = value.length,
                        y = $(window).width();
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
