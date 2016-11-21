
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
	'cloudinary',
	'angular-redactor',
	'720kb.socialshare',
	// Custom modules
        'oc.lazyLoad',
	'wittyProjectModule',
	'wittyValidateAccountModule',
        'angularCSS'
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
	.state('login', {
		url: '/login',
		templateUrl : 'modules/login/views/login.view.client.html',
		css: 'styles/css/headlog.css'
	})
	.state('register', {
		url: '/register',
		templateUrl : 'modules/signup/views/signup.view.client.html',
		controller : 'Signup_modalCtrl',
		css: 'styles/css/headlog.css'
	})
	.state('discover', {
		url         : '/discover?pstatus&category&help&skills&loc',
		params      : { tagParams: '',},
		templateUrl : 'views/presentation/discover.view.client.html',
		controller  : 'DiscoverCtrl',
		controllerAs: 'discover',
	})
	.state('meet', {
		url         : '/meet?skills&help&loc',
		params      : { skillParams: '' },
		templateUrl : 'views/presentation/meet.view.client.html',
		controller  : 'MeetCtrl',
		controllerAs: 'meet',
	})
	.state('learn', {
		url 		: '/learn',
		params 		: { tag: '', article_id: '' },
		templateUrl : 'views/presentation/learn.view.client.html',
		controller  : 'LearnCtrl',
	})
	.state('learn.new', {
		url 		: '/new',
		templateUrl : 'views/presentation/learn.add.article.client.html'
	})
	.state('learn_article', {
		url 		: '/learn/article/id/:article_id/:article_title',
		templateUrl : 'views/presentation/learn.view.article.client.html',
		controller 	: 'LearnArticleCtrl'
	})
	.state('signup', {
	    url         : '/signup',
	    params      : { tagCheckFirst: false},
	    templateUrl : 'views/auth/signup.html',
	    controller  : 'SignupCtrl',
	})
	.state('welcomeuc', {
		url 		: '/welcome/:uc',
		templateUrl : 'views/welcome/uc.view.client.html',
		controller 	: 'welcomeUcCtrl'
	})
	.state('password_reset', {
		url: '/password/reset/:token',
		templateUrl: 'views/core/reset-password.view.client.html',
		controller: 'ResetPasswordCtrl',
		resolve: {
			access: function($q, $rootScope, Authentication, $stateParams) {
				return Authentication.ResetPasswordTokenValidation($stateParams.token);
			}
		}
	})
	.state('validate_network', {
		url: '/validation/network/:token',
		templateUrl: 'views/core/validate-network.view.client.html',
		controller: 'ValidateNetworkCtrl',
		resolve: {
			access: function($http, $stateParams) {
				return $http.get('/api/verify/network/project/' + $stateParams.token);
			}
		}
	})
	.state('setting', {
		url: '/setting',
		templateUrl: 'views/setting/setting.view.client.html',
		controller: 'SettingCtrl',
		// resolve : {
		// 	auth: function($q, $rootScope, $stateParams) {
		// 		if ($rootScope.globals.currentUser.username) {
		// 			return true;
		// 		} else {
		// 			return $q.reject('not authorized');
		// 		}
		// 	}
		// }
	})
	.state('statistics', {
		url 		: '/statistics',
		params      : { firstVisit: false},
		templateUrl : 'views/rank/rank.statistic.view.client.html',
		controller 	: 'RankCtrl'
	})
	.state('messages', {
		url: '/messages',
		params: {profile: null, user_id: null, username: null, input: null, userOn: null},
		templateUrl: 'views/messaging/messaging.view.client.html',
		controller: 'MessageCtrl',
		resolve : {
            // loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            //     return $ocLazyLoad.load([
            //         'scripts/redactor/redactor.js',
            //     ]);
            // }],
		    auth: function($q, $rootScope, $stateParams) {
				if ($rootScope.globals.currentUser) {
				    return true;
				} else {
				    return $q.reject('not authorized');
				}
		    }
		}
	})
	.state('admin-panel', {
		url: '/admin/panel',
		templateUrl: 'views/backoffice/mailpanel.view.client.html',
		controller: 'BackOfficeCtrl',
		resolve : {
			access: function(Authentication) {
			    return Authentication.checkAdmin();
			}
		}
	})
	.state('admin-panel-profiles', {
		url: '/admin/panel/profiles',
		templateUrl: 'views/backoffice/profile-list.view.client.html',
		controller: 'BackOfficeCtrl',
		resolve : {
			access: function(Authentication) {
			    return Authentication.checkAdmin();
			}
		}
	})
	.state('admin-panel-network', {
		url: '/admin/panel/network',
		templateUrl: 'views/backoffice/project-network-list.view.client.html',
		controller: 'BackOfficeCtrl',
		resolve : {
			access: function(Authentication) {
			    return Authentication.checkAdmin();
			}
		}
	})
	.state('statistic', {
		url 		: '/admin/statistic',
		templateUrl : 'views/backoffice/statistic.view.client.html',
		controller 	: 'BackOfficeStatisticCtrl',
	})
	.state('terms', {
	    url: '/terms',
	    templateUrl: 'views/core/terms.view.client.html',

	})
	.state('privacy', {
	    url: '/privacy',
	    templateUrl: 'views/core/privacy.view.client.html',
	})
	.state('notfound', {
		url: '/404',
		templateUrl: 'modules/404/views/404.html',
		controller: '404Ctrl',
		resolve: {
			loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
				return $ocLazyLoad.load([
					'modules/404/controllers/404controller.js',
				]);
			}]
		}
	})
	.state('profile', {
		url: '/:username',
		templateUrl: 'views/profile/profile.view.client.html',
		controller: 'ProfileCtrl',
		controllerAs: 'profileVm',
		resolve : {
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
						} if (!res && $stateParams.username === "messages") {
							$state.go('messages');
						} if (!res && $stateParams.username === "my-projects") {
							$state.go('my-projects');
						} if (!res && $stateParams.username === "learn") {

						} else {
							$state.go('notfound');
						}
					}
				});
			}
		}
	})

	$urlRouterProvider.otherwise('modules/404/views/404.html');

	$httpProvider.defaults.withCredentials = true;
	$httpProvider.interceptors.push(function ($q) { return { request: function (config) { if (!config.timeout) { config.cancel = $q.defer(); config.timeout = config.cancel.promise; } return config; } } });

	//** Enabling Hmtl5 (pretty urls (removeing the hasbangs))
	$locationProvider.html5Mode(true);
	$locationProvider.hashPrefix('!');


})
.run(function ($rootScope, $cookieStore, $location, $http, $state) {
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

	$rootScope.encodeTitle = function(title) {
		if (!title) {
			return;
		} else {
			title = title.replace(/ /g, '-');
		}
		return title;
	};

	$cookieStore.put('resizePic', $rootScope.resizePic);
	// Check state authorization then redirect to the main page if rejection is called.
	$rootScope.$on('$stateChangeStart', function () { $http.pendingRequests.forEach(function (pendingReq) { if (pendingReq.cancel) { pendingReq.cancel.resolve('Cancel!'); } }); });
	$rootScope.$on('$stateChangeError', function(e, toState, toParams, fromState, fromParams, error){

		if(error === "Not Authorized"){
			$state.go(main);
		}
	});

});
