'use strict';

angular.module('wittyProjectModule')
    .controller('viewProjectCtrl', ['project_creatorUserResolve', 'project_categoryResolve', 'project_followersResolve', 'projectResolve', '$scope', '$rootScope', 'Beauty_encode', 'showbottomAlert', '$sce', 'Projects', '$http',
    function(project_creatorUserResolve, project_categoryResolve, project_followersResolve, projectResolve, $scope, $rootScope, Beauty_encode, showbottomAlert, $sce, Projects, $http) {

        console.time('Timer View Project');

        /*jshint validate this*/
        var vm = this;
        var currentUser = $rootScope.globals.currentUser;

        vm.no_follow = true;
        vm.loggedUser = $rootScope.globals.currentUser;
        vm.isCollapse = false;
        vm.totalNumber = 0;

        init();

        // function
        // used to adjust background position of the image cover
        function adjustSize(str) {
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

        // function
        // used to parse url for remove trailing white-space and replace it whit a dash
        vm.encodeUrl = function(url) {
          url = Beauty_encode.encodeUrl(url);
          return url;
        }

        // function
        // used it to pop the md bottom sheet taken from angular-material.
        vm.showbottomAl = function(event) {
          showbottomAlert.pop_it(event);
        };


        function init() {
            var err;

            vm.project = projectResolve.data[0];
            // setting default cover picture is there is not
            if (!vm.project.picture) {
              vm.project.picture = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1456744591/no-bg_k0b9ob.jpg";
            }
            // calling custom function to adjust the cover picture for responsive issues
            if (vm.project.picture_position) {
              vm.project.picture_position = adjustSize(vm.project.picture_position);
            }
            // need to tell angular it's a safe html
            $sce.trustAsHtml(vm.project.post);
            Projects.incrementViewProject(vm.project.id, function (response) {
                if (response.serverStatus ==! 2)
                    err = response;
            });
            // resolve the project_followers
            vm.project_followers = project_followersResolve.data[0];
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
            // disable following if the currentUser is the creator
            if (currentUser && currentUser.id === vm.project.creator_user_id) {
              vm.no_follow = false;
            } else {
              vm.no_follow = true;
              /*if (vm.loggedUser) {
                Project_Follow.checkFollowProject(vm.project.id, function(response) {
                  if (!response.follow)
                    vm.followText = "Following";
                  else
                    vm.followText = "Follow";
                });
                var history = {};
                history.project_id = vm.project.id;
                //need to put this one into a service
                $http.post('http://127.0.0.1/history/project/'+ currentUser.id, history).then(function (response) {
                  //console.log(response);
                });
            }*/
            }
            vm.category = project_categoryResolve.data[0];
            vm.project.user = project_creatorUserResolve.data.profile;

            /*$http.get('http://127.0.0.1/project/' + $scope.project.id + '/involved').success(function (response) {
              Object.keys(response).forEach(function (key) {
                if (currentUser && currentUser.id == response[key].user_id && response[key].n_accept === 0) {
                  Users.getProfileByUserId(response[key].invited_by, function(result) {
                    if (result.success === true) {
                      Users.getProfilesByProfileId(result.content.profile_id, function(data) {
                        $scope.involver = data;
                        showbottomAlert.pop_it_involvment($scope);
                      })
                    }
                  });
                }
                if (currentUser) {
                  if (response[key].user_id == currentUser.id && response[key].n_accept === 1) {
                      $scope.editable = true;
                  }
                }
                if (response[key].n_accept === 1) {
                  Users.getProfileByUserId(response[key].user_id, function(resp) {
                    if(resp.success == true) {
                      Users.getProfilesByProfileId(resp.content.profile_id, function(res) {
                        //$scope.involved_users = setPictureIcon(res);
                        $scope.involved_users.push(res.content);
                      });
                    }
                  });
                }
              });
          });*/
        }

        console.timeEnd('Timer View Project');
}]);
