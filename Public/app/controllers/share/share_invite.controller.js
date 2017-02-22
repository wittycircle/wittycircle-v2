'use strict';

angular.module('wittyApp').controller('ShareInviteCtrl', function (access, $scope) {
	$scope.info = access.data.info;
});
