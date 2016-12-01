'use strict';

angular.module('wittyApp')
.controller('LearnCtrl',
	function($rootScope, $scope, $location, $http, Upload, $state, $stateParams, $timeout, showbottomAlert, redactorOptions) {

		// **Redactor configuration
			redactorOptions.imageUpload = '/upload/redactor';
			redactorOptions.buttonSource = true;
			redactorOptions.imageResizable = true;
			redactorOptions.imageEditable = true;
			redactorOptions.imageLink = true;
			redactorOptions.visual = true;// false for html mode

			redactorOptions.buttons = ['format', 'bold', 'italic', 'deleted', 'lists', 'image', 'video', 'file', 'link', 'horizontalrule'];
			redactorOptions.plugins = ['imagemanager'];
			redactorOptions.formatting = ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5'];
		/*
		**End Redactor configuration
		*/
		var currentUser = $rootScope.globals.currentUser || false;
		var recentArticles;
		$scope.logUser = currentUser;
		$scope.searchAuthor;

	    // if (!currentUser.moderator)
	    //    $location.path('/').replace();

	    $scope.headTags = ["innovation", "interview", "products", "engineering", "design", "startups", "programming", "entrepreneurship", "politics", "news", "art", "technology", "science", "software", "hardware"];
	    $scope.learn 	= {};
	    $scope.artLike 	= {};
	    $scope.a_rank 	= "most recent";

	    if ($stateParams.article_id) {
	    	$scope.removeA = true;
	    	var article = {
	    		article_id: $stateParams.article_id
	    	};
	    	$http.post('/learn/articles/id', article).success(function(res) {
	    		if (res.success) {
	    			var article 			= res.article;
	    			var tags;
	    			$scope.article_id 		= article.id;
	    			$scope.learn.id 		= article.id;
	    			$scope.learn.title 		= article.title;
	    			$scope.learn.picture 	= article.picture;
	    			$scope.learn.searchAuthor 	= article.profile.first_name + " " + article.profile.last_name;
	    			$scope.learn.creator_user_id = article.creator_user_id;
	    			$scope.learn.read_time	= article.read_time;
	    			$scope.learn.text 		= article.text;


	    			for (var i = 0; i < article.tags.length; i++) {
	    				if (i === 0)
	    					tags = article.tags[i].tag_name;
	    				else
	    					tags += ", " + article.tags[i].tag_name;
	    			};

	    			$scope.learn.tags = tags;
	    		}
	    		// $scope.aDes = $(res.article.text).text();
	    		// $scope.lLink = $location.absUrl();
	    	}).error(function(res) {
	    		$location.path('/404').replace();
	    	});
	    }

	    // FUNCTIONS
	    function getArticle(tag) {
	    	$http.get('/learn/articles/search/tags/' + tag).success(function(res) {
				if (res.success) {
					$location.path('/learn').replace();
					$scope.articles = res.articles;
					return ;
				}
			});
	    };

	    function loadAllArticles() {
		    if ($state.params.tag) {
		    	getArticle($state.params.tag);
		   	} else {
		    	$http.get('/learn/articles/all').success(function(res) {
		    		if (res.success) {
			    		$scope.articles = res.articles;
			    		recentArticles = res.articles;
			    		return ;
			    	}
		    	});
		    }
	    };

	    function loadTrendingArticle() {
	    	$http.get('/learn/articles/trending').success(function(res) {
	    		if (res.success) {
	    			$scope.tArticles = res.trendArticles;
	    			return ;
	    		}
	    	});
	    };

	    loadAllArticles();
	    loadTrendingArticle();

	    $scope.uploadProfilePicture = function(file) {
	    	if (file) {
			    // $scope.imageSignupLoading = true;
			    Upload.dataUrl(file, true).then(function(url) {
			    	$scope.learn.picture = url;
			    	return ;
			    });
			}
		};

		$scope.loadTime = function() {
			$scope.times = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		};

		$scope.getArticleByRank = function(id) {
			if (id === 1) {
				$scope.a_rank = "most recent";
				$scope.articles = recentArticles;
			} else {
				$scope.a_rank = "most viewed";
				$http.get('/learn/articles/like').success(function(res) {
					if (res.success)
						$scope.articles = res.articles;
				});
			}
		};

		$scope.getAuthors = function() {
			$http.get('/learn/articles/authors').success(function(res) {
				$scope.authors = res.data;
			});	
		}; $scope.getAuthors();

		$scope.getAuthorId = function(user_id, first_name, last_name) {
			$scope.learn.searchAuthor = first_name + " " + last_name;
			$scope.learn.creator_user_id = user_id;
		};

		$scope.publishArticle = function() {
			if (currentUser.moderator || currentUser.ambassador) {

				if ($scope.learn.tags)
					$scope.learn.tags = $scope.learn.tags.split(',');

				delete $scope.learn.searchAuthor;
				var data = { url: $scope.learn.picture };
				$http.post('/upload/article/picture', data).success(function(res1) {
					$scope.learn.picture = res1.secure_url;
					if ($stateParams.article_id) {
						$http.put('/learn/articles/new', $scope.learn).success(function(res) {
							if (res.success) {
								$scope.learn = {};
								loadAllArticles();
								$timeout(function(){
									$location.path('/learn').replace();
								}, 1000);
							}
						});
					} else {
						$http.post('/learn/articles/new', $scope.learn).success(function(res) {
							if (res.success) {
								$scope.learn = {};
								loadAllArticles();
								$timeout(function(){
									$location.path('/learn').replace();
								}, 1000);
							}
						});
					}
				});
			} else
				$location.path('/').replace();
		};

		// SEARCH ARTICLE

		$scope.getArticleByTag = function(tag) {
			getArticle(tag);
		};

		// LIKE ARTICLE
		function postLikeAll(index, article_id, location) {
			if (currentUser) {
				$scope.artLike.article_id = article_id;
				$scope.artLike.user_id = currentUser.id;

				$http.post('/learn/articles/article/like', $scope.artLike).success(function(res) {
					if (res.success) {
						if (res.like === 1) {
							if (location === "N") {
								$scope.articles[index].numberOfLike += 1;
								$scope.articles[index].likedArticle = true;
							} else {
								$scope.tArticles[index].numberOfLike += 1;
								$scope.tArticles[index].likedArticle = true;
							}
						} else {
							if (location === "N") {
								$scope.articles[index].numberOfLike -= 1;
								$scope.articles[index].likedArticle = false;
							} else {
								$scope.tArticles[index].numberOfLike -= 1;
								$scope.tArticles[index].likedArticle = false;
							}
						}
					}
				});

			} else {
				showbottomAlert.pop_it();
			}
		};

		$scope.postLikeArticle = function(index, article_id) {
			postLikeAll(index, article_id, "N");
		};

		$scope.postLikeTrendingArticle = function(index, article_id) {
			postLikeAll(index, article_id, "T");
		};

		// REMOVE ARTICLE

		$scope.removeArticle = function(id) {
			$http.delete('/learn/articles/delete/' + id).success(function(res) {
				if (res.success) {
					$scope.learn = {};
					loadAllArticles();
					$timeout(function(){
						$location.path('/learn').replace();
					}, 1000);
				}
			});
		};


	// END OF CONTROLLER
});
