'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the wittyApp
 **/
angular.module('wittyApp')
.controller('HeaderCtrl', ['$http', '$interval', '$timeout', '$location', '$scope', 'Authentication', 'Profile', '$cookies', '$rootScope', '$state', 'Users', 'Notification', 'Projects', 'Beauty_encode', 'algolia', '$mdBottomSheet', 
  function($http, $interval, $timeout, $location, $scope, Authentication, Profile, $cookies, $rootScope, $state, Users, Notification, Projects, Beauty_encode, algolia, $mdBottomSheet) {

  /*** CHECK LOG ***/
  function checkCredential() {
    if ($rootScope.globals.currentUser) {
      $http.get('/api').success(function(res) {
        if (!res.success) {
          Authentication.ClearCredentials(function(res) {
            if (res)
              $location.path('/');
          });
        }
      });
    }
  }; checkCredential();

   /*
   **Update in time sidebar after login
   */
   //TODO: change to the server url
   var socket = io.connect('http://127.0.0.1');

   $rootScope.$watch('globals', function(value) {
    $scope.log = islogged();
 //    if ($scope.log) {
	// $("#hlon").css('display', 'block');
 //    }
    if (value.currentUser) {
      Profile.getUserbyUsername(value.currentUser.username).then(function(res) {
        $scope.user = {
          first_name      : res.profile[0].first_name,
          last_name       : res.profile[0].last_name,
          profile_picture : res.profile[0].profile_picture_icon,
          username        : res.username,
        };
        socket.emit('register', res.profile[0].first_name + ' ' + res.profile[0].last_name);
        $http.get('/user/checkLog').success(function(res) {
          if (res.value === 0)
            $state.go('signup', {tagCheckFirst: true});
        });
      });
    }
  });

  $scope.$on('$stateChangeStart', function(scope, next, current) {
    $('#headerCore').show();
    $('#bodyCore').show();
    $('#footerCore').show();
    $('#hsfmobile').hide();
  });

   $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams, options){
    $scope.searchName = [];
   });

    // var check = false;
    // var firstTime = 1;
    // $(window).scroll(function() {
    //     var x = $(window).scrollTop();
    //     var check;
    //     if (x > 210 && firstTime) {
    //       console.log(firstTime);
    //       console.log("OK");
    //       check = true;
    //       firstTime = 0;
    //     }
    //     if (!$rootScope.globals.currentUser && check) {
    //       check = false;
    //       firstTime = 0;
    //       showbottomAlert.pop_it();
    //     }
    // });

    $scope.popSwL = function() {
      var x       = $('#main-signup-modal');
      var filter  = $("#page-wrap");
      var marge = (x - 600)/2/2;

      if (x.css('display') === "none") {
        filter.fadeIn(500);
        x.css({'top': marge.toString() + "px"});
        $mdBottomSheet.cancel();
        x.fadeIn();
      }
    };

    $scope.onSwipeRight = function(ev) {

      var bodyJq          = $( 'body' ),
          classTog        = classie.toggle,
          thiss            = document.getElementById('header-section'),
          menuRight       = document.getElementById( 'cbp-spmenu-s2' ),
          showRightPush   = document.getElementById( 'showRightPush' ),
          body            = document.body;

        function disableOther( button ) {
            if( button !== 'showRightPush' ) {
                classTog( showRightPush, 'disabled' );
            }
        };
          classTog( thiss, 'active' );
          classTog( body, 'cbp-spmenu-push-toleft' );
          classTog( menuRight, 'cbp-spmenu-open' );
          if (bodyJq.hasClass("cbp-spmenu-push-toleft"))
              bodyJq.css('overflow-y', 'hidden');
          else
              bodyJq.css('overflow-y', 'auto');
          disableOther( 'showRightPush' );
    };

    $scope.showMessagePageMobile = function() {
      window.location.href = "http://localhost/messages";
    };

    // $rootScope.$watch('notifBubble', function(value, old) {
    //   console.log(value);
    //   if (value)
    //     document.getElementById('notifBubble').style.display = "block";
    //   else
    //     document.getElementById('notifBubble').style.display = "none";
    // });
   /*
   **Private function for checking login
   */
    function islogged() {
      if ($rootScope.globals.currentUser) {
         return true;
      } else
         return false;
    };

    $scope.logout = function() {
      $http.get('/api/logout')
      .success(function(response) {
        if (response.success) {
          Authentication.ClearCredentials(function(res) {
            if (res)
              window.location.replace('https://www.wittycircle.com');
          });
        }
      }).error(function (response) {
        console.log('error: cannot logout the user');
      });
    };

/*** Get mail list notification ***/
    var loadHeaderNotification = function() {
      if ($rootScope.globals.currentUser)
        Users.count();
    };

    $timeout(loadHeaderNotification, 1200);

    $scope.getMessageList = function() {
      if ($rootScope.globals.currentUser) {
        Users.getLastMessage().then(function(data) {
          $scope.currentUsername = $rootScope.globals.currentUser.username;
          $scope.dialogues = data.topic;
        });
      }
    }; $timeout($scope.getMessageList, 1000);

    $scope.showMessagePage = function(data) {
      if ($rootScope.globals.currentUser) {
        $http.put('/messages/', {id : data.id});
        $state.go('messages', {input: data});
      }
    };

    $scope.showMessageMobile = function(dialogue) {
      $rootScope.dialogueMM = dialogue;
    };

    // $scope.getMesssageListOnClick = function() {
    //   if (!$scope.listNotifs && !$scope.dialogues[0])
    //     $scope.getMessageList();
    // };

    socket.on('notification', function(data){
      loadHeaderNotification();
      $scope.getMessageList();
    });

/*** All notifications ***/
  $scope.getNotifList = function () {
    $scope.notifLists = [];
      if ($rootScope.globals.currentUser) {
        Notification.getNotificationList(function(res) {
          $scope.listNotifs = res.data;
          $scope.notifBubble = res.number;
          if (!res.number)
            $scope.checkRead = true;
          else
            $scope.checkRead = false;
        });
      }
  }; $timeout($scope.getNotifList, 700);

  $scope.getAllRead = function() {
    if ($rootScope.globals.currentUser) {
      $http.put('/notification/update/all').success(function(res) {
        if (res.success) {
          $scope.getNotifList();
          $scope.checkRead = true;
        }
      });
    }
  };

  $scope.showUserProfile = function(user_notif_id, user_followed_id, type, project_id, n_id, check_read) {

    var value = {
      notifId       : user_notif_id,
      type          : type,
      projectId     : project_id,
      userFollowId  : user_followed_id
    }
    var id = {
      id: n_id
    }

    if (type === "view") {
      Users.getUserbyId(user_notif_id, function(res) {
        if (res.success) {
          if (!check_read) {
            $http.put("/notification/update/view", value).success(function(res) {
              if (res.success)
                $scope.getNotifList();
            });
          }
          $location.path(res.data.username);
        }
      });
    }
    if (type === "u_follow") {
      Users.getUserbyId(user_notif_id, function(res) {
        if (!check_read) {
          $http.put('/notification/update/user-follow', value).success(function(res) {
            if (res.success)
              $scope.getNotifList();
          });
        }
        $location.path(res.data.username);
      });
    }
    if (type === "p_follow") {
      Users.getUserbyId(user_notif_id, function(res) {
        if (!check_read) {
          $http.put('/notification/update/project-follow', value).success(function(res) {
            if (res.success)
              $scope.getNotifList();
          });
        }
        $location.path(res.data.username);
      });
    }
    if (type === "p_user_follow") {
      Projects.getProjectbyId(project_id, function(res) {
        var titleUrl = Beauty_encode.encodeUrl(res[0].title);
        if (!check_read) {
          $http.put("/notification/update/project-follow-by", value).success(function(res) {
            if (res.success)
              $scope.getNotifList();
          });
        }
        $location.path("project/" + res[0].public_id + "/" + titleUrl);
      });
    }
    if (type === "u_user_follow") {
      Users.getUserbyId(user_followed_id, function(res) {
        if (!check_read) {
          $http.put('/notification/update/user-follow-by', value).success(function(res) {
            if (res.success)
              $scope.getNotifList();
          });
        }
        $location.path(res.data.username);
      });
    }
    if (type === "p_involve") {
      Projects.getProjectbyId(project_id, function(res) {
        var titleUrl = Beauty_encode.encodeUrl(res[0].title);
        if (!check_read) {
          $http.put('/notification/update/project-involve', id).success(function(res) {
             if (res.success)
               $scope.getNotifList();
          });
        }
        $location.path("project/" + res[0].public_id + "/" + titleUrl);
      });
    }
  };

  /* view notification */
  socket.on('view-notification', function(data) {
    $scope.getNotifList();
  });

  /* follow notification */
  socket.on('follow-notification', function(data) {
    $scope.getNotifList();
  });

  /* project follow notification */
  socket.on('follow-project-notification', function(data) {
    $scope.getNotifList();
  });

  /* project involve notification */
  socket.on('involve-notification', function(data) {
    $scope.getNotifList();
  });

  socket.on('my-follow-users', function(data) {
    if ($rootScope.globals.currentUser) {
      if (data !== $rootScope.globals.currentUser.id) {
        $http.get("/user_followed/" + data).success(function(res) {
          if (res.success) {
            $scope.getNotifList();
          }
        });
      }
    }

  });


/*** Search Bar ***/
  /* Dev API Key */
  var client  = algolia.Client("XQX5JQG4ZD", "8be065c7ce07e14525c377668a190cf8");
  /* Public API Key */
  // var client  = algolia.Client("YMYOX3976J", "994a1e2982d400f0ab7147549b830e4a");
  
  var People  = client.initIndex('Users');
  var Project = client.initIndex('Projects');
  var PAndP   = client.initIndex('PAndP');

  $scope.$watch('searchName', function(value) {
    if (value) {
      $scope.searchProjects();
      $scope.searchUsers();
    }
  });

  $scope.$watch('searchNameM', function(value) {
    if (value) {
      $scope.searchUsersAndProjects(value)
    }
  })

  $scope.searchProjects = function() {
    if ($scope.searchName) {
      Project.search($scope.searchName)
        .then(function searchSuccess(content) {
          if (!content.hits[0]) {
            $scope.notFoundProject = true;
          } else {
            $scope.notFoundProject = false;
            $scope.projectHits = content.hits;
          }
        }, function searchFailure(err) {
            console.log(err);
        });
    }
  };

  $scope.searchUsers = function() {
    if ($scope.searchName) {
      People.search($scope.searchName)
        .then(function searchSuccess(content) {
          if (!content.hits[0]) {
            $scope.notFoundUser = true;
          } else {
            $scope.notFoundUser = false;
            $scope.peopleHits = content.hits;
          }
        }, function searchFailure(err) {
          console.log(err);
        })
    }
  };

  $http.get('/projects/discover').success(function(res) {
    $scope.resultHits = res;
  });

  $scope.searchUsersAndProjects = function(value) {
      PAndP.search(value)
        .then(function searchSuccess(content) {
          if (!content.hits[0]) {
            $scope.notFoundProject = true;
          } else {
            $scope.notFoundProject = false;
            $scope.resultHits = content.hits;
          }
        }, function searchFailure(err) {
            console.log(err);
        });
  };

  $scope.goToProfile = function(id) {
    Users.getUserIdByProfileId(id).then(function(data) {
      if (data.userId)
        $location.path('/' + data.userId.username);
    });
  };

  $scope.closePopover = function() {
    $mdBottomSheet.hide();
  };

  $scope.goToStart = function() {
    $state.transitionTo('main', {tagStart: true}, {reload: true, inherit: false, notify: true});
  };

  $scope.bfGoToStart = function() {
    $(window).scrollTop(0);
    $state.go('main', {tagStart: true}, {reload: true, notify: true});
  };

  $scope.limitM = 5;
  $scope.moreMobile = function() {
    $scope.limitM += 5;
  };

/*** All watch function ***/
  $scope.$watch('notifBubble', function(value, old) {
    if (document.getElementById('header-section')) {
      if (value)
        document.getElementById('notifBubble').style.display = "block";
      else
        document.getElementById('notifBubble').style.display = "none";
    }
  });

  $rootScope.$watch(function () {return Users.sendNumber();},
    function (value) {
      $scope.numberNotif = value;
      if (document.getElementById('header-section')) {
        if ($scope.numberNotif)
          document.getElementById('notifMailbox').style.display = "block";
        else
          document.getElementById('notifMailbox').style.display = "none";
      }
    });
}]);
