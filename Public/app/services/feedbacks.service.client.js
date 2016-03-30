/**
 * @ngdoc factory
 * @name wittyApp.facory:Feedbacks
 * @description
 * # Feedbacks
 * Factory in the wittyApp.
 */
 (function () {
     'use strict';

     angular
         .module('wittyApp')
         .factory('Feedbacks', Feedbacks);

     Feedbacks.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
     function Feedbacks($http, $cookieStore, $rootScope, $resource, $q) {
         var service = {};

         service.createFeedbacks = createFeedbacks;
         service.getFeedbacksbyProjectId = getFeedbacksbyProjectId;
         service.getFeedbacksbyProjectPublicId = getFeedbacksbyProjectPublicId;
         service.getFeedbacksbyProjectPublicIdUnresolved = getFeedbacksbyProjectPublicIdUnresolved;
         service.deleteFeedbacks = deleteFeedbacks;

         return service;


         function createFeedbacks(data, callback) {
           $http.post('http://127.0.0.1/feedbacks', data).success(function (response) {
             callback(response);
           });
         };

         function getFeedbacksbyProjectId(project_id, callback) {
           $http.get('http://127.0.0.1/project/'+ project_id +'/feedbacks').success(function (response) {
             callback(response);
           });
         };

         function getFeedbacksbyProjectPublicId(public_id, callback) {
           $http.get('http://127.0.0.1/project/'+ public_id +'/feedbacks/public').success(function (response) {
             callback(response);
           }).error(function (error_response) {
             callback(error_response);
           });
         };

         function getFeedbacksbyProjectPublicIdUnresolved(public_id) {
            if (public_id) {
                return $http.get('http://127.0.0.1/project/' + public_id + '/feedbacks/public');
            } else {
                return null;
            }
         }

         function deleteFeedbacks(feedbacks_id, callback) {
           $http.delete('http://127.0.0.1/feedback/'+ feedbacks_id).success(function (response) {
              callback(response);
           });
         };


     };

 })();
