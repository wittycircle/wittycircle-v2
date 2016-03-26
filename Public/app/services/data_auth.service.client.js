'use strict';

/**
 * @ngdoc service
 * @name wittyApp.data_auth
 * @description
 * # data_auth
 * Factory in the wittyApp.
 */
angular.module('wittyApp').factory('Data_auth', [
  function () {
    // Service logic
    // ...
      var formData = [];

      var addData = function(newObj) {
      	formData.push(newObj);
      };

      var getData = function() {
      	return formData;
      }

      return {
      	addData: addData,
      	getData: getData
      };

    }
  ]);