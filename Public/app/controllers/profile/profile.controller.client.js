'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the wittyApp
 **/
angular.module('wittyApp').controller('ProfileCtrl', function (Beauty_encode ,$modal, $state, $cookieStore, Authentication, Upload, $http, $location, $scope, Profile, $rootScope, $stateParams, Experiences, Users, showbottomAlert, Skills, Interests, Locations, Projects) {

    var socket = io.connect('http://127.0.0.1:80');
    
    if (!$rootScope.globals.currentUser || ($rootScope.globals.currentUser && $rootScope.globals.currentUser.username !== $stateParams.username))
      Users.getProfileView($stateParams.username);

    if ($rootScope.globals.currentUser) {
      Profile.getUserbyUsername($stateParams.username).then(function(res) {
        if($rootScope.globals.currentUser.username != $stateParams.username && res) {
          socket.emit('view-notification', {
            viewer: $rootScope.globals.currentUser.username,
            viewed: $stateParams.username,
          });
        }
      });
    }

    if ($rootScope.globals.currentUser) {
      if ($stateParams.username === $rootScope.globals.currentUser.username) {
        $scope.cannotFollow   = true;
        $scope.canUpload      = true;
        $scope.canUploadCover = true;
      }
    }

    $scope.encodeUrl = function(url) {
      return Beauty_encode.encodeUrl(url);
    }

    $scope.followUser = function() {
      if (!$rootScope.globals.currentUser)
        showbottomAlert.pop_it();
      else {
        if ($stateParams.username !== $rootScope.globals.currentUser.username) {
          Profile.followUser($stateParams.username, function(res) {
            if (res.success) {
              if (res.msg === "User unfollowed") {
                $scope.followText = "Follow";
              } else {
                $scope.followText = "Following";
              }
            }
          });
        }
      }
    };

    $scope.reloadCredential = function() {
      $http.get('/profile').success(function(res){
        Authentication.SetCredentialsSocial(res.user, res.user_info);
      });
    };

    $scope.init = function () {
      Profile.getUserbyUsername($stateParams.username).then(function(res) {
        if (res) {
          Projects.getUserProject(res.id, function(res) {
            $scope.inProjects = res;
          });
        }
      });

      if ($rootScope.globals.currentUser) {
        if ($rootScope.globals.currentUser.username !== $stateParams.username) {
          $http.get('/follow/user/' + $stateParams.username).success(function(res) {
            if (res.success) {
              $scope.follow         = true;
              $scope.followText     = "Following";
            }
            else {
              $scope.follow         = false;
              $scope.followText     = "Follow";
            }
          });
        }
      } else
          $scope.follow             = true;
        $scope.followText             = "Follow";
        var arrayDays                 = [];
        var arrayYears                = [];
        function getSchedule() {
          for (var i = 0; i < 117; i++)
            arrayYears.push(2016 - i);
          for (var n = 1; n < 32; n++)
            arrayDays.push(n);
          $scope.days                 = arrayDays;
          $scope.years                = arrayYears;
          $scope.months               = [{Pap: "January", Num: "01"}, {Pap: "February", Num: "02"}, {Pap: "March", Num: "03"}, {Pap: "April", Num: "04"}, {Pap: "May", Num: "05"}, {Pap: "June", Num: "06"}, {Pap: "July", Num: "07"}, {Pap: "August", Num: "08"}, {Pap: "September", Num: "09"}, {Pap: "October", Num: "10"}, {Pap: "November", Num: "11"}, {Pap: "December", Num: "12"}];
        };
      getSchedule();

      $http.get('/skills').success(function(res) {
        $scope.cSkills              = res.skills;
      });

      $http.get('/interests').success(function(res) {
        $scope.cInterests           = res.interests;
      });

      $http.get('/follow/projects/' + $stateParams.username).success(function(res) {
        $scope.projectsFollow       = res.data.length;
      });

      $http.get('/follow/users/' + $stateParams.username).success(function(res) {
        $scope.usersFollow          = res.data.length;
      });

      $http.get('/follow/followUsers/' + $stateParams.username).success(function(res) {
        $scope.followers            = res.data.length;
      });

      Profile.getUserbyUsername($stateParams.username).then(function(res) {
        if (res) {
          Experiences.getExperiences(res.id).then(function(res) {
            $scope.experiences      = res;
          });
          Skills.getUserSkills(res.id).then(function(res) {
            $scope.user_skills      = res;
          });
          Interests.getUserInterests(res.id).then(function(res) {
            $scope.user_interests   = res;
          })
          $scope.user               = res;
          $scope.profile            = res.profile[0];
          if ($scope.profile.cover_picture) {
            $http.post('/picture/get/cover', {url: $scope.profile.cover_picture}).success(function(res) {
              if (res.success && res.data[0])
                $scope.randomCover  = true;
              else
                $scope.randomCover  = false;
                $('#profile-header').css('background-image', "url('" + $rootScope.resizePic($scope.profile.cover_picture, 1200, 410, 'fill') + "')");
            });
          }
        } else {
          console.log("error");
          $location.path('/');
        }
      });
    };
    $scope.init();

    /*** Go to Discover ***/
    $scope.goToDiscover = function(category) {
      $state.go('discover', {tagParams: category});
    };

    /*** Upload picture ***/
    $scope.uploadProfilePicture = function(file) {
      var data = {};
      if (file) {
        $scope.imageProfileLoading           = true;
        Upload.dataUrl(file, true).then(function(url){
          data.url = url;
          $http.post('/upload', data).success(function(res) {
            $http.post('/upload/profile_pic_icon', data).success(function(res1) {
              $http.put('/profile/picture', {profile_picture: res1.secure_url, profile_picture_icon: res1.secure_url}).success(function(res2) {
                if (res2.success) {
                  $scope.init();
                  $scope.reloadCredential();
                  $scope.imageProfileLoading = false;
                }
              });
            });
          }).error(function(res) {
            console.log(res);
          });
        });
      }
    };

    $scope.uploadProfileCover = function(file) {
      var data = {};
      if (file) {
        $scope.imageCoverLoading          = true;
        $scope.randomCover                = false;
        Upload.dataUrl(file, true).then(function(url){
          data.url = url;
          $http.post('/upload/profile/cover', data).success(function(res) {
            $http.put('/profile/picture', {cover_picture: res.secure_url}).success(function(response) {
              console.log(response);
              if (response.success) {
                $scope.init();
                $scope.imageCoverLoading  = false;
                $rootScope.globals.currentUser.profile_cover = res.secure_url;
                $cookieStore.put('globals', $rootScope.globals);
              }
            });
          }).error(function(res) {
            console.log(res);
          });

          $http.post('/upload/profile/cover_card', data).success(function(res) {
            $http.put('/profile/picture', {cover_picture_cards: res.secure_url}).success(function(res) {
            });
          }).error(function(res) {
            console.log(res);
          });

        });
      }
    };

    // $scope.$watch('imageLoading', function (value) {
    //   if(value === true) {
    //     console.log('file uploading');
    //   }
    // });

    /*** Message ***/
    $scope.goToMessage            = function(id) {
      if (!$rootScope.globals.currentUser)
        showbottomAlert.pop_it();
      else
        $state.go('messages', {profile_id : id});
    };

    /*** LOCATION ***/
    $scope.showEditL              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditLocation = true;
    };

    $scope.hideEditL              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditLocation = false;
    };

    $scope.editLocation           = function() {
      if ($scope.modifyLocation)
        $scope.modifyLocation     = false;
      else
        $scope.modifyLocation     = true;
    };

    $scope.saveProfileLocation    = function() {
      console.log($scope.profileLocation);
    };

    /*** ABOUT ***/
    $scope.getProfileInfo         = function() {
      Profile.getUserbyUsername($stateParams.username).then(function(response) {
        if (response)
          $scope.profile          = response.profile[0];
        else {
          console.log("error");
          $location.path('/');
        }
      });
    };

    $scope.showEditA              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditAbout    = true;
    };

    $scope.hideEditA              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditAbout    = false;
    };
    $scope.openEditA              = function () {
    $scope.modalInstance          = $modal.open({
       animation: true,
       templateUrl: 'views/profile/modal/profile.edit.about.view.client.html',
       controller: 'AboutModalCtrl',
       windowClass: 'large-Modal',
       scope: $scope
     });
    };

    /*** SKILLS ***/
    $scope.getProfileSkill        = function() {
      $http.get('/skills/' + $stateParams.username).success(function(res) {
        if (res.success)
          $scope.profileSkills    = res.data;
      });
    }; $scope.getProfileSkill();

    $scope.showEditS              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditSkill    = true;
    };

    $scope.hideEditS              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditSkill = false;
    };

    $scope.openEditS              = function () {
      $scope.modalInstance        = $modal.open({
        animation: true,
        templateUrl: 'views/profile/modal/profile.edit.skill.view.client.html',
        controller: 'SkillsModalCtrl',
        windowClass: 'large-Modal',
        scope: $scope
      });
    };

    /*** INTEREST ***/
    $scope.getProfileInterest     = function() {
      $http.get('/interest/' + $stateParams.username).success(function(res) {
        if (res.success)
          $scope.profileInterests = res.data;
      });
    }; $scope.getProfileInterest();

    $scope.showEditI              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditInterest = true;
    };

    $scope.hideEditI              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditInterest = false;
    };

    $scope.openEditI              = function () {
      $scope.modalInstance        = $modal.open({
        animation: true,
        templateUrl: 'views/profile/modal/profile.edit.interest.view.client.html',
        controller: 'InterestsModalCtrl',
        windowClass: 'large-Modal',
        scope: $scope
      });
    };

    /*** EXPERIENCE ***/
    $scope.startMonth           = "Month";
    $scope.startYear            = "Year";
    $scope.endMonth             = "Month";
    $scope.endYear              = "Year";
    $scope.startPeriod          = {};
    $scope.endPeriod            = {};

    $scope.getProfileExp          = function() {
      $http.get('/experiences/' + $stateParams.username).success(function(res) {
        if (res.success)
          $scope.profileExps      = res.data;
      });
    }; $scope.getProfileExp();

    $scope.showAddE               = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showAddExp       = true;
    };

    $scope.hideAddE               = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showAddExp       = false;
    };

    $scope.showEditE              = function(index) {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditExp      = index;
    };

    $scope.hideEditE              = function() {
      if ($rootScope.globals.currentUser)
        if ($stateParams.username === $rootScope.globals.currentUser.username)
          $scope.showEditExp      = -1;
    };

    $scope.openAddE               = function () {
    $scope.modalInstance          = $modal.open({
        animation    : true,
        templateUrl  : 'views/profile/modal/profile.add.experience.view.client.html',
        controller   : 'AddExperiencesModalCtrl',
        windowClass  : 'small-Modal',
        scope        : $scope
      });
    };

    $scope.openEditE              = function (index) {
    $scope.modalInstance          = $modal.open({
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

    $scope.removeExp              = function(id) {
      $http.delete('/experience/' + id).success(function(res) {
        if (res.success)
          $scope.getProfileExp();
      });
    };
})
.directive('profileLocationSearch', function($http, Locations) {
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
              scope.profileLocation = model.$viewValue;
          });
      });

      scope.$watch('profileLocation', function(value) {
        var object = {};

        Locations.setplaces(scope.profileLocation, object);
        if (object.location_country) {
          $http.put('/profile/location', object).success(function(res) {
            scope.init();
            scope.editLocation();
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
});
