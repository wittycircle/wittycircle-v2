angular.module('wittyApp')
.controller('LearnArticleCtrl',
	function($rootScope, $scope, $location, $http, $state, showbottomAlert, Beauty_encode) {
		// BEGIN OF CONTROLLER

		var currentUser = $rootScope.globals.currentUser || false;
		$scope.logUser = currentUser;

		$scope.headTags = ["innovation", "interview", "products", "engineering", "design", "startups", "programming", "entrepreneurship", "politics", "news", "art", "technology", "science", "software", "hardware"];
		$scope.artSLike = {};
		$scope.artcl = {};

		function loadArticleMessages(article_id) {
		    	$http.get('/learn/articles/article/messages/' + article_id).success(function(res) {
		    		if (res.success)
		    			$scope.nome = res.data.length; 
		    		$scope.userMessages = res.data;
		    	});
		    };

		function initArticle() {
			var article = {
	    		article_id: $state.params.article_id
	    	};

	    	$http.post('/learn/articles/id', article).success(function(res) {
	    		if (res.success) {
	    			$scope.artcl = {};
	    			$scope.uArticle = res.article;
	    			loadArticleMessages(res.article.id);
	    		}
	    		$scope.aDes = $(res.article.text).text();
	    		$scope.lLink = $location.absUrl();
	    	}).error(function(res) {
	    		$location.path('/404').replace();
	    	});

	    	$http.get('/projects/user/' + currentUser.id).success(function(res) {
	    		if (res[0]) {
	    			$scope.shareProject = true;
	    			$scope.project 		= res[0];
	    			$scope.projectUrl 	= "https://www.wittycircle.com/project/" + res[0].public_id + "/" + Beauty_encode.encodeUrl(res[0].title);
	    			// Get shorten Url
		            $http.post('/url/shortener', {url: $scope.projectUrl}).success(function(res) {
		                if (res.success)
		                    $scope.ShortProjectUrl = res.url;
		            });
	    		} else
	    			$scope.shareProject = false;
	    	});
		}; 

		function loadTrendingArticle() {
	    	$http.get('/learn/articles/trending').success(function(res) {
	    		if (res.success) {
	    			$scope.sArticles = res.trendArticles;
	    			return ;
	    		}
	    	});
	    };

		initArticle();
		loadTrendingArticle();

		$scope.getArticleByTag = function(tag) {
			$state.go('learn', {tag: tag});
		};

	    $scope.sendArticleMessage = function(article) {
			if ($scope.logUser) {
				$scope.artcl.article_id = article.id;
				$scope.artcl.user_id = currentUser.id;
				$http.post('/learn/articles/article/message', $scope.artcl).success(function(res) {
					if (res.success) {
						$scope.artcl = {};
						loadArticleMessages($scope.uArticle.id);
					}
				});
			}
		};

		function postLikeArticle(article_id, location, index) {
			if (currentUser) {
				$scope.artSLike.article_id = article_id;
				$scope.artSLike.user_id = currentUser.id;

				$http.post('/learn/articles/article/like', $scope.artSLike).success(function(res) {
					if (res.success) {
						if (res.like === 1) {
							if (location === "N") {
								$scope.uArticle.numberOfLike += 1;
								$scope.uArticle.likedArticle = true;
							} else {
								$scope.sArticles[index].numberOfLike += 1;
								$scope.sArticles[index].likedArticle = true;
							}
						} else {
							if (location === "N") {
								$scope.uArticle.numberOfLike -= 1;
								$scope.uArticle.likedArticle = false;
							} else {
								$scope.sArticles[index].numberOfLike -= 1;
								$scope.sArticles[index].likedArticle = false;
							}
						}
					}
				});

			} else {
				showbottomAlert.pop_it();
			}
		};

		$scope.postSingleLikeArticle = function(article_id) {
			postLikeArticle(article_id, "N", -1);
		};

		$scope.postSimilarLikeArticle = function(index, article_id) {
			postLikeArticle(article_id, "S", index);
		};

		// MODIFY ARTICLE
		$scope.modifyArticle = function() {
			$state.go('learn.new', {article_id: $state.params.article_id});
		};

		// GO TO POST PROJECT
		$scope.postProject = function() {
			$state.go('main', {tagStart: true}, {reload: true, inherit: false, notify: true});
		};

		// END OF CONTROLLER
	});

