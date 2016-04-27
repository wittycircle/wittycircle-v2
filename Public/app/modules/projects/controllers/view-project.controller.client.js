(function () {

    'use strict';


    angular
    .module('wittyProjectModule')
    .controller('viewProjectCtrl', viewProjectCtrl);

    viewProjectCtrl.$inject = ['project_InvolvmentResolve', 'project_NeedsResolve', 'project_FeedbacksResolve', 'project_creatorUserResolve', 'project_categoryResolve', 'project_followersResolve', 'projectResolve', '$scope', '$rootScope', 'Beauty_encode', 'showbottomAlert', '$sce', 'Projects', '$http', 'emptyBg', 'Users', '$state', '$timeout', 'Project_Follow', 'Project_History', '$location', 'Feedbacks', '$stateParams'];
    function viewProjectCtrl (project_InvolvmentResolve, project_NeedsResolve, project_FeedbacksResolve, project_creatorUserResolve, project_categoryResolve, project_followersResolve, projectResolve, $scope, $rootScope, Beauty_encode, showbottomAlert, $sce, Projects, $http, emptyBg, Users, $state, $timeout, Project_Follow, Project_History, $location, Feedbacks, $stateParams) {

        var vm = this;

        // var
        // list all var needed to be initialized at the start of controller
        var currentUser = $rootScope.globals.currentUser;
        vm.no_follow = true;
        vm.loggedUser = $rootScope.globals.currentUser;
        vm.isCollapse = false;
        vm.totalNumber = 0;
        vm.editable = false;
        vm.currentUrl = 'https://www.wittycircle.com' + $location.path();
        // asks vars
        vm.showAskForm = false;
        vm.newAsk = {};


        // function
        // link function to vm(this constructor in fact)
        // about functions
        vm.encodeUrl = encodeUrl;
        vm.showbottomAl = showbottomAl;
        vm.goToMessage = goToMessage;
        vm.goToProfile = goToProfile;
        vm.followProject = followProject;
        // feedbacks functions
        vm.deployReplies = deployReplies;
        vm.isOwnedReply = isOwnedReply;
        vm.deleteReply = deleteReply;
        vm.pushReply = pushReply;
        // asks functions
        vm.showorhideAskForm = showorhideAskForm;
        vm.initAsks = initAsks;
        vm.addAsk = addAsk;
        vm.deployAskReplies = deployAskReplies;
        vm.pushAskReply = pushAskReply;
        vm.deleteAskReply = deleteAskReply;

        // $scope value
        $scope.showdelete = false;
        $scope.editable = false;

        init();
        isEditable();
        initFeedbacks();
        initAsks();
        initNeeds();

        // function
        // used to adjust background position of the image cover
        function adjustSize (str) {
            var res;
            var nbr;
            var a;

            res = str.split(' ');
            a = res[1].indexOf('%');
            if (a === -1) {
                nbr = parseInt(res[1], 10);
                if (nbr < 0) {
                    var p = (nbr / 1080) * 100;
                    p = Math.abs(p);
                    nbr = p + 9;
                } else {
                    nbr = nbr;
                }
                res[1] = nbr.toString();
                res[1] += '%';
                res = res.join(' ');
            } else {
                return str;
            }
            return res;
        }

        // function
        // used to parse url for remove trailing white-space and replace it whit a dash
        function encodeUrl (url) {
            url = Beauty_encode.encodeUrl(url);
            return url;
        }

        // function
        // used it to pop the md bottom sheet taken from angular-material.
        function showbottomAl (event) {
            showbottomAlert.pop_it(event);
        };

        // function
        // used to init the app and pass all the resolve ot it
        function init () {
            var err;

            vm.project = projectResolve.data[0];
            /*** Project Card Page ***/
            $scope.$parent.seo = {
                pageTitle: vm.project.title,
                pageDescription: vm.project.description
            };

            $scope.$parent.card = {
                title: vm.project.title,
                url: $location.absUrl(),
                image: vm.project.picture,
            };
            // setting default cover picture is there is not
            if (!vm.project.picture) {
                vm.project.picture = emptyBg;
            }
            // calling custom function to adjust the cover picture for responsive issues
            if (vm.project.picture_position) {
                vm.project.picture_position = adjustSize(vm.project.picture_position);
            }
            // need to tell angular it's a safe html
            $sce.trustAsHtml(vm.project.post);
            Projects.incrementViewProject(vm.project.id, function (response) {
                if (response.serverStatus ==! 2) {
                    err = response;
                    console.log(err);
                }
            });
            // resolve the project_followers
            vm.project_followers = project_followersResolve.data;
            if (vm.project.main_video) {
                vm.config = {
                    preload: 'auto',
                    sources: [
                        {src: $sce.trustAsResourceUrl(vm.project.main_video), type: 'video/mp4'}
                    ],
                    theme: {
                        url: '../../../styles/css/videogular.css'
                    },
                    plugins: {
                        controls: {
                            autoHide: true,
                            autoHideTime: 2000
                        }
                    }
                };
                if (vm.project.video_poster) {
                    vm.config.plugins.poster = vm.project.video_poster;
                }
            }
            // disable following if the currentUser is the creator
            if (currentUser && currentUser.id === vm.project.creator_user_id) {
                vm.no_follow = false;
            } else {
                vm.no_follow = true;
                if (vm.loggedUser) {
                    Project_Follow.checkFollowProject(vm.project.id, function (response) {
                        if (!response.follow)
                        vm.followText = 'Following';
                        else
                        vm.followText = 'Follow';
                    });
                    // check if project id and project id is an integrer with parse int
                    if (vm.project.id && vm.project.id === parseInt(vm.project.id, 10)) {
                        Project_History.addProjectHistoryToCurrentUser(vm.project.id, function (result) {
                            // TODO: what we must do when we have anything to do with empty response ?
                        });
                    }
                }
            }
            vm.category = project_categoryResolve.data[0];
            vm.project.user = project_creatorUserResolve.data.profile;
            if (project_InvolvmentResolve.data.show === true) {
                if (project_InvolvmentResolve.data.involver) {
                    $scope.involver = project_InvolvmentResolve.data.involver[0];
                    $scope.project = vm.project;
                    $timeout(function () {
                        showbottomAlert.pop_it_involvment($scope);
                    }, 1000);
                }
            }
            if (project_InvolvmentResolve.data.editable === true) {
                vm.editable = true;
            }
            if (project_InvolvmentResolve.data.userIn) {
                vm.involved_users = project_InvolvmentResolve.data.userIn;
            }
        }

        function isEditable() {
            if (currentUser && vm.project && vm.project.creator_user_id === currentUser.id) {
                vm.editable = true;
                $scope.ediatble = true;
            }
        }


        function goToMessage (id) {
            if (id && id !== null && id !== undefined && typeof id === 'number') {
                if (!currentUser) {
                    showbottomAlert.pop_it();
                    return;
                }
                if (id !== currentUser.id) {
                    Users.getUserbyId(id, function (res) {
                        $state.go('messages', {profile: res.profile, user_id: id, username: res.data.username});
                    });
                }
            } else {
                console.error('error in goToMessage in ViewProjectCtrl: no id is provided');
                console.error(id);
                return;
            }
        };

        function goToProfile (id) {
            if (id && id !== null && id !== undefined && typeof id === 'number') {
                Users.getUserbyId(id, function (response) {
                    console.log(response);
                    $state.go('profile', {username: response.data.username});
                });
            } else {
                console.log('error in goToProfile in ViewProjectCtrl: no id is provided');
                console.log(id);
                return;
            }
        };


        function followProject () {
            if (vm.project.public_id) {
                if (currentUser && (currentUser.id !== vm.project.creator_user_id)) {
                    Project_Follow.followProject(vm.project.public_id, function (response) {
                        if (response.success) {
                            if (response.msg === 'Project followed')
                            vm.followText = 'Following';
                            else
                            vm.followText = 'Follow';
                        }
                    });
                }
            }
        };


        ///////////////////////////////////////
        ////////////// FEEDBACKS //////////////
        ///////////////////////////////////////

        // function
        // init Feedbacks
        function initFeedbacks () {
            vm.questions = project_FeedbacksResolve.data;
            vm.totalNumber = vm.totalNumber + vm.questions.length;
        }

        function deployReplies (question) {
            if (question.isCollapse == false || !question.isCollapse) {
                question.isCollapse = true;
                vm.isCollapse = true;
            } else {
                question.isCollapse = false;
                vm.isCollapse = false;
            }
        }

        function isOwnedReply (reply, creator_user_id) {
            if (reply.user_id === creator_user_id) {
                reply.owned = true;
            } else {
                reply.owned = false;
            }
        }

        function deleteReply (reply, question_index) {
            Feedbacks.deleteFeedbackReply(reply.id, function (response) {
                if (response.serverStatus === 2) {
                    var index = vm.questions[question_index].replies.indexOf(reply);
                    vm.questions[question_index].replies.splice(index, 1);
                } else {
                    console.log('error');
                }
            });
        }

        function pushReply (message, feedback_id, question) {
            var data = {};

            data.feedback_id = feedback_id;
            data.description = message;
            data.creator_picture = currentUser.profile_picture_icon;
            data.creator_first_name = currentUser.first_name;
            data.creator_last_name = currentUser.last_name;
            Feedbacks.addFeedbackReply(data, function (response) {
                if (response.serverStatus === 2) {
                    var reply = {};
                    reply.id = response.insertId;
                    reply.feedback_id = feedback_id;
                    reply.description = message;
                    reply.created_at = new Date();
                    reply.isOwned = true;
                    reply.user_profile = {};
                    reply.user_profile.profile_picture_icon = currentUser.profile_picture_icon;
                    reply.user_profile.first_name = currentUser.first_name;
                    reply.user_profile.last_name = currentUser.last_name;
                    if (question.replies) {
                        question.replies.push(reply);
                    } else {
                        question.replies = [];
                        question.replies.push(reply);
                    }
                } else {
                    console.error('cant push reply', data);
                }
            });
        };

        ///////////////////////////////////////
        //////////////// ASKS /////////////////
        ///////////////////////////////////////

        function showorhideAskForm (event) {
            if (!currentUser) {
                showbottomAlert.pop_it(event);
            } else {
                if (vm.showAskForm == true) {
                    vm.showAskForm = false;
                    return;
                }
                if (vm.showAskForm == false) {
                    vm.showAskForm = true;
                }
            }
        }

        function initAsks () {
            $http.get('/ask/public_id/' + $stateParams.public_id).success(function (response) {
                vm.asks = response;
                vm.totalNumber += vm.asks.length;
            });
        };

        function addAsk (newAsk) {
            newAsk.project_id = vm.project.id;
            newAsk.creator_img = currentUser.profile_picture_icon;
            newAsk.first_name = currentUser.first_name;
            newAsk.last_name = currentUser.last_name;
            newAsk.project_public_id = vm.project.public_id;
            $http.post('/asks', newAsk).success(function (response) {
                // ok now gonna need to push it etc ...
                $timeout(function () {
                    newAsk.created_at = new Date();
                    vm.asks.push(newAsk);
                    vm.newAsk = {};
                    vm.totalNumber = vm.totalNumber + 1;
                }, 500);
                if (vm.showAskForm == true) {
                    vm.showAskForm = false;
                    return;
                }
                if (vm.showAskForm == false) {
                    vm.showAskForm = true;
                    return;
                }
            })
        };

        function deployAskReplies (ask) {
            if (ask.isCollapse == false || !ask.isCollapse) {
                ask.isCollapse = true;
                vm.isCollapse = true;
            } else {
                ask.isCollapse = false;
                vm.isCollapse = false;
            }
        };

        function pushAskReply (message, ask_id, ask) {
            var data = {};

            data.ask_id = ask_id;
            data.description = message;
            data.creator_picture = currentUser.profile_picture_icon;
            data.creator_first_name = currentUser.first_name;
            data.creator_last_name = currentUser.last_name;
            $http.post('/ask_reply/add', data).success(function (response) {
                if (currentUser.id == ask.user_id) {
                    ask.owned = true;
                }
                data.created_at = new Date();
                ask.replies.push(data);
                vm.reply = [];
            });
        };

        function deleteAskReply (ask_reply, question_index) {
            $http.delete('/ask_reply/delete/' + ask_reply.id).success(function (response) {
                if (response.serverStatus == 2) {
                    var index = vm.asks[question_index].replies.indexOf(ask_reply);
                    vm.asks[question_index].replies.splice(index, 1);
                }
            });
        };

        ///////////////////////////////////////
        /////////////// NEEDS /////////////////
        ///////////////////////////////////////

        function initNeeds() {
            if (project_NeedsResolve.status === 200) {
                vm.openings = project_NeedsResolve.data;
            }
        }

    }

})();
