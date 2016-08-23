'use strict';

angular.module('wittyApp')
	.controller('LearnCtrl',
		function($rootScope, $scope, $location, $http) {

			var currentUser = $rootScope.globals.currentUser || false;
		    if (!currentUser.moderator)
		       $location.path('/').replace();

		});