/**
 * @ngdoc service
 * @name wittyApp.io
 * @description
 * # io
 * Factory in the wittyApp.
 **/
(function () {
   	'use strict';

    angular
        .module('wittyApp')
        .factory('io', io);

		io.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];

		function io($http, $cookieStore, $rootScope, $resource, $q) {
		    var service = {};

		    service.getUserOnline = getUserOnline;
		    service.sendUserOnline = sendUserOnline;

		    return service;

		    var usersOnline;
		    function getUserOnline(users) {
		    	usersOnline = users;
		    };

		    function sendUserOnline() {
		    	return usersOnline;
		    };
		};
})();
