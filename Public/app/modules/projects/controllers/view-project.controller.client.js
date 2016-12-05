(function () {

    'use strict';


    angular
    .module('wittyProjectModule')
    .controller('viewProjectCtrl', viewProjectCtrl)
    .directive('projectMessageModal', function() {
        var x = $(window).width();

        if (x >= 736) {
            return {
                restrict: "A",
                scope: false,
                templateUrl: 'modules/projects/views/view_mmodal.view.client.html',
                controller: 'MessageCtrl',
                link: function(scope, element, attr) {
                    $(document).ready(function() {
			$('body').unbind('click');
                        $('body').on('click', function(e) {
                            if ($('#project-modal-newMessageArea').css('display') === "block") {
                                var container = $("#project-modal-newMessageArea");

                                if(!container.is(e.target) && container.has(e.target).length === 0) {
                                    if ($('#project-m-text').val()) {
                                            var r = confirm("You haven't finished your message yet. Do you want to leave without finishing?");
                                            if (r == true) {
                                                $('#project-modal-newMessageArea').fadeOut(100);
                                                $('#project-m-text').val("");
                                            } else 
                                                return ;
                                    } else 
                                        $('#project-modal-newMessageArea').hide();
                                }
                            }
                        });
                    });

                }
            }
        }
    });

    viewProjectCtrl.$inject = ['project_InvolvmentResolve', 'project_NeedsResolve', 'project_creatorUserResolve', 'project_categoryResolve', 'project_followersResolve', 'projectResolve', '$scope', '$rootScope', 'Beauty_encode', 'showbottomAlert', '$sce', 'Projects', '$http', 'emptyBg', 'Users', '$state', '$timeout', 'Project_Follow', 'Project_History', '$location', 'Feedbacks', '$stateParams', 'RetrieveData'];
    function viewProjectCtrl (project_InvolvmentResolve, project_NeedsResolve, project_creatorUserResolve, project_categoryResolve, project_followersResolve, projectResolve, $scope, $rootScope, Beauty_encode, showbottomAlert, $sce, Projects, $http, emptyBg, Users, $state, $timeout, Project_Follow, Project_History, $location, Feedbacks, $stateParams, RetrieveData) {

        var vm = this;

        // var
        // list all var needed to be initialized at the start of controller
        var currentUser = $rootScope.globals.currentUser || false;
	    if (currentUser && currentUser.moderator)
	       $scope.moderator = currentUser.moderator;
        vm.no_follow = true;
        vm.loggedUser = $rootScope.globals.currentUser;
        vm.isCollapse = false;
        vm.totalNumber = 0;
        vm.editable = false;
        vm.currentUrl = 'https://www.wittycircle.com' + $location.path();
        // asks vars
        vm.showAskForm = false;
        vm.newAsk = {};
        vm.followNumber;
        vm.currentShortUrl;
        vm.askTitle;
        vm.askComment;
        vm.commentInAsk;


        // function
        // link function to vm(this constructor in fact)
        // about functions
        vm.encodeUrl        = encodeUrl;
        vm.showbottomAl     = showbottomAl;
        vm.goToMessage      = goToMessage;
        vm.goToProfile      = goToProfile;
        vm.voteProjectCard  = voteProjectCard;
        // vm.followProject = followProject;
        // DISCUSSION FUNCTION
        vm.initDiscussion       = initDiscussion;
        vm.publishQuestion      = publishQuestion;
        vm.deleteDiscussion     = deleteDiscussion;
        vm.publishReply         = publishReply;
        vm.deleteReply          = deleteReply;
        vm.updateDiscussion     = updateDiscussion;
        vm.updateReply          = updateReply;
        vm.initReplyValue       = initReplyValue;
        vm.initDiscussionValue  = initDiscussionValue;
        vm.getVoteDiscussion    = getVoteDiscussion;
        vm.getVoteReply         = getVoteReply;
        vm.displayEdit          = displayEdit;
        // vm.isOwnedReply = isOwnedReply;
        // vm.deleteReply = deleteReply;
        // vm.pushReply = pushReply;
        // asks functions
        // vm.showorhideAskForm = showorhideAskForm;
        // vm.initAsks = initAsks;
        // vm.addAsk = addAsk;
        // vm.deployAskReplies = deployAskReplies;
        // vm.pushAskReply = pushAskReply;
        // vm.deleteAskReply = deleteAskReply;

        // $scope value
        $scope.showdelete = false;
        $scope.editable = false;

        init();
        isEditable();
        initDiscussion();
        // initAsks();
        initNeeds();

        // function
        // used to adjust background position of the image cover
        function adjustSize (str) {
            var res;
            var nbr;
            var a;

            res = str.split(' ');
	    if (!res[1])
                res[1] = "100%";
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
        function init() {
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
            vm.project.post = $sce.trustAsHtml(vm.project.post);
            Projects.incrementViewProject(vm.project.id, function (response) {
                if (response.serverStatus ==! 2) {
                    err = response;
                    console.log(err);
                }
            });
            // resolve the project_followers
            vm.project_followers = project_followersResolve.data;
            vm.followNumber = vm.project_followers.length;
            if (vm.project.main_video) {
                // vm.config = {
                //     preload: 'auto',
                //     sources: [
                //         {src: $sce.trustAsResourceUrl(vm.project.main_video), type: 'video/mp4'}
                //     ],
                //     theme: {
                //         url: '../../../styles/css/videogular.css'
                //     },
                //     plugins: {
                //         controls: {
                //             autoHide: true,
                //             autoHideTime: 2000
                //         }
                //     }
                // };
                vm.config = {
                    sources: $sce.trustAsResourceUrl(vm.project.main_video),
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
            // $http.put('/contributor/project', {project_id: vm.project.id}).success(function(res) {
            //     $scope.projectContributor = res.data;
            // });

            // Get shorten Url
            $http.post('/url/shortener', {url: vm.currentUrl}).success(function(res) {
                if (res.success)
                    vm.currentShortUrl = res.url;
            });

            // disable following if the currentUser is the creator
            if (currentUser && currentUser.id === vm.project.creator_user_id) {
                vm.no_follow = false;
            } else {
                vm.no_follow = true;
                if (vm.loggedUser) {
                    Project_Follow.checkFollowProject(vm.project.id, function (response) {
                        if (response.follow)
                            vm.followCheck = true;
                        else
                            vm.followCheck = false;
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

        function voteProjectCard(public_id) {
            if (currentUser) {
                if (!vm.followCheck) {
                    vm.followNumber += 1;
                    vm.followCheck = true;
                }
                else {
                    vm.followNumber -= 1;
                    vm.followCheck = false;
                }
                Project_Follow.followProject(public_id, -1, function (response) {
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

        // function followProject () {
        //     if (vm.project.public_id) {
        //         if (currentUser && (currentUser.id !== vm.project.creator_user_id)) {
        //             Project_Follow.followProject(vm.project.public_id, -1, function (response) {
        //                 if (response.success) {
        //                     if (response.msg === 'Project followed')
        //                     vm.followText = 'Following';
        //                     else
        //                     vm.followText = 'Follow';
        //                 }
        //             });
        //         }
        //     }
        // };


        function goToMessage (id) {
            if (id && id !== null && id !== undefined && typeof id === 'number') {
                if (!currentUser) {
                    showbottomAlert.pop_it();
                    return;
                }
                if (id !== currentUser.id) {
                    $scope.sendMess = true;
                    Users.getUserbyId(id, function(res) {
                        if (res.success) {
                            $rootScope.$broadcast("message-params", {profile: vm.project.user, user_id: id, username: res.data.username});
                        }
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
                console.log(id);
                Users.getUserbyId(id, function (response) {
                    $state.go('profile', {username: response.data.username});
                });
            } else {
                console.log('error in goToProfile in ViewProjectCtrl: no id is provided');
                console.log(id);
                return;
            }
        };

        // ///////////////////////////////////////
        // ////////////// DISCUSSION //////////////
        // ///////////////////////////////////////

        function initDiscussion() {
            RetrieveData.ppdData('/discussion/', 'POST', null, vm.project.id, null).then(function(res) {
                if (res.success)
                    vm.discussions = res.data;
            });
        };

        function publishQuestion() {
            if (currentUser) {
                var object = {
                    user_id         : currentUser.id,
                    project_id      : vm.project.id,
                    title           : vm.askTitle,
                    message         : vm.askComment,
                    url             : 'https://www.wittycircle.com' + $location.path()
                };
                RetrieveData.ppdData('/discussion/add/discussion', 'POST', object, null, null).then(function(res) {
                    if (res.success) {
                        vm.askTitle = null;
                        vm.askComment = null;
                        object.id = res.insertId;
                        object.user_info = {
                            picture : currentUser.profile_picture_icon,
                            username : currentUser.username,
                            first_name : currentUser.first_name,
                            last_name : currentUser.last_name,
                        };
                        object.numLike = 0;
                        vm.discussions.push(object);
                        $('#pfa').slideUp(200);
                    } else
                        vm.error = true;
                });
            } else
                console.log("ERROR");
        };

        function updateDiscussion(discuss_id, user_id, index) {
            if (currentUser.id === user_id) {
                var object = {
                    discuss_id  : discuss_id,
                    title       : vm.updateAskTitle,
                    message     : vm.updateAskComment,
                    url         : 'https://www.wittycircle.com' + $location.path()
                };
                RetrieveData.ppdData('/discussion/put/discussion', 'PUT', object, null, null).then(function(res) {
                    if (res.success) {
                        vm.discussions[index].title     = vm.updateAskTitle;
                        vm.discussions[index].message   = vm.updateAskComment; 
                        vm.updateAskTitle = null;
                        vm.updateAskComment = null;
                        $($scope.classt).slideUp(200);
                    }
                });
            }
        };

        function deleteDiscussion(user_id, discuss_id, index) {
            if (currentUser.id === user_id) {
                RetrieveData.ppdData('/discussion/delete/', 'DELETE', null, discuss_id, null).then(function(res) {
                    if (res.success)
                        vm.discussions.splice(index, 1);
                });
            }
        };

        function publishReply(pd_id, discuss_index) {
            if (currentUser) {

                var object = {
                    user_id                 : currentUser.id,
                    project_discussion_id   : pd_id,
                    message                 : vm.commentInAsk,
                };

                RetrieveData.ppdData('/discussion/add/reply', 'POST', object, null, null).then(function(res) {
                    if (res.success) {
                        vm.commentInAsk = null;
                        object.id = res.insertId;
                        object.user_info2 = {
                            picture : currentUser.profile_picture_icon,
                            username : currentUser.username,
                            first_name : currentUser.first_name,
                            last_name : currentUser.last_name,
                        };
                        object.numRLike = 0;
                        if (!vm.discussions[discuss_index].comments)
                            vm.discussions[discuss_index].comments = [];
                        vm.discussions[discuss_index].comments.push(object);
                        $($scope.classt).slideUp(200);
                    }
                });
            } else
                console.log("ERROR");
        };

        function updateReply(comment_id, user_id, index, parent_index) {
            if (currentUser.id === user_id) {
                 var object = {
                    pdr_id      : comment_id,
                    message     : vm.updateCommentInAsk,
                };
                console.log(index, parent_index);
                RetrieveData.ppdData('/discussion/put/reply', 'PUT', object, null, null).then(function(res) {
                    if (res.success) {
                        vm.discussions[parent_index].comments[index].message = vm.updateCommentInAsk;
                        vm.updateCommentInAsk = null;
                        $($scope.classt).slideUp(200);
                    }
                });
            }
        };

        function deleteReply(user_id, comment_id, index, parent_index) {
            if (currentUser.id === user_id) {
                RetrieveData.ppdData('/discussion/delete/reply/', 'DELETE', null, comment_id, null).then(function(res) {
                    if (res.success)
                        vm.discussions[parent_index].comments.splice(index, 1);
                });
            }
        };

        function initDiscussionValue(title, message) {
            vm.updateAskTitle   = title;
            vm.updateAskComment = message;
        };

        function initReplyValue(message) {
            vm.updateCommentInAsk = message;
        };

        function getVoteDiscussion(pd_id, index) {
            if (currentUser) {
                var object = {
                    user_id                 : currentUser.id,
                    project_discussion_id   : pd_id
                }
                RetrieveData.ppdData('/discussion/add/like', 'POST', object, null, null).then(function(res) {
                    if (res.success) {
                        if (res.message === "Like") {
                            vm.discussions[index].numLike++;
                            vm.discussions[index].myLike = 1;
                        } else {
                            vm.discussions[index].numLike--;
                            vm.discussions[index].myLike = 0;
                        }
                    }
                });
            }
        };

        function getVoteReply(pdr_id, index, parent_index) {
            console.log(index, parent_index);
            if (currentUser) {
                var object = {
                    user_id             : currentUser.id,
                    project_reply_id    : pdr_id
                }
                RetrieveData.ppdData('/discussion/add/reply/like', 'POST', object, null, null).then(function(res) {
                    if (res.success) {
                        if (res.message === "Like") {
                            vm.discussions[parent_index].comments[index].numRLike++;
                            vm.discussions[parent_index].comments[index].myRLike = 1;
                        } else {
                            vm.discussions[parent_index].comments[index].numRLike--;
                            vm.discussions[parent_index].comments[index].myRLike = 0;
                        }
                    }
                });
            }
        };

        function displayEdit(class_name, index, parent_index) {
            $($scope.classt).slideUp(200);
            if (parent_index >= 0)
                $scope.classt = class_name + index.toString() + '-' + parent_index.toString();
            else
                $scope.classt = class_name + index.toString();
            if ($($scope.classt).css('display') === "none") {
                $($scope.classt).slideDown(200);
            } else {
                $($scope.classt).slideUp(200);
            }
        };


        // ///////////////////////////////////////
        // ////////////// FEEDBACKS //////////////
        // ///////////////////////////////////////

        // // function
        // // init Feedbacks
        // function initFeedbacks () {
        //     vm.questions = project_FeedbacksResolve.data;
        //     vm.totalNumber = vm.totalNumber + vm.questions.length;
        // }

        // // function deployReplies (question) {
        // //     if (question.isCollapse == false || !question.isCollapse) {
        // //         question.isCollapse = true;
        // //         vm.isCollapse = true;
        // //     } else {
        // //         question.isCollapse = false;
        // //         vm.isCollapse = false;
        // //     }
        // // }

        // function isOwnedReply (reply, creator_user_id) {

        //     if (reply.user_id === creator_user_id) {
        //         reply.owned = true;
        //     } else {
        //         reply.owned = false;
        //     }
        // }

        // function deleteReply (reply, question_index) {
        //     Feedbacks.deleteFeedbackReply(reply.id, function (response) {
        //         if (response.serverStatus === 2) {
        //             var index = vm.questions[question_index].replies.indexOf(reply);
        //             vm.questions[question_index].replies.splice(index, 1);
        //         } else {
        //             console.log('error');
        //         }
        //     });
        // }

        // function pushReply (message, feedback_id, question) {
        //     var data = {};

        //     data.feedback_id = feedback_id;
        //     data.description = message;
        //     data.creator_picture = currentUser.profile_picture_icon;
        //     data.creator_first_name = currentUser.first_name;
        //     data.creator_last_name = currentUser.last_name;
        //     data.url = vm.currentUrl;
            
        //     Feedbacks.addFeedbackReply(data, function (response) {
        //         if (response.success) {
        //             var reply = {};
        //             reply.id = response.insertId;
        //             reply.feedback_id = feedback_id;
        //             reply.description = message;
        //             reply.created_at = new Date();
        //             reply.isOwned = true;
        //             reply.user_profile = {};
        //             reply.user_profile.profile_picture_icon = currentUser.profile_picture_icon;
        //             reply.user_profile.first_name = currentUser.first_name;
        //             reply.user_profile.last_name = currentUser.last_name;
        //             if (question.replies) {
        //                 question.replies.push(reply);
        //             } else {
        //                 question.replies = [];
        //                 question.replies.push(reply);
        //             }
        //         } else {
        //             console.error('cant push reply', data);
        //         }
        //     });
        // };

        // ///////////////////////////////////////
        // //////////////// ASKS /////////////////
        // ///////////////////////////////////////

        // function showorhideAskForm (event) {
        //     if (!currentUser) {
        //         showbottomAlert.pop_it(event);
        //     } else {
        //         if (vm.showAskForm == true) {
        //             vm.showAskForm = false;
        //             return;
        //         }
        //         if (vm.showAskForm == false) {
        //             vm.showAskForm = true;
        //         }
        //     }
        // }

        // function initAsks () {
        //     $http.get('/ask/public_id/' + $stateParams.public_id).success(function (response) {
        //         vm.asks = response;
        //         vm.totalNumber += vm.asks.length;
        //     });
        // };

        // function addAsk (newAsk) {
        //     newAsk.project_id = vm.project.id;
        //     newAsk.creator_img = currentUser.profile_picture_icon;
        //     newAsk.first_name = currentUser.first_name;
        //     newAsk.last_name = currentUser.last_name;
        //     newAsk.project_public_id = vm.project.public_id;
        //     newAsk.url  = vm.currentUrl;
        //     $http.post('/asks', newAsk).success(function (response) {
        //         // ok now gonna need to push it etc ...
        //         $timeout(function () {
        //             newAsk.created_at = new Date();
        //             vm.asks.push(newAsk);
        //             vm.newAsk = {};
        //             vm.totalNumber = vm.totalNumber + 1;
        //         }, 500);
        //         if (vm.showAskForm == true) {
        //             vm.showAskForm = false;
        //             return;
        //         }
        //         if (vm.showAskForm == false) {
        //             vm.showAskForm = true;
        //             return;
        //         }
        //     })
        // };

        // function deployAskReplies (ask) {
        //     if (ask.isCollapse == false || !ask.isCollapse) {
        //         ask.isCollapse = true;
        //         vm.isCollapse = true;
        //     } else {
        //         ask.isCollapse = false;
        //         vm.isCollapse = false;
        //     }
        // };

        // function pushAskReply (message, ask_id, ask) {
        //     var data = {};

        //     data.ask_id = ask_id;
        //     data.description = message;
        //     data.creator_picture = currentUser.profile_picture_icon;
        //     data.creator_first_name = currentUser.first_name;
        //     data.creator_last_name = currentUser.last_name;
        //     data.url = vm.currentUrl;

        //     $http.post('/ask_reply/add', data).success(function (response) {
        //         if (currentUser.id == ask.user_id) {
        //             ask.owned = true;
        //         }
        //         data.created_at = new Date();
        //         ask.replies.push(data);
        //     });
        // };

        // $scope.prettyText = function(text) {
        //     text = text.replace(/\r?\n/g, '<br />');
        //     return text;
        // };

        // function deleteAskReply (ask_reply, question_index) {
        //     $http.delete('/ask_reply/delete/' + ask_reply.id).success(function (response) {
        //         if (response.serverStatus == 2) {
        //             var index = vm.asks[question_index].replies.indexOf(ask_reply);
        //             vm.asks[question_index].replies.splice(index, 1);
        //         }
        //     });
        // };

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
