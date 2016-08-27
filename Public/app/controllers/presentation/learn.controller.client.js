'use strict';

angular.module('wittyApp')
	.controller('LearnCtrl',
		function($rootScope, $scope, $location, $http, Upload ,$state, redactorOptions) {

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
		   
		   
			var currentUser = $rootScope.globals.currentUser || false;
		    if (!currentUser.moderator)
		       $location.path('/').replace();

			$scope.learn = {};

			if ($state.params.article_id) {
				var article = {
					article_id: $state.params.article_id
				};

				$http.post('/learn/articles/id', article).success(function(res) {
					if (res.success)
						$scope.uArticle = res.article;
					$scope.lLink = $location.absUrl();
				}).error(function(res) {
					$location.path('/404').replace();
				});
			}

			$scope.loadAllArticles = function() {
				$http.get('/learn/articles/all').success(function(res) {
					$scope.articles = res.articles;
				});
			};
			$scope.loadAllArticles();

			$scope.loadArticle = function(index) {
				$scope.uArticle = $scope.articles[index];
			};

			$scope.uploadProfilePicture = function(file) {
			    if (file) {
					// $scope.imageSignupLoading = true;
					Upload.dataUrl(file, true).then(function(url){
					    $scope.learn.picture = url;
					});
			    }
			};

			$scope.loadTime = function() {
				$scope.times = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
			};

			$scope.publishArticle = function() {
				if (currentUser.moderator) {
					$scope.learn.creator_user_id = currentUser.id;

					if ($scope.learn.tags)
						$scope.learn.tags = $scope.learn.tags.split(',');

					var data = { url: $scope.learn.picture };
					$http.post('/upload/article/picture', data).success(function(res1) {
						$scope.learn.picture = res1.secure_url;
						$http.post('/learn/articles/new', $scope.learn).success(function(res) {
						});
					});
				} else
					$location.path('/').replace();
			};

		});