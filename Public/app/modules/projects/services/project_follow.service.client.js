 (function () {
     'use strict';

     angular
         .module('wittyApp')
         .factory('Project_Follow', Project_Follow);

     Project_Follow.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
     function Project_Follow($http, $cookieStore, $rootScope, $resource, $q) {
         var service = {};

         service.checkFollowProject           = checkFollowProject;
         service.followProject                = followProject;
         service.getFollowedProject           = getFollowedProject;
         service.getFollowedProjectUnresolved = getFollowedProjectUnresolved;
         service.getProjectFollowers          = getProjectFollowers;


         return service;

         function checkFollowProject(project_id, callback) {
          $http.get('/follow/project/check/' + project_id).success(function (response) {
            callback(response);
          }).error(function (response) {
            callback(response);
          });
         }

         function followProject(project_id, index, callback) {
           $http.put('/follow/project/' + project_id, {index: index}).success(function (response) {
             callback(response);
           }).error(function (response) {
             callback(response);
           });
         };

         function getFollowedProject(username, callback) {
           $http.get('/follow/projects/'+ username).success(function (response) {
               callback(response);
           }).error(function (response) {
             callback(response);
           });
         };

         function getFollowedProjectUnresolved(username) {
           return $http.get('/follow/projects/'+ username);
         }

         function getProjectFollowers(project_id) {
            if (project_id) {
                return $http.get('/project_followers/' + project_id);
            } else {
                return null;
            }
          }

          function getProjectFollowersByPublicId(public_id) {
              if (public_id) {
                  return $http.get('/project_followers/public/' + public_id);
              } else {
                  return null;
              }
          }



     };

 })();
