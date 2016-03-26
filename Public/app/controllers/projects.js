'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the wittyApp
 */
angular.module('wittyApp').controller('ProjectsCtrl',
	function ($scope, Projects, $rootScope, $location) {

	$rootScope.Utils = {
    	keys : Object.keys
  	};

	var projects = Projects.query();
	$scope.projects = projects;
	//My content goes here


	 $scope.create = function () {
      // Create new Project object
      var project = new Projects({
      	category_id: this.category_id,
        title: this.title,
        description: this.description,
        location_city: this.location_city,
        location_state: this.location_state,
        location_country: this.location_country,
        picture: this.picture,
       	post: this.post
      });

      // Redirect after save
      project.$save(function () {
        $location.path('projects/');

      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

  
  });
