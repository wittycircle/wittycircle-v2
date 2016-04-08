/**
 * @ngdoc service
 * @name wittyApp.get_CategoryName
 * @description
 * # get_CategoryName
 * Factory in the wittyApp.
 **/
(function () {
      	'use strict';

    angular
        .module('wittyApp')
       	.factory('get_CategoryName', get_CategoryName);

   	get_CategoryName.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
    function get_CategoryName($http, $cookieStore, $rootScope, $resource, $q) {
        var service = {};

        service.get_Name = get_Name;

        return service;

        function assignName(object, category_id) {
          for (var i = 0; i < object.length; i++) {
            if (object[i].id == category_id)
              return object[i].name;
          }
          return false;
        };

        function get_Name(category_id, callback) {
          var name = "";

          $http.get('/categories').success(function (response) {
            name = assignName(response, category_id);
            callback(name);
          }).error(function (error_response) {
            callback(error_response);
          })
        };

    };

})();
