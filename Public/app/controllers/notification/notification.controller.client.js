'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:NotifCtrl
 * @description
 * # NotifCtrl
 * Controller of the wittyApp
 **/
angular.module('wittyApp').controller('NotifCtrl', function($http, $interval, $timeout, $location, $scope, Authentication, io, $cookies, $rootScope, $modal, $state, Users) {
	
	var url = "/";

	$scope.getNotifList = function () {
		$http.get(url + "view").success(function(res){
			if (res.success) {
				$scope.viewLists = res.data;
				console.log($scope.viewLists);
			}
		});
	};

	socket.on('view-notification', function(data){
	});
});