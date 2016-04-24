 (function () {
     'use strict';

     angular
         .module('wittyProjectModule')
         .factory('Projects', Projects);

     Projects.$inject = ['$http', '$cookieStore', '$rootScope', '$resource', '$q'];
     function Projects ($http, $cookieStore, $rootScope, $resource, $q) {
         var service = {};

         service.getProject = getProject;
         service.createProject = createProject;
         service.getProjectbyId = getProjectbyId;
         service.updateProject = updateProject;
         service.getUserProject = getUserProject;
         service.getUserProjectUnresolved = getUserProjectUnresolved;
         service.incrementViewProject = incrementViewProject;
         service.getProjectbyPublicId = getProjectbyPublicId;
         service.getProjectbyPublicIdUnresolved = getProjectbyPublicIdUnresolved;
         service.deleteProject = deleteProject;
         service.getProjectsInvolvedByUser = getProjectsInvolvedByUser;
         service.checkAuth = checkAuth;

         return service;


         function getProject(callback) {
          $http.get('/projects').success(function (response) {
            callback(response);
          });
         };

         function createProject(data, callback) {
           $http.post('/projects', data).success(function (response) {
             callback(response);
           });
         };

         function getProjectbyId(id, callback) {
           $http.get('/project/' + id).success(function (response) {
             callback(response);
           });
         };

         function getProjectbyPublicId(public_id, callback) {
           $http.get('/project/public_id/' + public_id).success(function (response) {
             callback(response);
           }).error(function (response_error) {
             callback(response_error);
           });
       };

        function getProjectbyPublicIdUnresolved (public_id) {
            if (public_id) {
                return $http.get('/project/public_id/' + public_id);
            } else {
                return null;
            }
        }

         function updateProject(project_id, data, callback) {
           $http.put('/project/' + project_id, data).success(function (response) {
             callback(response);
           });
         };

         function getUserProject(user_id, callback) {
           $http.get('/projects/user/'+ user_id).success(function (response) {
             callback(response);
           }).error(function (response) {
             callback(response);
           });
         };

         function getUserProjectUnresolved (user_id) {
          if (user_id) {
            return $http.get('/projects/user/' + user_id);
          } else {
            return null;
          }
         }

         function incrementViewProject(project_id, callback) {
           $http.put('/project/increment/'+ project_id).success(function (response) {
             callback(response);
           }).error(function (response) {
             callback(error);
           })
         };

         function deleteProject(project_id, callback) {
           $http.delete('/project/'+ project_id).success(function (response) {
             callback(response);
           }).error(function (error_message) {
             callback(error_message);
           });
         };

         function getProjectsInvolvedByUser(user_id, callback) {
           $http.get('/projects/user/'+ user_id + '/involved').success(function(response) {
             callback(response);
           }).error(function(error_message) {
             callback(error_message);
           });
         };

         function checkAuth(public_id, callback) {
           $http.get('/project/'+ public_id + '/auth').success(function(response) {
             console.log(response.message);
              callback(response.message);
           });
         };

     };

 })();
