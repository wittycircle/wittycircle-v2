(function () {

    'use strict';

    angular.module('wittyProjectModule').config(function ($urlRouterProvider, $stateProvider, $httpProvider, $locationProvider) {
      $stateProvider
      .state('createproject', {
        url: '/create-project',
        templateUrl: 'views/projects/create/create_project.view.client.html',
        controller: 'CreateProjectCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'controllers/projects/create_project.controller.client.js',
                    'controllers/projects/modal/add-user-project.controller.client.js',
                    'controllers/projects/modal/add-needs.controller.client.js',
                    'controllers/projects/modal/add-question-project.controller.client.js',
                    'controllers/projects/modal/upload-poster.controller.client.js',
                    'scripts/draggable_background.js',
                    'scripts/redactor/redactor.js',
                ]);
            }],
            auth: function ($q, $rootScope, $stateParams) {
              if ($rootScope.globals.currentUser) {
                return true;
              } else {
                return $q.reject('not authorized');
              }
            }
        }
      })
      .state('createproject.basics', {
        url: '/basics',
        templateUrl: 'views/projects/create/create_project_basics.view.client.html'
      })
      .state('createproject.story', {
        url: '/story',
        templateUrl: 'views/projects/create/create_project_story.view.client.html',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'https://vjs.zencdn.net/5.10.8/video.js',
                    ]);
              }]
        }
      })
      .state('createproject.people', {
        url: '/people',
        templateUrl: 'views/projects/create/create_project_people.view.client.html'
      })
      .state('createproject.needs', {
        url: '/needs',
        templateUrl: "views/projects/create/create_project_needs.view.client.html"
      })
      .state('createproject.community', {
        url: '/community',
        templateUrl: 'views/projects/create/create_project_community.view.client.html'
      })
      .state('viewproject', {
        url: '/project/:public_id/:title',
        templateUrl: 'modules/projects/views/view_project.view.client.html',
        controller: 'viewProjectCtrl',
        controllerAs: 'vm',
        resolve: {
            // project_doExist: function ($q, $stateParams, Projects, $state) {
            //         var defer = $q.defer();
            //
            //         Projects.getProjectbyPublicId($stateParams.public_id, function (result) {
            //             if (result.data && result.data[0]) {
            //                 defer.resolve();
            //             } if (!result.data) {
            //                 return $state.go('notfound');
            //                 defer.reject();
            //             }
            //             return defer.promise;
            //         });
            // },
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'modules/projects/controllers/view-project.controller.client.js',
                     ]);
            }],
            projectResolve: function (Projects, $stateParams) {
                    return Projects.getProjectbyPublicIdUnresolved($stateParams.public_id);
            },
            project_followersResolve: function(Projects, Project_Follow, $stateParams) {
                    return Project_Follow.getProjectFollowers($stateParams.public_id);
            },
            project_categoryResolve: function ($q, $stateParams, Categories, Projects) {
                    var defer = $q.defer();

                    Projects.getProjectbyPublicIdUnresolved($stateParams.public_id).then(function (result) {
                        defer.resolve(Categories.getCategoryUnresolved(result.data[0].category_id));
                    });
                    return defer.promise;
            },
            project_creatorUserResolve: function ($q, $stateParams, Users, Projects) {
                    var defer = $q.defer();

                    Projects.getProjectbyPublicIdUnresolved($stateParams.public_id).then(function(result) {
                        defer.resolve(Users.getUserbyIdUnresolved(result.data[0].creator_user_id));
                    });
                    return defer.promise;
            },
            project_InvolvmentResolve: function ($stateParams, Project_Involvment) {
              return Project_Involvment.getAllUsersInvolvedByPublicId($stateParams.public_id);
            },
            project_NeedsResolve: function ($stateParams, Needs) {
                return Needs.getNeedsByProjectPublicIdUnresolved($stateParams.public_id);
            }

        }
      })
      .state('viewproject.feedback', {
        url: '/feedback',
        templateUrl: 'modules/projects/views/view_project_feedback.view.client.html'
      })
      .state('viewproject.openings', {
        url: '/openings',
        templateUrl: 'modules/projects/views/view_project_needs.view.client.html'
      })
      .state('updateproject', {
        url: '/project/:public_id/update',
        templateUrl: 'modules/projects/views/update/update_project.view.client.html',
        controller: 'UpdateProjectCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'modules/projects/controllers/update_project.controller.client.js',
                         'controllers/projects/modal/add-user-project.controller.client.js',
                         'controllers/projects/modal/add-needs.controller.client.js',
                         'controllers/projects/modal/add-question-project.controller.client.js',
                         'controllers/projects/modal/upload-poster.controller.client.js',
                         'scripts/draggable_background.js',
                         'controllers/projects/modal/delete-project.controller.client.js',
                         'scripts/redactor/redactor.js',
                     ]);
            }],
            auth: function($q, $stateParams, Projects, $http) {
                        return $http.get('/project/'+ $stateParams.public_id + '/auth').then(function(response) {
                          if (response.data.message === 'success') {
                            return true;
                          } if (response.data.message === 'not found') {
                            return $q.reject('not authorized');
                          }
                        });
                      }
                }
      })
      .state('updateproject.basics', {
        url: '/basics',
        templateUrl: 'modules/projects/views/update/update_project_basics.view.client.html'
      })
      .state('updateproject.story', {
        url: '/story',
        templateUrl: 'modules/projects/views/update/update_project_story.view.client.html',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    'https://vjs.zencdn.net/5.10.8/video.js',
                ])
              }]
        }
      })
      .state('updateproject.people', {
        url: '/people',
        templateUrl: 'modules/projects/views/update/update_project_people.view.client.html'
      })
      .state('updateproject.needs', {
        url: '/needs',
        templateUrl: 'modules/projects/views/update/update_project_needs.view.client.html'
      })
      .state('updateproject.community', {
        url: '/community',
        templateUrl: 'modules/projects/views/update/update_project_community.view.client.html'
      })
      .state('myproject', {
        url: '/my-projects',
        templateUrl: 'modules/projects/views/my_project.view.client.html',
        controller: 'MyProjectCtrl',
        controllerAs: 'vm',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'modules/projects/controllers/my-project.controller.client.js',
                         // css
                     ]);
            }],
          }
      })
    })

})();
