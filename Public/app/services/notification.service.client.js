/**
 * @ngdoc factory
 * @name wittyApp.facory:Notification
 * @description
 * # Notification
 * Factory in the wittyApp.
 **/
(function () {
	'use strict';

	angular
		.module('wittyApp')
		.factory('Notification', Notification);

	Notification.$inject = ['$http', '$rootScope', 'Projects'];

	function Notification($http, $rootScope, Projects) {
		var service = {};

		service.getNotificationList 	= getNotificationList;
		return service;

		function getNumberOfRead(data, callback) {
			var read = data;
			for(var i = 0, count = 0; i < data.length; i++) {
				if (!data[i].n_read)
					count++;
			}
			callback(count);
		};

		function getNotificationList(callback) {
			$http.get('/notification').success(function(res) {
				if (res.success) {
					getNumberOfRead(res.data, function(number) {
						callback({data: res.data, number: number});
					});
				}
			});
		};
		
	};
})();

