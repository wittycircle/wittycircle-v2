
angular.module('wittyApp')
	.controller('PopUpCtrl', function($scope, $http, $rootScope, $mdBottomSheet) {


	var options = {
		method: 'feed',
		name: 'Wittycircle | The creators place',
		link: 'https://www.wittycircle.com',
		picture: 'https://res.cloudinary.com/dqpkpmrgk/image/upload/v1458576687/Share_banner_cover/banner_share.png',
		caption: 'Wittycircle.com',
		description: 'Made for the entrepreneurs, the creators, the designers, the developers, the curious & all those who need support and visibility to build their project. I just joined @Wittycircle, the creators marketplace'
	}

	$scope.facebookShare = function() {
		FB.ui(options, function(response) {
	    	if (response && !response.error_message) {
	    		$scope.shareSuccess = true;
	    		$rootScope.socialCheck = false;
	    		if ($rootScope.globals.currentUser) {
		      		$http.put('/share/' + $rootScope.globals.currentUser.id).success(function(res) {
		      			if (res.success) {
		      				setTimeout(function(){
		      					$mdBottomSheet.cancel();
		      				}, 1000);
		      			}
		      		});
		      	}
		    } else {
		      alert('Error while posting.');
		    }
	    });
	};

	twttr.ready(function (twttr) {
	    twttr.events.bind('tweet', function (event) {
	    	$rootScope.socialCheck = false;
	        if ($rootScope.globals.currentUser) {
	      		$http.put('/share/' + $rootScope.globals.currentUser.id).success(function(res) {
	      			if (res.success)
	      				$mdBottomSheet.cancel();
	      		});
	      	}
	    });
	});
});