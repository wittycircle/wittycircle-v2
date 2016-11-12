'use strict';

angular.module('wittyProjectModule').controller('UpdateProjectCtrl', ['$rootScope', '$scope', 'Categories', 'Feedbacks', '$http', 'Users', '$state', '$stateParams', 'Beauty_encode', 'Projects', 'Locations', '$sce', '$timeout', 'Project_Follow', '$location', 'Data_project', '$modal', 'Upload', 'cloudinary', 'Upload', 'redactorOptions', 'RetrieveData',
function ($rootScope, $scope, Categories, Feedbacks, $http, Users, $state, $stateParams, Beauty_encode, Projects, Locations, $sce, $timeout, Project_Follow, $location, Data_project, $modal, $upload, cloudinary, Upload, redactorOptions, RetrieveData) {

    $scope.currentUser = $rootScope.globals.currentUser;
    $scope.project_category = {};
    $scope.places_after = {};
    $scope.isSaved = false;
    $scope.isSavedText = "Save";
    $scope.noOpenings = false;
    $scope.state_choose = {};
    Categories.getCategories(function (response) {
        $scope.categories = response;
    });
    $scope.elementPost = {};
    $scope.networkName = "The Refiners, 500 Startups, Y Combinator, Techstars...";
    $scope.config = {};


    //$('#viewProject-header').backgroundDraggable();
    var projectId = $stateParams.public_id;

    function capitalizeFirstLetter(string) {
        if (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        } else {
            return;
        }
    };

    $scope.encodeUrl = function(url) {
        url = Beauty_encode.encodeUrl(url);
        return url;
    };

    function getDescription(name) {
        var description = ["The main informations about your project","Tell us what you have in mind",
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
    };

    var sname = $state.current.name.split('.');
    $scope.state = capitalizeFirstLetter(sname[1]);
    $scope.state_description = getDescription(sname[1]);

    $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams){
        var sname = toState.name.split('.');
        $scope.state = capitalizeFirstLetter(sname[1]);
        $scope.state_description = getDescription(sname[1]);
    }
);

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
            response.profile.n_read = data[key].n_read;
            response.profile.n_accept = data[key].n_accept;
            users.push(response.profile);
        });
    });
    return users;
}

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

