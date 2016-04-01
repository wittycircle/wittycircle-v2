
console.log("You're looking under the ground, find a bug ? Help us to improve our platform at hello@wittycircle.com");

var wittyCircleApp = angular
  .module('wittyApp', [
    // Assets Modules
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.bootstrap',
    'ui.router',
    'ngMaterial',
    'ngMap',
    'ngFileUpload',
    'angular-toArrayFilter',
    'algoliasearch',
    'door3.css',
    'angularMoment',
    'com.2fdevs.videogular',
	  'com.2fdevs.videogular.plugins.controls',
	  'com.2fdevs.videogular.plugins.overlayplay',
    'com.2fdevs.videogular.plugins.poster',
    'cloudinary',
    'angular-redactor',
    'oc.lazyLoad',
    // Custom modules
    'wittyProjectModule'
])
  .config(function ($urlRouterProvider, $stateProvider, $httpProvider, $locationProvider, redactorOptions) {
    $stateProvider
      .state('main', {
        url: '/',
        params      : { tagStart: '',},
        templateUrl : 'views/main.html',
        controller  : 'MainCtrl',
        controllerAs: 'main',
      })
      .state('discover', {
        url         : '/discover',
        params      : { tagParams: '',},
        templateUrl : 'views/presentation/discover.view.client.html',
        controller  : 'DiscoverCtrl',
        // css: '../styles/presentation.css'
      })
      .state('meet', {
        url         : '/meet',
        params      : { skillParams: '' },
        templateUrl : 'views/presentation/meet.view.client.html',
        controller  : 'MeetCtrl',
        // css: '../styles/presentation.css'
      })
      .state('login', {
        url         : '/login',
        templateUrl : 'views/auth/login.html',
        controller  : 'LoginCtrl',
        controllerAs: 'login'
      })
      .state('signup', {
        url         : '/signup',
        params      : { tagCheckFirst: false},
        templateUrl : 'views/auth/signup.html',
        controller  : 'SignupCtrl'
      })/*
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
        controller: 'ViewProjectCtrl',
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
      })*/
      .state('setting', {
        url: '/setting',
        templateUrl: 'views/setting/setting.view.client.html',
        controller: 'SettingCtrl',
        // css: '../styles/setting.css',
        resolve:{
            auth: function($q, $rootScope, $stateParams) {
              if ($rootScope.globals.currentUser.username) {
                return true;
              } else {
                return $q.reject('not authorized');
              }
            }
        }
      })
      .state('messages', {
        url: '/messages',
        params: {profile_id: null, input: null, userOn: null},
        templateUrl: 'views/messaging/messaging.view.client.html',
        controller: 'MessageCtrl',
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
      .state('terms', {
        url: '/terms',
        templateUrl: 'views/core/terms.view.client.html',
        controller: 'TermsCtrl'
      })
      .state('privacy', {
        url: '/privacy',
        templateUrl: 'views/core/privacy.view.client.html',
        controller: 'PrivacyCtrl'
      })
      .state('profile', {
        url: '/:username',
        templateUrl: 'views/profile/profile.view.client.html',
        controller: 'ProfileCtrl',
        // css: '../styles/profiles.css',
        resolve:{
            auth: function($q, $rootScope, $stateParams, $location, $state, Profile) {
              Profile.getUserbyUsername($stateParams.username).then(function(res) {
                if (res) {
                  return true;
                } else {
                    if (!res && ($stateParams.username === "setting") && $rootScope.globals.currentUser.username) {
                    $state.go('setting');
                  } if (!res && $stateParams.username === "discover") {
                    $state.go('discover');
                  } if (!res && $stateParams.username === "meet") {
                    $state.go('meet');
                  }// if (!res && $stateParams.username === "work") {
                  //   $state.go('work');}
                    if (!res && $stateParams.username === "messages") {
                    $state.go('messages');
                  } if (!res && $stateParams.username === "my-projects") {
                    $state.go('my-projects');
                  }
                }
              });
            }
        }
      })
      .state("otherwise", { redirectTo : '/'})
      ;

      $httpProvider.defaults.withCredentials = true;

      $urlRouterProvider.otherwise('/');

      // **Redactor configuration

      redactorOptions.imageUpload = 'http://127.0.0.1/upload/redactor';
      redactorOptions.buttonSource = true;
      redactorOptions.imageResizable = true;
      redactorOptions.imageEditable = true;
      redactorOptions.imageLink = true;
      redactorOptions.visual = true;// false for html mode

      redactorOptions.buttons = ['format', 'bold', 'italic', 'deleted', 'lists', 'image', 'video', 'file', 'link', 'horizontalrule'];
      redactorOptions.plugins = ['imagemanager'];
      /*
      **End Redactor configuration
      */


      //** Enabling Hmtl5 (pretty urls (removeing the hasbangs))
      //$locationProvider.html5Mode(true);

  })
  .run(function ($rootScope, $cookieStore, $location) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        /*if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }*/

        $rootScope.resizePic = function(url, width, height, crop) {
          if (url && url.indexOf('cloudinary') >= 0) {
            var tab, i, parameter, url_ret;
            crop = crop || 'fill';
            width ? width = "w_" + width + "," : "";
            height ? height = "h_" + height + "," : "";

            tab = url.split('/');
            i = $.inArray('upload', tab);
            parameter = width + height + "c_" + crop;
            tab.splice(i + 1, 0, parameter);
            url_ret = tab.join('/');

            return url_ret;
          } else
            return url;
        };

        $cookieStore.put('resizePic', $rootScope.resizePic);
        // Check state authorization then redirect to the main page if rejection is called.
        $rootScope.$on('$stateChangeError', function(evt, current, previous, rejection) {
          if (rejection == 'not authorized') {
            location.path('/');
          }
        });

  });
