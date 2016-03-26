'use strict';

var wittyProjectModule = angular.module('wittyProjectModule', []);

wittyProjectModule.config(function ($urlRouterProvider, $stateProvider, $httpProvider, $locationProvider) {
  $stateProvider
  .state('createproject', {
    url: '/create-project',
    templateUrl: 'views/projects/create/create_project.view.client.html',
    controller: 'CreateProjectCtrl',
    resolve:{
        auth: function($q, $rootScope, $stateParams) {
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
    templateUrl: 'views/projects/create/create_project_story.view.client.html'
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
    templateUrl: 'views/projects/view/view_project.view.client.html',
    controller: 'viewProjectCtrl',
    controllerAs: 'vm',
    resolve: {
        loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                 return $ocLazyLoad.load({files: [
                    'modules/projects/controllers/view2.js'
                ]});
        }],
        projectResolve: function(Projects, $stateParams) {
                return Projects.getProjectbyPublicId($stateParams.public_id);
        },
        project_followersResolve: function(Projects, Project_Follow, $stateParams) {
                return Project_Follow.getProjectFollowers($stateParams.public_id);
        },
        project_categoryResolve: function($q, $stateParams, Categories, Projects) {
                var defer = $q.defer();

                Projects.getProjectbyPublicId($stateParams.public_id).then(function(result) {
                    defer.resolve(Categories.getCategoryUnresolved(result.data[0].category_id));
                });
                return defer.promise;
        },
        project_creatorUserResolve: function($q, $stateParams, Users, Projects) {
                var defer = $q.defer();

                Projects.getProjectbyPublicId($stateParams.public_id).then(function(result) {
                    defer.resolve(Users.getUserbyIdUnresolved(result.data[0].creator_user_id));
                });
                return defer.promise;
        },
        initFeedbacksResolve: function($stateParams, Feedbacks) {
            return Feedbacks.getFeedbacksbyProjectPublicIdUnresolved($stateParams.public_id);
        }
    }
  })
  .state('viewproject.feedback', {
    url: '/feedback',
    templateUrl: 'views/projects/view/view_project_feedback.view.client.html'
  })
  .state('viewproject.openings', {
    url: '/openings',
    templateUrl: 'views/projects/view/view_project_needs.view.client.html'
  })
  .state('updateproject', {
    url: '/project/:public_id/update',
    templateUrl: 'views/projects/update/update_project.view.client.html',
    controller: 'UpdateProjectCtrl',
    resolve:{ auth: function($q, $stateParams, Projects, $http) {
                    return $http.get('http://127.0.0.1/project/'+ $stateParams.public_id + '/auth').then(function(response) {
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
    templateUrl: 'views/projects/update/update_project_basics.view.client.html'
  })
  .state('updateproject.story', {
    url: '/story',
    templateUrl: 'views/projects/update/update_project_story.view.client.html'
  })
  .state('updateproject.people', {
    url: '/people',
    templateUrl: 'views/projects/update/update_project_people.view.client.html'
  })
  .state('updateproject.needs', {
    url: '/needs',
    templateUrl: 'views/projects/update/update_project_needs.view.client.html'
  })
  .state('updateproject.community', {
    url: '/community',
    templateUrl: 'views/projects/update/update_project_community.view.client.html'
  })
  .state('myproject', {
    url: '/my-projects',
    templateUrl: 'views/projects/myproject/my_project.view.client.html',
    controller: 'MyProjectCtrl',
  })

})
