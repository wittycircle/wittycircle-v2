'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:CreateProjectCtrl
 * @description
 * # CreateProjectCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('CreateProjectCtrl', ['$rootScope', '$scope', 'Categories', 'Feedbacks', '$http', 'Users', '$state', '$stateParams', 'Beauty_encode', 'Projects', 'Locations', '$sce', '$timeout', 'Project_Follow', '$location', 'Data_project', '$modal', 'Upload', 'cloudinary', 'Upload', 'redactorOptions', 'RetrieveData',
  function ($rootScope, $scope, Categories, Feedbacks, $http, Users, $state, $stateParams, Beauty_encode, Projects, Locations, $sce, $timeout, Project_Follow, $location, Data_project, $modal, $upload, cloudinary, Upload, redactorOptions, RetrieveData) {

  $scope.currentUser = $rootScope.globals.currentUser;
  $scope.project_category = {};
  $scope.places_after = {};
  $scope.isSaved = false;
  $scope.isSavedText = "Next";
  $scope.noOpenings = false;
  $scope.state_choose = {};
  $scope.haveBg = true;
  $scope.$state = $state;
  Categories.getCategories(function (response) {
    $scope.categories = response;
  });
  $scope.config = {sources: null, video_poster: null};
  $scope.networkName = "The Refiners, 500 Startups, Y Combinator, Techstars...";

  /*** Redactor Configuration ***/
  redactorOptions.imageUpload = '/upload/redactor';
  redactorOptions.buttonSource = true;
  redactorOptions.imageResizable = true;
  redactorOptions.imageEditable = true;
  redactorOptions.imageLink = true;
  redactorOptions.visual = true;// false for html mode

  redactorOptions.buttons = ['format', 'bold', 'italic', 'deleted', 'lists', 'image', 'video', 'file', 'link', 'horizontalrule'];
  redactorOptions.plugins = ['imagemanager'];
  redactorOptions.formatting = ['p', 'blockquote', 'pre', 'h1'];
  /*
  **End Redactor configuration
  */

  /*** Getting the project id previouslt set in a cookie in data_project service **/
  var projectId = Data_project.returnProjectId().id;

  /*** Email Invitation ***/
  $scope.mailList = [];
  $scope.inviteW = "Invite";

  $scope.addEmailToList = function(keycode, email) {
    if (keycode === 13 && !email) {
      $scope.errorMail = true;
      return ;
    }
    if (keycode == 13 && email) {
      $scope.errorMail = false;
      $scope.mailList.push(email);
      $scope.emailInvite = "";
    }
  };

  $scope.removeMailFromList = function(index) {
    $scope.mailList.splice(index, 1);
  };

  $scope.sendInvitation = function() {
    if ($scope.mailList[0]) {
      RetrieveData.ppdData('/invitation/new', "POST", {user_id: $scope.currentUser.id, mailList: $scope.mailList, team: true}).then(function(res) {
        if (res.success) {
          $scope.inviteW = "Invited";
          $scope.sended = true;
          $timeout(function() {
            $("#sinvitem").fadeOut(200);
            $scope.mailList = [];
            $scope.sended = false;
            $scope.inviteW = "Invite";
          }, 500);
        }
      });
    }
  };

  function capitalizeFirstLetter(string) {
    if (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
      return;
    }
  }

  $scope.encodeUrl = function(url) {
    url = Beauty_encode.encodeUrl(url);
    return url;
  }

  function getDescription(name) {
    var description = ["The main informations about your project",
    "Tell us what you have in mind",
    "What about working with others?",
    "What are you looking for?",
    "Get feedback from the crowd"];
    var desc;

    if (name == "basics") {
      desc = description[0];
    }
    if (name == "story") {
      desc = description[1];
    }
    if (name == "people") {
      desc = description[2];
    }
    if (name == "needs") {
      desc = description[3];
    }
    if (name == "community") {
      desc = description[4];
    }
    return desc;
  }

  var visitedId = 0;

  $scope.canGotoThis = function(toS, sid) {
    var sname = $state.current.name.split('.');
    var state = sname[1];
    var id;
    var ret = false;

    if (state == 'basics') {
      id = 0;
      if (id > visitedId) {
        visitedId = id;
        ret = true;
      }
    }
    if (state == 'story') {
      id = 1;
      if (id > visitedId) {
        visitedId = id;
        ret = true;
      }
    }
    if (state == 'people') {
      id = 2;
      if (id > visitedId) {
        visitedId = id;
        ret = true;
      }
    }
    if (state == 'needs') {
      id = 3;
      if (id > visitedId) {
        visitedId = id;
        ret = true;
      }
    }
    if (state == 'community') {
      id = 4;
      if (id > visitedId) {
        visitedId = id;
        ret = true;
      }
    }
    if (sid < id || sid <= visitedId) {
      $state.go('createproject.' + toS);
    }
  }

  $scope.isVisible = function(sid) {
    var sname = $state.current.name.split('.');
    var state = sname[1];
    var id;
    var ret = false;

    if (state == 'basics') {
      id = 0;
      if (id > visitedId) {
        visitedId = id;
      }
    }
    if (state == 'story') {
      id = 1;
      if (id > visitedId) {
        visitedId = id;
      }
    }
    if (state == 'people') {
      id = 2;
      if (id > visitedId) {
        visitedId = id;
      }
    }
    if (state == 'needs') {
      id = 3;
      if (id > visitedId) {
        visitedId = id;
      }
    }
    if (state == 'community') {
      id = 4;
      if (id > visitedId) {
        visitedId = id;
      }
    }
    if (sid < id || sid <= visitedId) {
      ret = true;
    }
    return ret;
  }

  $scope.isActive = function(sid) {
    var sname = $state.current.name.split('.');
    var state = sname[1];
    var id;
    var ret = false;

    if (state == 'basics') {
      id = 0;
    }
    if (state == 'story') {
      id = 1;
    }
    if (state == 'people') {
      id = 2;
    }
    if (state == 'needs') {
      id = 3;
    }
    if (state == 'community') {
      id = 4;
    }
    if (id == sid) {
      ret = true;
    }
    return ret;
  }

  var sname = $state.current.name.split('.');
  $scope.state = capitalizeFirstLetter(sname[1]);
  $scope.state_description = getDescription(sname[1]);

  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
      var sname = toState.name.split('.');
      $scope.fromState = fromState;
      $scope.state = capitalizeFirstLetter(sname[1]);
      $scope.state_description = getDescription(sname[1]);
      if (sname[1] == "community") {
        $scope.isSavedText = "Publish";
      } else {
        $scope.isSavedText = "Next";
      }
    }
  );

  $scope.back = function() {
    $state.go($scope.fromState.name);
  }

  function addUsertoFeedbacks(quest) {
    Object.keys(quest).forEach(function (key) {
      quest[key].user = Users.getUserbyId(quest[0].user_id, function(response) {
        quest[key].user = response.profile;
      });
    });
    return (quest);
  };

  function addUserToInvolvment(data) {
    var users = [];

    Object.keys(data).forEach(function (key) {
      Users.getUserbyId(data[key].user_id, function (response) {
        response.profile.id = response.data.id;
        users.push(response.profile);
      });
    });
    return users;
  }

  /*
  ** INITIATE PROJECT WITH FECTHING DATA
  */
  $scope.initiateProject = function () {
    $scope.categories = Categories.getCategories(function (response) {
      $scope.categories = response;
    });
    $scope.project = Projects.getProjectbyId(projectId, function (response) {
      $scope.project = response[0];
      $scope.select_state = $scope.project.status;
      $scope.project.post = "<p><em style='color: #999999'>Note: images, gifs&nbsp;and videos can be &nbsp;directly&nbsp;embedded by copy pasting urls below.</em></p>" + "<p><br /></p><p>Here are a a helpful&nbsp;guideline&nbsp;so that people can fully understand what you have in mind:</p><br><h1>What?</h1><ul><li>What is&nbsp;your product&nbsp;/&nbsp;idea&nbsp;/&nbsp;service&nbsp;/&nbsp;project / initiative?</li><li>How does it work?</li><li>What does it do?</li></ul><p><br /></p><h1>Why?</h1><ul><li>Why are you working on it?</li><li>Why does it matter to you?</li><li>If you are trying to solve a problem, &nbsp;what is it?</li></ul><p><br /></p><h1>When?</h1><ul><li>What stage are you in?</li><li>When did you start working on it?</li><li>What are your next steps</li></ul><p><strong></strong><br></p>";
      $scope.places_after.obj = Locations.getplaces($scope.project);
      if ($scope.project.project_visibility === 1) {
        $scope.project.project_visibility = true;
      }
      if ($scope.project.picture) {
        $scope.imagecover = $scope.project.picture;
        if ($scope.project.picture_position && $scope.imagecover) {
          $scope.imagecoverposition = $scope.project.picture_position;
        }
      }
      if ($scope.project.main_video) {
        $scope.config.sources = $scope.project.main_video;
        if ($scope.project.video_poster) {
          $scope.config.video_poster = $scope.project.video_poster;
        }
      }
      Categories.getCategory(response[0].category_id, function (response) {
        $scope.project_category.obj = response[0];
      });
      Feedbacks.getFeedbacksbyProjectPublicId($scope.project.public_id, function(response) {
        $scope.questions = addUsertoFeedbacks(response);
      });
      $http.get('/project/' + response[0].id + '/involved').then(function(response) {
        $scope.involved_users = addUserToInvolvment(response.data);
      });
      $http.get('/openings/project/' + response[0].id).then(function(response) {
        if (response.data.length == 0) {
          $scope.openings = [];
          $scope.noOpenings = true;
        } else {
          $scope.openings = response.data;
          Object.keys($scope.openings).forEach(function(key) {
            if ($scope.openings[key].taggs != false) {
              $scope.openings[key].taggs = JSON.parse($scope.openings[key].taggs);
            }
          });
        }
      });

    });
  };

  /*
  ** UPLOAD PHOTO_COVER AND SETTINGS THE RIGHT ONE FOR $SCOPE.IMAGECOVER
  */

  $scope.selectCategory = function(cat) {
    $scope.project_category.obj = cat;
  }

  $scope.dragcv = true;
  $scope.cursorpt = false;

  $scope.getNetwork = function(network) {
    if (network === "None") {
        $scope.chooseNetwork = false;
        $scope.networkName = "The Refiners, 500 Startups, Y Combinator, Techstars...";
        return ;
    }
    $scope.chooseNetwork = true;
    $scope.networkName = network;
  };

  $scope.editPosition = function() {
    $scope.dragcv = false;
    $scope.cursorpt = true;

    $timeout(function() {
        $('#viewProject-header').backgroundDraggable();
    }, 1000);
  };

  $scope.savePosition = function(data, project_category, places_after, statechoose) {
    $scope.dragcv = true;
    $scope.cursorpt = false;
    $scope.imagecoverposition = angular.element('#viewProject-header').css('background-position');
    $scope.savebasics(data, project_category, places_after, statechoose);
  }

  $scope.cancelPosition = function() {
    $scope.dragcv = true;
    $scope.cursorpt = false;
  }

  $scope.uploadFiles = function(file) {
    var data = {};
    $scope.imageCoverLoading = true;
    Upload.dataUrl(file, true).then(function(url){
      data.url = url;
      $http.post('/upload/project/cover_card', data).success(function(response) {
        $scope.picture_card = response.secure_url;
      });

      $http.post('/upload/project/cover', data).success(function(resp) {
        $scope.imagecoverposition = 'center center';
        $scope.imagecover = resp.secure_url;
        $scope.cursorpt = true;
        $scope.dragcv = false;

        $timeout(function() {
            $('#viewProject-header').backgroundDraggable();
            $scope.imageCoverLoading = false;
        }, 1000);

      }).error(function(response) {
        console.log(response);
      });
    });

  };

  $scope.uploadPoster = function () {
          $scope.modalInstance = $modal.open({
          animation: true,
          templateUrl: 'views/projects/create/modal/upload_poster.client.html',
          controller: 'UploadPosterCtrl',
          scope: $scope
      });
  }

  $scope.deleteVideo = function() {
    var data = {};

    if ($scope.project.main_video) {
      data.video_id = $scope.project.main_video;
      data.project_id = $scope.project.id;
      $scope.config.sources = false;

      $http.post('/upload/delete/videos', data).success(function(response) {
        if (response.result == "ok") {
          $scope.project.main_video = "";
        }
      }).error(function(error_message) {
        console.log(error_message);
      });
    } else {
      //data.video_id = $scope.project_video_id;
      //data.project_id = $scope.project.id;
      //$http.post('/upload/delete/videos', data).success(function(response) {
        //console.log($scope.config.sources);
        //if (response.result == "ok") {
        $scope.config.sources = false;
        $scope.videoproject = false;
        //}
        //console.log($scope.config.sources);
      //}).error(function(error_message) {
        //console.log(error_message);
      //});
    }
  };

  $scope.savebasics = function(data, project_category, places_after, statechoose) {
    if ($scope.project_video && $scope.project_video !== null && typeof $scope.project_video != 'undefined') {
      data.main_video = $scope.project_video;
      data.main_video_id = $scope.project_video_id;
    } if (!$scope.project_video || $scope.project_video === undefined) {
        delete data.main_video;
    }

    if (statechoose != undefined) {
      data.status = statechoose;
    }
    data.picture_position = $scope.imagecoverposition;
    data.picture = $scope.imagecover;
    if ($scope.picture_card) {
        data.picture_card = $scope.picture_card;
    }
    if ($scope.chooseNetwork) {
        data.network = $scope.networkName;
    } else
      data.network = null;
    data.category_id = project_category.id;
    Locations.setplaces(places_after, data);
    Projects.updateProject(data.id, data, function(response) {
      //$state.go('createproject.story');
    });
  };

  $scope.savestory = function(data) {
    if ($scope.project_video) {
      data.main_video = $scope.project_video;
    }
    if (data.post) {
        var lastOcc = data.post.length;
        if (data.post.indexOf('<p><em style="color: #999999">Note: images, gifs&nbsp;and videos can be &nbsp;directly&nbsp;embedded by copy pasting urls below.</em></p>') >= 0) {
            var newPost = data.post.substring(137, lastOcc);
            data.post = newPost;
        }

        var newOcc = data.post.indexOf('<p>Here are a a helpful&nbsp;guideline&nbsp;so that people can fully understand what you have in mind:</p>');
        if (newOcc >= 0) {
            lastOcc = data.post.length;
            var newPost2 = data.post.substring(106 + newOcc, lastOcc);
            data.post = newPost2;
        }
    }
    Projects.updateProject(data.id, data, function(response) {
      $state.go('createproject.people');
    });
  }

  /*
  ** PEOPLE STATE :: START BY OPENING MODAL
  */
  $scope.findandadduser = function() {
    $scope.modalInstance = $modal.open({
       animation: true,
       templateUrl: 'views/projects/create/modal/add-user-project.client.html',
       controller: 'AddUserProjectCtrl',
       windowClass: 'adduser-modal',
       scope: $scope
     });
  };

  function removeInvolvedUser(data, user_id) {
    Object.keys(data).forEach(function (key) {
      if (data[key].id === user_id && data[key].id != undefined) {
        data.splice(key, 1);
        return;
      }
    });
  };

  $scope.deleteInvolvedUser = function(project_id, user_id, involved_users) {
    $http.delete('/project/' + project_id + '/involved/' + user_id).then(function(response) {
      if (response.status == 200) {
        removeInvolvedUser(involved_users, user_id);
      }
    });
  };

  /*
  ** NEEDS STATE
  */

  $scope.addNeeds = function() {
    $scope.modalInstance = $modal.open({
       animation: true,
       templateUrl: 'views/projects/create/modal/add_needs.view.client.html',
       size: 'lg',
       controller: 'AddNeedsProjectCtrl',
       scope: $scope
     });
  };

  $scope.updateOpening = function(opening, index) {
    $rootScope.need = opening;
    $rootScope.need.index = index;
    $scope.modalInstance = $modal.open({
       animation: true,
       templateUrl: 'views/projects/create/modal/update_needs.view.client.html',
       size: 'lg',
       controller: 'AddNeedsProjectCtrl',
       scope: $scope
     });
  };

  $scope.deleteOpening = function(opening_id) {
    console.log(opening_id);
    $http.delete('/opening/' + opening_id).success(function(response) {
      console.log(response);
      if (response.serverStatus == 2) {
        Object.keys($scope.openings).forEach(function (key) {
          if ($scope.openings[key].id == opening_id) {
            $scope.openings.splice(key, 1);
            return;
          }
        });
      }
    });
  };


  /*
  ** COMMUNITY STATE :: START BY OPENING MODAL
  */
  $scope.addquestion = function() {
    $scope.modalInstance = $modal.open({
       animation: true,
       templateUrl: 'views/projects/create/modal/add-question-project.view.client.html',
       size: 'lg',
       controller: 'AddQuestionProjectCtrl',
       scope: $scope
     });
  };


  $scope.deleteFeedbacks = function(feedbacks_id) {
    var error_message = "";
    Feedbacks.deleteFeedbacks(feedbacks_id, function(response) {
      if (response.serverStatus == 2) {
        for (var i = 0; i < $scope.questions.length; i++) {
          if ($scope.questions[i].id == feedbacks_id)
          $scope.questions.splice(i, 1);
          return;
        }
      }
      else {
        error_message = response;
      }
    });
    return error_message;
  };

  $scope.finish = function(public_id, title, data, project_category, places_after, statechoose) {
      var path = '/project/' + public_id + '/' + $scope.encodeUrl(title);
      if ($state.current.url == '/basics') {
        $scope.savebasics(data, project_category, places_after, statechoose);
        $state.go('createproject.story');
      }
      if ($state.current.url == '/story') {
        $scope.savestory(data);
        $state.go('createproject.people');
      }
      if ($state.current.url == '/people') {
        $state.go('createproject.needs');
      }
      if ($state.current.url == '/needs') {
        $state.go('createproject.community');
      }
      if ($state.current.url == '/community') {
        //data.project_visibility = 1;
        $scope.savebasics(data, project_category, places_after, statechoose);
        $location.path(path);
      }
  };

  $scope.uploadVideo = function() {
   $scope.file = {};
    $scope.widget = $(".cloudinary_fileupload")
      .unsigned_cloudinary_upload(cloudinary.config().upload_preset, {tags: 'myphotoalbum', context:'photo='}, {
        // Uncomment the following lines to enable client side image resizing and validation.
        // Make sure cloudinary/processing is included the js file
        //disableImageResize: false,
        //imageMaxWidth: 800,
        //imageMaxHeight: 600,
        //acceptFileTypes: /(\.|\/)(gif|jpe?g|png|bmp|ico)$/i,
        //maxFileSize: 20000000, // 20MB
        dropZone: ".update-project-video",
        start: function (e) {
          $scope.status = "Starting upload...";
          $scope.file = {};
          $scope.$apply();
        },
        fail: function (e, data) {
          $scope.status = "Upload failed";
          $scope.$apply();
        }
      })
      .on("cloudinaryprogress", function (e, data) {
        if (data.files[0].size > 100000000) {
          $scope.status = "File too large!";
          return ;
        }
        var name = data.files[0].name;
        var file = $scope.file[name] || {};
        file.progress = Math.round((data.loaded * 100.0) / data.total);
        file.status = "Uploading... " + file.progress + "%";
        $scope.file[name] = file;
        $scope.$apply();
        })
      .on("cloudinaryprogressall", function (e, data) {
        $scope.progress = Math.round((data.loaded * 100.0) / data.total);
        $scope.status = "Uploading... " + $scope.progress + "%";
        $scope.$apply();
      })
      .on("cloudinarydone", function (e, data) {
        $rootScope.photos = $rootScope.photos || [];
        data.result.context = {custom: {photo: $scope.title}};
        $scope.result = data.result;
        var name = data.files[0].name;
        var file = $scope.file[name] ||{};
        file.name = name;
        file.result = data.result;
        $scope.file[name] = file;
        $scope.$apply();
         /*** Display video when success ***/
        $scope.videoproject = true;
         Upload.dataUrl(data.files[0], true).then(function(url){
           data.url = url;
           $scope.config.sources = $scope.result.secure_url;
           $scope.status = null;
            $scope.progress = 0;
           $scope.itsOk = true;
         });
         $scope.project_video = data.result.secure_url;
         $scope.project_video_id = data.result.public_id;

      }).on("cloudinaryfail", function(e, data){
        if (data.files[0].size > 100000000) {
          $scope.status = "File too large!";
          $scope.progress = 0;
          return ;
        }
          var file = $scope.files[name] ||{};
          file.name = name;
          file.result = data.result;
          $scope.files[name] = file;

        });

  };


}]);