/*
** INITIATE PROJECT WITH FECTHING DATA
*/
$scope.initiateProject = function () {
    $scope.categories = Categories.getCategories(function (response) {
        $scope.categories = response;
    });
    $scope.project = Projects.getProjectbyPublicId(projectId, function (response) {
        $scope.project = response[0];
        if (!$scope.project.post) {
            $scope.project.post = "<p><em style='color: #999999'>Note: images, gifs&nbsp;and videos can be &nbsp;directly&nbsp;embedded by copy pasting urls below.</em></p>" + "<p><br /></p><p>Here are a a helpful&nbsp;guideline&nbsp;so that people can fully understand what you have in mind:</p><br><h1>What?</h1><ul><li>What is&nbsp;your product&nbsp;/&nbsp;idea&nbsp;/&nbsp;service&nbsp;/&nbsp;project / initiative?</li><li>How does it work?</li><li>What does it do?</li></ul><p><br /></p><h1>Why?</h1><ul><li>Why are you working on it?</li><li>Why does it matter to you?</li><li>If you are trying to solve a problem, &nbsp;what is it?</li></ul><p><br /></p><h1>When?</h1><ul><li>What stage are you in?</li><li>When did you start working on it?</li><li>What are your next steps</li></ul><p><strong></strong><br></p>";
        };
        if ($scope.project.network) {
            $scope.networkName = $scope.project.network;
            $scope.chooseNetwork = true;
        }
        if ($scope.project.project_visibility == 1) {
            $scope.project.project_visibility = true;
        }
        $scope.select_state = $scope.project.status;
        $scope.places = Locations.getplaces($scope.project);
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
        $http.get('/openings/project/' + response[0].public_id).then(function(response) {
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
    //console.log(cat);
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
        //var test = angular.element('#viewProject-header').css('background-image');
        //console.log(test);
        $('#viewProject-header').backgroundDraggable();

    }, 1000);
};

$scope.savePosition = function(public_id, title, data, project_category, places_after, statechoose) {
    $scope.dragcv = true;
    $scope.cursorpt = false;
    var pos = angular.element('#viewProject-header').css('background-position')
    $scope.imagecoverposition = pos;
    $scope.finish(public_id, title, data, project_category, places_after, statechoose);
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
        data.video_id = $scope.project_video_id;
        data.project_id = $scope.project.id;
        $scope.config.sources = false;
        $http.post('/upload/delete/videos', data).success(function(response) {
            if (response.result == "ok") {
                $scope.project.main_video = "";
                $scope.project_video = [];
                $scope.project_video_id = [];
                $scope.videoproject = false;
            }
        }).error(function(error_message) {
            console.log(error_message);
        });
    }
};

$scope.savebasics = function(data, project_category, places_after, statechoose) {
    data.picture_position = $scope.imagecoverposition;
    if ($scope.project_video && $scope.project_video !== null && typeof $scope.project_video != 'undefined') {
        data.main_video = $scope.project_video;
        data.main_video_id = $scope.project_video_id;
    } if (!$scope.project_video && !$scope.project.main_video) {
        delete data.main_video;
    }
    if ($scope.post) {
        data.post = $scope.post;
    } else {
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
    data.picture = $scope.imagecover;
    if ($scope.picture_card) {
        data.picture_card = $scope.picture_card;
    }
    data.category_id = project_category.id;
    if (statechoose != undefined) {
        data.status = statechoose;
    }
    if ($scope.chooseNetwork) {
        data.network = $scope.networkName;
    } else
        data.network = null;

    Locations.setplaces(places_after, data);
    Projects.updateProject(data.id, data, function(response) {
        //$state.go('updateproject.story');
    });
};

$scope.deleteProject = function() {
    $scope.modalInstance = $modal.open({
        animation: true,
        templateUrl: 'views/projects/create/modal/delete_project.client.html',
        controller: 'DeleteProjectCtrl',
        //windowClass: 'adduser-modal',
        scope: $scope
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
        if (data[key] && data[key].id === user_id && data[key].id != undefined) {
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
    $http.delete('/opening/' + opening_id).success(function(response) {
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

$scope.goToMessage = function(id) {
    if (id !== $rootScope.globals.currentUser.id) {
        Users.getProfileByUserId(id, function(res) {
            $state.go('messages', {profile_id : res.content.profile_id});
        });
    }
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
        if (response.success) {
            for (var i = 0; i < $scope.questions.length; i++) {
                if ($scope.questions[i].id == feedbacks_id) {
                    $scope.questions.splice(i, 1);
                    break ;
                }
            }
        }
    });
};

$scope.finish = function(public_id, title, data, project_category, places_after, statechoose) {
    var path = '/project/' + public_id + '/' + $scope.encodeUrl(title);
    $scope.savebasics(data, project_category, places_after, statechoose);
    $scope.isSaved = true;
    $scope.isSavedText = "Saved";
    $timeout(function () {
        $scope.isSaved = false;
        $scope.isSavedText = "Save";
    }, 2000);
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
            //console.log(document.getElementById("file").value);
            $scope.status = "Starting upload...";
            $scope.file = {};
            $scope.$apply();
        },
        fail: function (e, data) {
	    //console.log(e);
	    //console.log(data);
            $scope.status = "Upload failed";
            $scope.$apply();
        }
    })
    .on("cloudinaryprogress", function (e, data) {
	    //console.log(e);
            //console.log(data);
        if (data.files[0].size > 500000000) {
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
            $scope.config.sources = $scope.result.secure_url;
            $scope.status = null;
            $scope.progress = 0;
            data.url = url;
            $scope.itsOk = true;
        });
        $scope.project_video = data.result.secure_url;
        $scope.project_video_id = data.result.public_id;
        $scope.status = [];

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

    // **Redactor configuration
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

};


}])
.directive('updateBasicProject', function() {
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
                    scope.places_after.obj = model.$viewValue;
                });
            });

            scope.$watch('displayUpdateProject', function(value) {
                if (value) {
                    var checkCountry = value.indexOf('United States');
                    if (checkCountry >= 0) {
                        scope.displayUpdateProject = value.slice(0, checkCountry - 2);
                        var x = scope.displayUpdateProject.length;
                    }
                }
            });
        }
    }
});
