'use strict';

angular.module('wittyApp')
.controller('LearnCtrl',
	function($rootScope, $scope, $location, $http, Upload ,$state, $timeout, showbottomAlert) {


		var currentUser = $rootScope.globals.currentUser || false;
		var recentArticles;
		$scope.logUser = currentUser;

	    // if (!currentUser.moderator)
	    //    $location.path('/').replace();

	    $scope.headTags = ["innovation", "interview", "products", "engineering", "design", "startups", "programming", "entrepreneurship", "politics", "news", "art", "technology", "science", "software", "hardware"];
	    $scope.learn 	= {};
	    $scope.artLike 	= {};
	    $scope.a_rank 	= "most recent";

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
			$scope.times = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
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
			$scope.searchAuthor = first_name + " " + last_name;
			$scope.learn.creator_user_id = user_id;
		};

		$scope.publishArticle = function() {
			if (currentUser.moderator) {

				if ($scope.learn.tags)
					$scope.learn.tags = $scope.learn.tags.split(',');

				var data = { url: $scope.learn.picture };
				$http.post('/upload/article/picture', data).success(function(res1) {
					$scope.learn.picture = res1.secure_url;
					$http.post('/learn/articles/new', $scope.learn).success(function(res) {
						if (res.success) {
							$scope.learn = {};
							loadAllArticles();
							$timeout(function(){
								$location.path('/learn').replace();
							}, 1000);
						}
					});
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
		}

	// END OF CONTROLLER
});
