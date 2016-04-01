/**
 * @ngdoc factory
 * @name wittyApp.facory:Picture
 * @description
 * # Picture
 * Factory in the wittyApp.
 **/
(function () {
	'use strict';

	angular
		.module('wittyApp')
		.factory('Picture', Picture);

	Picture.$inject = ['$http', '$rootScope', 'Projects'];

	function Picture($http, $rootScope, Projects) {
		var service = {};

		service.resizePicture = resizePicture;

		return service;

	    function resizePicture(url, width, height, crop) {
	        var tab, i, parameter, url_ret;
	        
	        tab = url.split('/');
			i = $.inArray('upload', tab);
			parameter = "w_" + width + "," + "h_" + height + "," + "c_" + crop;
			tab.splice(i + 1, 0, parameter);
			url_ret = tab.join('/');
			return url_ret
	    }
	    console.log("OK");

	};
})();
