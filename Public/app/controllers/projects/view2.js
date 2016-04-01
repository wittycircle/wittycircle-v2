(function () {
  'use strict';

  angular
    .module('wittyApp')
    .controller('ViewProjectCtrl', ViewProjectCtrl);

  ViewProjectCtrl.$inject = ['$scope'];

  function ViewProjectCtrl($scope) {
    /*jshint validate this*/
    var vm = this;

    //var
    vm.no_follow = true;
    var currentUser = $rootScope.globals.currentUser;
    vm.loggedUser = $rootScope.globals.currentUser;
    vm.isCollapse = false;
    vm.totalNumber = 0;
    vm.involved_users = [];
    vm.currentUrl = "http://www.wittycircle.com" + $location.path();
    //function
    vm.encodeUrl = encodeUrl;


    /* ENCODEURL function */
    // calling factories for removing the whitespace and replacing it by '-'
    function encodeUrl(url) {
      url = Beauty_encode.encodeUrl(url);
      return (url);
    }

    /* SHOWBOTTOMAL */
    // showing the bottom alert -> calling $mdbottomsheet of angularMaterial
    function showbottomAl(event) {
      showbottomAlert.pop_it(event);
    };

    /* ADJUSTSIZE */
    // private function to adjust cover picture size
    // transforming the px of background position to percent
    function adjustSize(str, wid) {
      var res;
      var nbr;
      var a;

      res = str.split(" ");
      a = res[1].indexOf("%");
      if (a == -1) {
        nbr = parseInt(res[1]);
        if (nbr < 0) {
          var p = (nbr / 1080) * 100;
          p = Math.abs(p);
          nbr = p + 9;
        } else {
          nbr = nbr;
        }
        res[1] = nbr.toString();
        res[1] += "%";
        res = res.join(" ");
      } else {
        return str;
      }
      return res;
    }

    function initProject() {
      vm.project = Projects.getProjectbyPublicId($stateParams.public_id, function(response) {
        if (!response[0]) {
          $location.path('/');
        } else {
          vm.project = response[0];
          vm.project.post = $sce.trustAsHtml(response[0].post);
          Projects.incrementViewProject(vm.project.id, function (response) {
             //console.log(response);
          });
          Project_Follow.getProjectFollowers(vm.project.id, function(response) {
            vm.project_followers = response;
          });
          if (!vm.project.picture) {
            vm.project.picture = "http://res.cloudinary.com/dqpkpmrgk/image/upload/v1456744591/no-bg_k0b9ob.jpg";
          }
          if (vm.project.picture_position) {
            vm.project.picture_position = adjustSize(vm.project.picture_position, vm.project.picture_position_width);
          }
          if (vm.project.main_video) {
            vm.config = {
                          preload: "auto",
                          sources: [
                              {src: $sce.trustAsResourceUrl(vm.project.main_video), type: "video/mp4"}
                          ],
                          theme: {
                              url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                          },
                          plugins: {
                              controls: {
                                  autoHide: true,
                                  autoHideTime: 2000
                              }
                          }
                      };
          }
          if (currentUser && currentUser.id == vm.project.creator_user_id) {
            vm.no_follow = false;
          } else {
            vm.no_follow = true;
            if (vm.loggedUser) {
              Project_Follow.checkFollowProject(vm.project.id, function(response) {
                if (!response.follow)
                  vm.followText = "Following";
                else
                  vm.followText = "Follow";
              });
              let history = {};
              history.project_id = vm.project.id;
              $http.post('/history/project/'+ currentUser.id, history).then(function (response) {
                //console.log(response);
              });
            }
          }
          vm.category = Categories.getCategory(vm.project.category_id, function(response) {
            vm.category = response[0];
          });
          vm.project.user = Users.getUserbyId(vm.project.creator_user_id, function(response) {
            vm.project.user = response.profile;
          });
          $http.get('/project/' + vm.project.id + '/involved').success(function (response) {
            Object.keys(response).forEach(function (key) {
              if (currentUser) {
                if (response[key].user_id == currentUser.id) {
                    vm.editable = true;
                }
              }
              Users.getProfileByUserId(response[key].user_id, function(response) {
                if(response.success == true) {
                  Users.getProfilesByProfileId(response.content.profile_id, function(res) {
                    vm.involved_users.push(res.content);
                  });
                }
              });
            });
          });
          if (currentUser != undefined) {
            if (vm.project.creator_user_id == currentUser.id) {
              vm.editable = true;
            }
          }
          // GETTINGS THE NEEDS
          $http.get('/openings/project/' + response[0].id).then(function(res) {
            if (res.data.length == 0) {
              vm.openingsNumber = 0;
            } else {
              vm.openings = res.data;
              vm.openingsNumber = res.data.length;
              Object.keys(vm.openings).forEach(function(key) {
                if (vm.openings[key].taggs != false) {
                  vm.openings[key].taggs = JSON.parse(vm.openings[key].taggs);
                }
              });
            }
          });
        }
      });
      vm.initFeedbacks();
      vm.initAsks();
    };


  }


})
