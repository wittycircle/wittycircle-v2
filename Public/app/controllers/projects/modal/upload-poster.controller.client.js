'use strict';

angular.module('wittyApp').controller('UploadPosterCtrl', function ($scope, $rootScope, $state, $http, $modalInstance, Projects, $timeout, Upload) {

  $scope.up = false;
  $scope.poster = false;

  $scope.dismiss = function () {
    $modalInstance.dismiss();
  };

  $scope.uploadFiles = function(file) {
    var data = {};
    $scope.up = true;
    Upload.dataUrl(file, true).then(function(url){
        data.url = url;
        $http.post('/upload/project/cover', data).success(function(resp) {
            $timeout(function() {
                $scope.up = false;
            }, 100);
            $scope.poster = resp.secure_url;
	    $scope.project.video_poster = resp.secure_url;
        }).error(function(response) {
            console.log(response);
        });
    });
  };

  $scope.saveChange = function() {
      if ($scope.poster) {
	  var data = {};
	  data.poster = $scope.poster;
	  $http.post('/project/video/poster/' + $scope.project.public_id, data).success(function (res) {
	      $scope.config.plugins.poster = $scope.poster;
	        $timeout(function() {
		$scope.dismiss();
            }, 500);
	  });
      }
  }

});
