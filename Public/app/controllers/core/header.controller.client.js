'use strict';

/**
* @ngdoc function
* @name wittyApp.controller:HeaderCtrl
* @description
* # HeaderCtrl
* Controller of the wittyApp
**/
angular.module('wittyApp')
.controller('HeaderCtrl', ['$http', '$interval', '$timeout', '$location', '$scope', 'Authentication', 'Profile', '$cookies', '$rootScope', '$state', 'Users', 'Projects', 'Beauty_encode', 'algolia', '$mdBottomSheet', 'RetrieveData',
function($http, $interval, $timeout, $location, $scope, Authentication, Profile, $cookies, $rootScope, $state, Users, Projects, Beauty_encode, algolia, $mdBottomSheet, RetrieveData) {

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

    var y           = $(window).width();

    if ($location.path() === "/discover" || $location.path() === "/meet") {
        $timeout(function() {document.getElementById('header-section').style.position = "fixed";}, 1000)
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($location.path() === "/discover" || $location.path() === "/meet")
            document.getElementById('header-section').style.position = "fixed";
        else {
            if (y >= 736) {
                document.getElementById('header-section').style.position = "absolute";
                document.getElementById('header-content').style.backgroundColor = "transparent";
                document.getElementById('header-content').style.borderBottom = "none";
                document.getElementById('hbp').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg";
                document.getElementById('hnl').className = "header-nav-list";
                document.getElementById('hsb').className = "header-searchBar";
                document.getElementById('notif-w-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/waves-icon-w_wslyzh.png";
                document.getElementById('notif-m-i').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/mailbox-icon-w_sji3lw.png";
                document.getElementById('c-img').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/arrow-down-icon-w_csniet.svg";
                document.getElementsByClassName('header-log-dropdown')[0].style.color = "white";
                document.getElementById('hnlog').className = "header-nav-log";
            } else {
                document.getElementById('header-section').style.position = "absolute";
                document.getElementById('header-content').style.backgroundColor = "transparent";
                document.getElementById('header-content').style.borderBottom = "none";
                document.getElementById('hbp').src = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1457892593/witty-logo-icon-w_qtyz0j.svg";
                document.getElementById('srpimg').src = "/images/littleman-w.svg";
                document.getElementById('hsmobileimg').src = "/images/search-icon-w.svg";
                document.getElementById('hnmid').className = "header-nav-list";
            }
        }
    });

    /*
    **Update in time sidebar after login
    */
    //TODO: change to the server url
    var socket = io.connect('http://127.0.0.1');

    function islogged() {
        if ($rootScope.globals.currentUser) {
            return true;
        } else
        return false;
    }

    $timeout(function() {
        if ($rootScope.globals.currentUser) {
            $scope.moderator = $rootScope.globals.currentUser.moderator;
        }
    }, 2000);   

    $scope.updateUrlLogin = function () {
        $state.transitionTo('main', {login: 'true'}, { notify: false, inherit: true });
    }

    $scope.updateUrlSignup = function () {
        $state.transitionTo('main', {signup: 'true'}, { notify: false, inherit: true });
    }

    $rootScope.$watch('globals', function(value) {
        $scope.log = islogged();
           if ($scope.log && y >= 736) {
                $("#hlon").css('display', 'block');
           }
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
        $scope.searchNameHeader = [];
    });

    // if (y < 736) {
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
            window.location.href = "http://127.0.0.1/messages";
        };
    // }

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
    $scope.logout = function() {
        $http.get('/api/logout')
        .success(function(response) {
            if (response.success) {
                Authentication.ClearCredentials(function(res) {
                    if (res)
                    window.location.replace('http://127.0.0.1');
                });
            }
        }).error(function (response) {
            console.log('error: cannot logout the user');
        });
    };

    $scope.encodeUrl = function(url) {
        return Beauty_encode.encodeUrl(url);
    };

    /* follow notification */
    socket.on('follow-notification', function(data) {
        getNotifList(true);
    });

    /* view notification */
    socket.on('view-notification', function(data) {
        getNotifList(true);
    });

    /* project follow notification */
    socket.on('follow-project-notification', function(data) {
        getNotifList(true);
    });

    /* project involve notification */
    socket.on('involve-notification', function(data) {
        getNotifList(true);
    }); 

    /* ask project notification */
    socket.on('discussion-notification', function(data) {
        getNotifList(true);
    });

    socket.on('my-follow-users', function(data) {
        if ($rootScope.globals.currentUser) {
            if (data !== $rootScope.globals.currentUser.id) {
                $http.get("/user_followed/" + data).success(function(res) {
                    if (res.success) {
                        getNotifList();
                    }
                });
            }
        }
    });

    /*** Search Bar ***/
    /* API Key */
    var client  = algolia.Client("JD72FA5WG6", "924bac052bc10e15f834ee7324b0d7e6");

    var People  = client.initIndex('Users');
    var Project = client.initIndex('Projects');
    var PAndP   = client.initIndex('PAndP');

    $scope.$watch('searchNameHeader', function(value) {
        if (value) {
            $scope.searchProjects();
            $scope.searchUsers();
        }
    });

    $scope.$watch('searchNameM', function(value) {
        if (value !== undefined) {
            $scope.searchUsersAndProjects(value)
        }
    })

    $scope.searchProjects = function() {
        if ($scope.searchNameHeader) {
            Project.search($scope.searchNameHeader)
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
        if ($scope.searchNameHeader) {
            People.search($scope.searchNameHeader)
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

    $scope.goToStart = function() {
        $timeout(function () {
            $('.main-discover-slick').slick("unslick");
            $('.main-discover-slick').find('.slick-list').remove();
            $state.go('main', {tagStart: true}, {reload: true, inherit: false, notify: true});
        });
    };

    $scope.bfGoToStart = function() {
        $(window).scrollTop(0);
        $timeout(function () {
            $('.main-discover-slick').slick("unslick");
            $('.main-discover-slick').find('.slick-list').remove();
            $state.go('main', {tagStart: true}, {reload: true, notify: true});
        });
    };

    $scope.limitM = 5;
    $scope.moreMobile = function() {
        $scope.limitM += 5;
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
    }; $timeout($scope.getMessageList, 2000);

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

    $rootScope.$on('message-send', function(event, data) {
        if (data)
            $scope.getMessageList();
    });

    /*** All notifications ***/
    function getNotifList(notif) {
        $scope.notifLists = [];
        if (notif)
            $scope.notifBubble = $scope.notifBubble++;
        if ($rootScope.globals.currentUser) {
            RetrieveData.getData('/notification', 'GET').then(function(res) {
                var array = res.data;
                var n = 0;
                for (var i = 0; i < res.data.length; i++) {
                    if (!array[i].n_read)
                        n++;
                }
                $timeout(function() {
                $scope.listNotifs = res.data;
                $scope.notifBubble = n;
                }, 0);
                if (!n)
                    $scope.checkRead = true;
                else
                    $scope.checkRead = false;
            });
        }
    }; getNotifList();
    
    $scope.hideNotifBubble = function() {
        $scope.hideNBubble = true;
    };

    function updateNotificationRead(id) {
        $http.put("/notification/update/single", id).success(function(res) {
            if (res.success) {
                getNotifList();
            }
        });
    };

    function getNotifProject(titleUrl, public_id, state) {
        $timeout(function() {
            if (!state)
                $location.path("project/" + public_id + "/" + titleUrl);
            else
                $location.path("project/" + public_id + "/" + titleUrl + state);
        }, 1500);
    };

    $scope.getAllRead = function() {
        if ($rootScope.globals.currentUser) {
            $http.put('/notification/update/all').success(function(res) {
                if (res.success) {
                    getNotifList();
                    $scope.checkRead = true;
                }
            });
        }
    };

    $scope.showUserProfile = function(user_notif_id, user_followed_id, type, project_id, n_id, check_read, index) {

        var id = {
            id: n_id
        }

        $scope.listNotifs[index].n_read = 1;
        if (type === "view") {
            Users.getUserbyId(user_notif_id, function(res) {
                $location.path(res.data.username);
            });
        }
        else if (type === "u_follow") {
            Users.getUserbyId(user_notif_id, function(res) {
                $location.path(res.data.username);
            });
        }
        else if (type === "p_follow") {
            Users.getUserbyId(user_notif_id, function(res) {
                $location.path(res.data.username);
            });
        }
        else if (type === "p_user_follow") {
            Projects.getProjectbyId(project_id, function(res) {
                var titleUrl = Beauty_encode.encodeUrl(res[0].title);
                getNotifProject(titleUrl, res[0].public_id, false);
            });
        }
        else if (type === "u_user_follow") {
            Users.getUserbyId(user_followed_id, function(res) {
                $location.path(res.data.username);
            });
        }
        else if (type === "p_involve") {
            Projects.getProjectbyId(project_id, function(res) {
                var titleUrl = Beauty_encode.encodeUrl(res[0].title);
                getNotifProject(titleUrl, res[0].public_id, false);
            });
        }
        else if (type === "p_discuss" || type === "p_discuss_reply") {
            Projects.getProjectbyId(project_id, function(res) {
                var titleUrl = Beauty_encode.encodeUrl(res[0].title);
                getNotifProject(titleUrl, res[0].public_id, "/feedback")
            });
        }
        if (!check_read)
            updateNotificationRead(id);
    };

    /*** All watch function ***/
    $scope.$watch('notifBubble', function(value, old) {
        if (!$scope.hideNBubble && value || old) {
            if (document.getElementById('header-section') && document.getElementById('notifBubble')) {
                if (value)
                    document.getElementById('notifBubble').style.display = "block";
                else
                    document.getElementById('notifBubble').style.display = "none";
            }
        }
    });

    $rootScope.$watch(function () {return Users.sendNumber();},
    function (value) {
        $scope.numberNotif = value;
        if (document.getElementById('header-section') && document.getElementById('notifMailbox')) {
            if ($scope.numberNotif)
                document.getElementById('notifMailbox').style.display = "block";
            else
                document.getElementById('notifMailbox').style.display = "none";
        }
    });
}])
.directive('homeMessageModal', function() {
    var x = $(window).width();

        if (x >= 736) {
            return {
                templateUrl: 'views/messaging/messaging.modals.view.client.html',
                restrict: "AE",
                scope: false,
                controller: 'MessageCtrl',
                link: function(scope, element, attr, redactorOptions) {
                    // var myelem = (angular.element(element.children()[0]));

                    // myelem.on('click', function(e) {
                    //     var target = e.target.id;

                    //     if (target === "mmo") {
                    //         document.getElementById('messages-modal-searchArea').style.display = "none";
                    //         document.getElementById('messages-modal-newMessageArea').style.display = "block";
                    //     }
                    // });

                }
            }
        }

        return {

    }
});
