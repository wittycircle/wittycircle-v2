'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:ViewProjectCtrl
 * @description
 * # ViewProjectCtrl
 * Controller of the wittyApp
 **/

//******** CONTROLLER *********
angular.module('wittyApp').controller('ViewProjectCtrl', function($window, $timeout, $sce, showbottomAlert, Beauty_encode, Project_Follow, $stateParams, Feedbacks, $location, $scope, $rootScope, $state, $http, Upload, Data_project, Users, $modal, Projects, Categories, $mdBottomSheet) {

  $scope.no_follow = true;
  var currentUser = $rootScope.globals.currentUser;
  $scope.loggedUser = $rootScope.globals.currentUser;
  $scope.isCollapse = false;
  $scope.totalNumber = 0;
  $scope.involved_users = [];
  $scope.currentUrl = "http://www.wittycircle.com" + $location.path();

  $scope.encodeUrl = function(url) {
    url = Beauty_encode.encodeUrl(url);
    return url;
  }

  $scope.showbottomAl = function(event) {
    showbottomAlert.pop_it(event);
  };

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

  $scope.initProject = function() {
    $scope.project = Projects.getProjectbyPublicId($stateParams.public_id, function(response) {
      if (!response[0]) {
        console.log('No project found with this id');
        //$scope.project = response[0];
        //Need to redirect user to 404
        $location.path('/');
      } else {
        $scope.project = response[0];
        $scope.project.post = $sce.trustAsHtml(response[0].post);
        Projects.incrementViewProject($scope.project.id, function (response) {
           //console.log(response);
        });
        Project_Follow.getProjectFollowers($scope.project.id, function(response) {
          $scope.project_followers = response;
        });
        if (!$scope.project.picture) {
          $scope.project.picture = "https://res.cloudinary.com/dqpkpmrgk/image/upload/v1456744591/no-bg_k0b9ob.jpg";
        }
        if ($scope.project.picture_position) {
          $scope.project.picture_position = adjustSize($scope.project.picture_position, $scope.project.picture_position_width);
        }
        if ($scope.project.main_video) {
          $scope.config = {
                        preload: "auto",
                        sources: [
                            {src: $sce.trustAsResourceUrl($scope.project.main_video), type: "video/mp4"}
                        ],
                        theme: {
                            url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                        },
                        plugins: {
                            controls: {
                                autoHide: true,
                                autoHideTime: 2000
                            },
                            poster: "http://www.videogular.com/assets/images/videogular.png"
                        }
                    };
        }
        if (currentUser && currentUser.id == $scope.project.creator_user_id) {
          $scope.no_follow = false;
          //$scope.isOwned = true;
        } else {
          $scope.no_follow = true;
          if ($scope.loggedUser) {
            Project_Follow.checkFollowProject($scope.project.id, function(response) {
              if (!response.follow)
                $scope.followText = "Following";
              else
                $scope.followText = "Follow";
            });
            var history = {};
            history.project_id = $scope.project.id;
            //need to put this one into a service
            $http.post('http://127.0.0.1/history/project/'+ currentUser.id, history).then(function (response) {
              //console.log(response);
            });
          }
        }
        $scope.category = Categories.getCategory($scope.project.category_id, function(response) {
          $scope.category = response[0];
        });
        $scope.project.user = Users.getUserbyId($scope.project.creator_user_id, function(response) {
          $scope.project.user = response.profile;
        });
        // Getting the involved users of the project, setting iseditable scope and getting the img-icon of header
        $http.get('http://127.0.0.1/project/' + $scope.project.id + '/involved').success(function (response) {
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
        });
        if (currentUser != undefined) {
          if ($scope.project.creator_user_id == currentUser.id) {
            $scope.editable = true;
          }
        }
        // GETTINGS THE NEEDS
        $http.get('http://127.0.0.1/openings/project/' + response[0].id).then(function(res) {
          if (res.data.length == 0) {
            $scope.openingsNumber = 0;
          } else {
            $scope.openings = res.data;
            $scope.openingsNumber = res.data.length;
            Object.keys($scope.openings).forEach(function(key) {
              if ($scope.openings[key].taggs != false) {
                $scope.openings[key].taggs = JSON.parse($scope.openings[key].taggs);
              }
            });
          }
        });
      }
    });
    $scope.initFeedbacks();
    $scope.initAsks();

    /*** Project Card Page ***/
    /*
    $scope.$parent.seo = {
      pageTitle: $scope.project.title,
      pageDescription: $scope.project.description
    };

    $scope.$parent.card = {
      title: $scope.project.title,
      type: "Project Page",
      url: $location.absUrl(),
      image: $scope.project.picture,
    };
    */
  };


  $scope.goToMessage = function(id) {
    if (!$rootScope.globals.currentUser) {
      showbottomAlert.pop_it();
      return ;
    }
    if (id !== $rootScope.globals.currentUser.id) {
      Users.getProfileByUserId(id, function(res) {
        $state.go('messages', {profile_id : res.content.profile_id});
      });
    }
  };

  $scope.goToProfile = function(id) {
    Users.getUserIdByProfileId(id).then(function(response) {
      $state.go('profile', {username : response.userId.username});
    })
  };


  $scope.followProject = function(project_id) {
    if (currentUser && (currentUser.id !== $scope.project.creator_user_id)) {
      Project_Follow.followProject(project_id, function (response) {
        if (response.success) {
          if (response.msg === "Project followed")
            $scope.followText = "Following";
          else
            $scope.followText = "Follow";
        }
      });
    }
  };

  $scope.unfollowButton = function(i) {
    if ($scope.followText === "Following" && i == 0)
      $scope.followText = "Unfollow ?";
    if ($scope.followText === "Unfollow ?" && i == 1)
      $scope.followText = "Following";
  }

  $scope.deleteProject = function(project_id) {
    Projects.deleteProject(project_id, function(response) {
      console.log(response);
      $location.path('/');
    })
  };


/////////////////////////////////////////////////
//////////////  FEEDBACK  //////////////////////
////////////////////////////////////////////////
  function addUsertoFeedbacks(quest) {
    Object.keys(quest).forEach(function (key) {
      quest[key].user = Users.getUserbyId(quest[0].user_id, function(response) {
        quest[key].user = response.profile;
      });
    });
    return (quest);
  };

  function addRepliestoFeedbacks(quest) {
    Object.keys(quest).forEach(function (key) {
      quest[key].replies = $http.get('http://127.0.0.1/feedback_replies/' + quest[key].id).success(function (response) {
        quest[key].replies = response;
        quest[key].repliesNumber = response.length;
      });
    });
    return (quest);
  };

  function countObjInArray(array) {
    var count = 0;
    var key;

    for (key in array) {
      count++;
    }
    return count;
  }

  $scope.initFeedbacks = function () {
    $scope.questions = Feedbacks.getFeedbacksbyProjectPublicId($stateParams.public_id, function(response) {
      //$scope.questions = addUsertoFeedbacks(response);
      $scope.questions = addRepliestoFeedbacks(response);
      //$scope.repliesNumber = countObjInArray($scope.questions)
      $scope.feedNumber = countObjInArray(response);
      $scope.totalNumber = $scope.totalNumber + $scope.feedNumber;
    });
  };

  $scope.deployReplies = function(question) {
    if (question.isCollapse == false || !question.isCollapse) {
      question.isCollapse = true;
      $scope.isCollapse = true;
    } else {
      question.isCollapse = false;
      $scope.isCollapse = false;
    }
  };

  $scope.isOwnedReply = function(reply, creator_user_id) {
    if (reply.user_id == creator_user_id) {
      reply.owned = true;
    } else {
      reply.owned = false;
    }
  }

  $scope.isInTheTeam = function(project, reply) {
    $http.get('http://127.0.0.1/project/' + project.id + '/involved').success(function (response) {
      Object.keys(response).forEach(function (key) {
        if (response[key].user_id == reply.user_id) {
          reply.inTeam = true;
          reply.owned = true;
        }
      });
    });
    if (project.creator_user_id == reply.user_id) {
      reply.inTeam = true;
    }
  };


  $scope.getReplies = function(feedback_id, question) {
    $http.get('http://127.0.0.1/feedback_replies/' + feedback_id).success(function (response) {
      if (response != undefined) {
        question.replies = response;
        //question.isCollapse = false;
        return question;
      }
    })
  };

  $scope.reply = "";
  //$scope.showdelete = false;

  $scope.pushReply = function(message, feedback_id, question) {
    var data = {};

    data.feedback_id = feedback_id;
    data.description = message;
    data.creator_picture = currentUser.profile_picture_icon;
    data.creator_first_name = currentUser.first_name;
    data.creator_last_name = currentUser.last_name;
    $http.post('http://127.0.0.1/feedback_replies', data).success(function (response) {
      if (currentUser.id == question.user_id) {
        question.owned = true;
      }
      data.created_at = new Date();
      data.owned = true;
      question.replies.push(data);
      $scope.reply = [];
    });
  };

  $scope.deleteReply = function(reply, question_index) {
    $http.delete('http://127.0.0.1/feedback_replies/' + reply.id).success(function (response) {
      if (response.serverStatus == 2) {
        var index = $scope.questions[question_index].replies.indexOf(reply);
        $scope.questions[question_index].replies.splice(index, 1);
      }
    });
  };


  /////////////////////////////////////////////////
  ///////////////////  ASKS  /////////////////////
  ////////////////////////////////////////////////

  $scope.showAskForm = false;
  $scope.newAsk = {};

  function addRepliestoAsks(quest) {
    Object.keys(quest).forEach(function (key) {
      quest[key].replies = $http.get('http://127.0.0.1/ask_replies/' + quest[key].id).success(function (response) {
        quest[key].replies = response;
        quest[key].repliesNumber = response.length;
      });
    });
    return (quest);
  };

  $scope.showorhideAskForm = function(event) {
    if (!currentUser) {
      showbottomAlert.pop_it(event);
    } else {
      if ($scope.showAskForm == true) {
        $scope.showAskForm = false;
        return;
      }
      if ($scope.showAskForm == false) {
        $scope.showAskForm = true;
      }
    }
  };

  $scope.initAsks = function () {
    $http.get('http://127.0.0.1/ask/public_id/' + $stateParams.public_id).success(function (response) {
      //$scope.asks = response;
      $scope.asks = addRepliestoAsks(response);
      //$scope.repliesNumber = countObjInArray($scope.questions)
      $scope.askNumber = countObjInArray(response);
      //console.log($scope.totalNumber);
      $scope.totalNumber += $scope.askNumber;
    });
  };

  $scope.addAsk = function(newAsk, project) {
    newAsk.project_id = project.id;
    newAsk.creator_img = currentUser.profile_picture_icon;
    newAsk.first_name = currentUser.first_name;
    newAsk.last_name = currentUser.last_name;
    newAsk.project_public_id = project.public_id;
    $http.post('http://127.0.0.1/asks', newAsk).success(function (response) {
      // ok now gonna need to push it etc ...
      $timeout(function () {
        $scope.asks.push(newAsk);
        $scope.newAsk = {};
        $scope.askNumber = $scope.askNumber + 1;
        $scope.totalNumber = $scope.totalNumber + 1;
      }, 1500);
      if ($scope.showAskForm == true) {
        $scope.showAskForm = false;
        return;
      }
      if ($scope.showAskForm == false) {
        $scope.showAskForm = true;
      }
    })
  };

  $scope.deployAskReplies = function(ask) {
    if (ask.isCollapse == false || !ask.isCollapse) {
      ask.isCollapse = true;
      $scope.isCollapse = true;
    } else {
      ask.isCollapse = false;
      $scope.isCollapse = false;
    }
  };

  $scope.pushAskReply = function(message, ask_id, ask) {
    var data = {};

    data.ask_id = ask_id;
    data.description = message;
    data.creator_picture = currentUser.profile_picture_icon;
    data.creator_first_name = currentUser.first_name;
    data.creator_last_name = currentUser.last_name;
    $http.post('http://127.0.0.1/ask_reply/add', data).success(function (response) {
      if (currentUser.id == ask.user_id) {
        ask.owned = true;
      }
      data.created_at = new Date();
      ask.replies.push(data);
      $scope.reply = [];
    });
  };

  $scope.deleteAskReply = function(ask_reply, question_index) {
    $http.delete('http://127.0.0.1/ask_reply/delete/' + ask_reply.id).success(function (response) {
      if (response.serverStatus == 2) {
        var index = $scope.asks[question_index].replies.indexOf(ask_reply);
        $scope.asks[question_index].replies.splice(index, 1);
      }
    });
  };


})
