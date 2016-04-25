'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the wittyApp
 **/
angular.module('wittyApp').controller('MainCtrl', function ($scope, $state, $stateParams, $rootScope, $timeout, $interval, Profile, Users, get_CategoryName, Authentication, Beauty_encode, Public_id, $location, $http, Projects, Data_project, Categories, showbottomAlert) {

  // if ($rootScope.globals.currentUser) {
    $http.get('/profile').success(function(res){
      Authentication.SetCredentialsSocial(res.user, res.user_info);
    });
  // }

  $scope.followed = {};
  $scope.cardLoop = {};

  Users.getCardProfiles(function(result){
    $scope.cardProfiles = result.data;
    if ($rootScope.globals.currentUser) {
      Profile.getFollowedUser(result.data, function(res){
        $scope.followed = res;
      });
    }
  });

  $scope.isstartclicked = false;
  $scope.tog = 2;
  $scope.statusprefix = "a";
  $scope.statusProject = "Idea";
  $scope.strings = ['Idea', 'Drafted project', 'Beta project', 'Live project', 'All projects'];
  //$scope.projectcategory = ['Arts', 'Crafts', 'Design', 'Fashion', 'Film & video', 'Food', 'Games'];
  Categories.getCategories(function (response) {
    $scope.categories = response;
    $scope.ctgName    = response[0];
  })

  $scope.$watch('statusProject', function() {
    if ($scope.statusProject == 'Idea') {
      $scope.statusprefix = 'an'
    } else {
      $scope.statusprefix= 'a';
    }
  });

  /*** MOBILE ***/
  var ww = $(window).width();
  $scope.mamobile = {};
  $scope.openmamodal = function(value) {
    
    if (ww <= 736) {
      $('body').css('overflow-y', 'hidden');
      $scope.mamobile.modal  = value;
      if (value === 1)
        $scope.mamobile.headerText = "Show me...";
      if (value === 2)
        $scope.mamobile.headerText = "Show me projects about...";
      $scope.mamobile.general  = true;
      console.log($scope.mamobile.general);
    }
  };

  $scope.closemmodal = function() {
    $('#mainmmodal').css("display", "none");
    $('body').css('overflow-y', 'scroll');
    $scope.mamobile.general  = false;
  }

  /************ SECTION SUFFLER *************/
  var cardInfos = {};
  var n = 0;
  function getLocation(city, country, state) {
    if (!state && !country)
      $scope.shufflerLocation = city;
    if (state)
      $scope.shufflerLocation = city + ', ' + state;
    if (!state)
      $scope.shufflerLocation = city + ', ' + country;
  };

  $http.get('/projects').success(function (response) {
    $scope.projectCards     = response;
    $scope.cardsDisplays    = response.slice(0, 9);
    cardInfos               = response;
    $scope.cardInfo         = response[0];
    if (response[0])
      getLocation(response[0].location_city, response[0].location_country, response[0].location_state);

    function hello() {
      $('#mbcardList_0').fadeIn();
    };
    $timeout(hello, 400);
  });

  function loop() {
    n++;
    var idNameP = "#mbcardList_" + (n - 1).toString();
    if (n === 10)
      var idName = "#mbcardList_0";
    else
      var idName  = "#mbcardList_" + n.toString();
    $(idNameP).fadeOut(800);
    $scope.cardInfo = cardInfos[n];
    if (cardInfos[n])
      getLocation(cardInfos[n].location_city, cardInfos[n].location_country, cardInfos[n].location_state);
    $(idName).fadeIn(600);
    if (n === 10)
      n = 0;
  };

  var myInterval = $interval(loop, 4000);

  $scope.stopInterval = function() {
    $interval.cancel(myInterval);
  };

  $scope.getShuffleProject = function(pName, cCtg) {
    $interval.cancel(myInterval);
    if (!$scope.shuffleCag)
      $scope.shuffleCag = cCtg;
    if (pName === "All projects")
      $scope.shuffleStatus = "project";
    else
      $scope.shuffleStatus = pName;
    $('#mbcardList_0').fadeIn();
  };

  $scope.getShuffleCag = function(cName, cStatus) {
    $interval.cancel(myInterval);
    $scope.shuffleCag = cName;
    if (!$scope.shuffleStatus)
      $scope.shuffleStatus = cStatus + " project";
    $('#mbcardList_0').fadeIn();
  };

  $scope.$on("$destroy", function(){
    $interval.cancel(myInterval);
  });

  $scope.encodeUrl = function(url) {
    url = Beauty_encode.encodeUrl(url);
    return url;
  };

  $scope.stopInterval = function() {
    $interval.cancel(myInterval);
  };

  $scope.goforstarter = function() {
    document.getElementById('main-discover').className = "animated fadeOutLeftBig";
    document.getElementById('main-start-project').className = "animated fadeInRightBig";
    $scope.isstartclicked = true;
  };

  if ($stateParams.tagStart) {
    $scope.goforstarter();
  }

  $scope.backtocta = function () {
    document.getElementById('main-discover').className = "animated fadeInLeftBig";
    document.getElementById('main-start-project').className = "animated fadeOutRightBig";
    $timeout(function(){$scope.isstartclicked = false}, 100);
    //$scope.isstartclicked = false;
  };

  $scope.getProject = function(pName) {
    if (ww <= 736)
        $scope.closemmodal();
    $scope.statusProject = pName;
  };

  $scope.getCategory = function(cName) {
    if (ww <= 736)
        $scope.closemmodal();
    $scope.ctgName = cName;
  };

  $scope.savedata = function ($event) {
    if (!$rootScope.globals.currentUser) {
      
    }
    else {
      var data          = {};
      var errorMessage  = "";


      if ($scope.selectedlocation) {
        var location              = $scope.selectedlocation.split(",");
        var location_city         = location[0];
        var location_country      = location[1].trim();
        data.location_city        = location_city;
        data.location_country     = location_country;
      }


      data.status                 = $scope.statusProject;
      data.category_id            = $scope.ctgName.id;
      data.title                  = $scope.selectedname;
      data.public_id              = Public_id.createPublicId();
      data.creator_user_name      = $rootScope.globals.currentUser.first_name + ' ' + $rootScope.globals.currentUser.last_name;
      data.project_visibility     = 1;
      if ($rootScope.globals.currentUser.profile_picture) {
        data.creator_user_picture = $rootScope.globals.currentUser.profile_picture;
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

  $scope.goToProfile = function(id) {
    Users.getUserIdByProfileId(id).then(function(data) {
      $location.path('/' + data.userId.username);
    });
  };

  $scope.goToDiscover = function(category) {
    $state.go('discover', {tagParams: category});
  };

  $scope.followUserFromCard = function(id, index, $event) {
    if (!$rootScope.globals.currentUser) {
      showbottomAlert.pop_it();
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

  // $scope.showGridBottomSheet = function($event) {
  //   $scope.alert = '';
  //   $mdBottomSheet.show({
  //     templateUrl: 'views/core/popover-login.view.client.html',
  //     controller: 'MainCtrl',
  //     clickOutsideToClose: true,
  //     targetEvent: $event
  //   });
  // };

  // $scope.closeBottomSheet = function () {
  //   $mdBottomSheet.cancel();
  //   $timeout(function () {
  //     $(document).ready(function() {
  //       var filter = $("#page-wrap");
  //       var x = $(window).height();
  //       var marge = (x - 551)/2/2;
  //       var container = $("#main-signup-modal");
  //       filter.fadeIn(300);
  //       container.css({'top': marge.toString() + "px"});
  //       container.fadeIn();
  //     });
  //   }, 400);
  // };

  // $scope.selectedValues = {};

  /*** DOM ***/
  $('.main-body3-body').mouseup(function(e) {
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


})
.directive('slickSliderHome', function () {
    return {
        restrict: 'A',         
        scope: {
          'data': '='
        },
        replace: true,
        link: function (scope, element, attrs) {
            var isInitialized = false;

            scope.$watch('data', function(newVal, oldVal) {
                if (newVal && newVal.length > 0 && !isInitialized) {
                    $(element).slick(scope.$eval(attrs.slickSliderHome));

                    isInitialized = true;
                }
            });
        }
    }
})
.directive('googlePlace', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, model) {
      var options = {
        types: ['(cities)'],
      };

      scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

      google.maps.event.addListener(scope.gPlace, 'place_changed',
      function() {
          scope.$apply(function() {
              model.$setViewValue(element.val());
              scope.getLocation = model.$viewValue;
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
    }
  }
});
