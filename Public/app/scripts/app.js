
console.log("You're looking under the ground, find a bug ? Help us to improve our platform at hello@wittycircle.com");

var wittyCircleApp = angular
  .module('wittyApp', [
      // Assets Modules
      'ngAria',
      'ngCookies',
      'ngResource',
      'ngRoute',
      'ngSanitize',
      'ui.router',
      'ui.bootstrap',
      'ngMaterial',
      'ngFileUpload',
      'angular-toArrayFilter',
      'algoliasearch',
      'angularMoment',
      'com.2fdevs.videogular',
      'com.2fdevs.videogular.plugins.controls',
      'com.2fdevs.videogular.plugins.overlayplay',
      'com.2fdevs.videogular.plugins.poster',
      'cloudinary',
      'angular-redactor',
      'oc.lazyLoad',
      '720kb.socialshare',
      // Custom modules
      'wittyProjectModule',
      'wittyValidateAccountModule'
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
        controllerAs: 'discover',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'controllers/presentation/discover.controller.client.js',
                     ]);
            }],
        }
    })
    .state('meet', {
        url         : '/meet',
        params      : { skillParams: '' },
        templateUrl : 'views/presentation/meet.view.client.html',
        controller  : 'MeetCtrl',
        controllerAs: 'meet',
        resolve : {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'controllers/presentation/meet.controller.client.js',
                     ]);
            }],
            cardProfilesResolve: function (Users) {
                return Users.getCardProfilesUnresolved();
            },
            getSkillsResolve: function ($http) {
                return $http.get('/skills');
            }
        }
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
    })
    .state('password_reset', {
        url: '/password/reset/:token',
        templateUrl: 'views/core/reset-password.view.client.html',
        controller: 'ResetPasswordCtrl',
        resolve: {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'controllers/core/reset-password.controller.client.js',
                     ]);
            }],
            access: function($q, $rootScope, Authentication, $stateParams) {
                return Authentication.ResetPasswordTokenValidation($stateParams.token);
            }
        }
    })
    .state('setting', {
        url: '/setting',
        templateUrl: 'views/setting/setting.view.client.html',
        controller: 'SettingCtrl',
        resolve : {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'controllers/setting/setting.controller.client.js',
                         // css
                         'styles/css/setting.css',
                     ]);
            }],
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
        params: {profile: null, user_id: null, username: null, input: null, userOn: null},
        templateUrl: 'views/messaging/messaging.view.client.html',
        controller: 'MessageCtrl',
        resolve : {
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         // css
                         'styles/css/messaging.css'
                     ]);
            }],
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
      })
      .state('privacy', {
        url: '/privacy',
        templateUrl: 'views/core/privacy.view.client.html',
      })
	.state('noaccess1', {
	    url: '/projects',
	    resolve: {
		security: function ($q, $state) {
		    var deferred = $q.defer();
		    //return $q.reject("Not Authorized");
		    $state.go('main');
		    deferred.reject();
		    return deferred.promise;
		}
	    }
	})
      .state('profile', {
        url: '/:username',
        templateUrl: 'views/profile/profile.view.client.html',
        controller: 'ProfileCtrl',
        controllerAs: 'profileVm',
        // css: '../styles/profiles.css',
        resolve:{
            loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                     return $ocLazyLoad.load([
                         'controllers/profile/profile.controller.client.js',
                         'controllers/profile/modal-controller/about-modal.controller.client.js',
                         'controllers/profile/modal-controller/add-experiences-modal.controller.client.js',
                         'controllers/profile/modal-controller/edit-experiences-modal.controller.client.js',
                         'controllers/profile/modal-controller/skills-modal.controller.client.js',
                         'controllers/profile/modal-controller/interest-modal.controller.client.js',
			 //css
			 'styles/css/profiles.css',
			 'styles/css/profiles-modal-edit.css',
			 'styles/css/home.css'
                     ]);
            }],
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

        $httpProvider.defaults.withCredentials = true;

        $urlRouterProvider.otherwise('/');

        // **Redactor configuration

        redactorOptions.imageUpload = '/upload/redactor';
        redactorOptions.buttonSource = true;
        redactorOptions.imageResizable = true;
        redactorOptions.imageEditable = true;
        redactorOptions.imageLink = true;
        redactorOptions.visual = true;// false for html mode

        redactorOptions.buttons = ['format', 'bold', 'italic', 'deleted', 'lists', 'image', 'video', 'file', 'link', 'horizontalrule'];
        redactorOptions.plugins = ['imagemanager'];
		redactorOptions.formatting = ['p', 'blockquote', 'pre', 'h1'];
        /*
        **End Redactor configuration
        */

        //** Enabling Hmtl5 (pretty urls (removeing the hasbangs))
        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

    })
    .run(function ($rootScope, $cookieStore, $location, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};

	$http.defaults.headers.common['access_token'] = 'oTJaUTHa6FFTSSLrzQOb';


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
    $rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error){

        if(error === "Not Authorized"){
            $state.go(main);
        }
    });

});
