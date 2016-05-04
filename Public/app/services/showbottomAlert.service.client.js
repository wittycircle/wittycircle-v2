(function () {
	'use strict';

	angular
	.module('wittyApp')
	.factory('showbottomAlert', showbottomAlert);

	showbottomAlert.$inject = ['$http', '$rootScope', '$mdBottomSheet'];
	function showbottomAlert($http, $rootScope, $mdBottomSheet) {
		var service = {};

		service.pop_it              = pop_it;
		service.pop_it_involvment   = pop_it_involvment;
		service.pop_it_persistance  = pop_it_persistance;
		service.pop_share  			= pop_share;
		
		return service;


		function pop_it($event) {
			$mdBottomSheet.show({
				templateUrl: 'views/core/popover-login.view.client.html',
				controller: 'HeaderCtrl',
				clickOutsideToClose: true,
				disableParentScroll: false,
				targetEvent: $event
			});
		};

		function pop_it_involvment($scope) {
			$mdBottomSheet.show({
				templateUrl: 'views/involvment/popover-involvment.view.client.html',
				controller: 'InvolvmentSheetCtrl',
				clickOutsideToClose: true,
				disableParentScroll: true,
				scope: $scope
			});
		}

		function pop_it_persistance() {
			$mdBottomSheet.show({
				templateUrl: 'views/core/popover-login.view.client.html',
				controller: 'HeaderCtrl',
				clickOutsideToClose: false,
				disableParentScroll: false,
			});
		};

		function pop_share() {
			$mdBottomSheet.show({
				templateUrl: 'views/core/popover-share.view.client.html',
				controller: 'PopUpCtrl',
				clickOutsideToClose: true,
				disableParentScroll: false,
			});
		};

	};

})();
