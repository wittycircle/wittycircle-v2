
angular.module('wittyApp')
	.controller('PopUpCtrl', function($scope, $http, $rootScope, $mdBottomSheet) {

	$scope.facebookShare = function(title, link, img, text) {
		var newImg = $rootScope.resizePic(img, 450, 300);
		var options = {
			method: 'feed',
			name: title,
			link: link,
			picture: newImg,
			caption: 'Wittycircle.com',
			description: text
		};

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

	$scope.closePopover = function() {
        $mdBottomSheet.hide();
    };

    $scope.popSwL = function() {
 		var height 	= $(window).height();
 		console.log(height);
        var x       = $('#main-signup-modal');
        var filter  = $("#page-wrap");
        var marge = (height - x.height())/2;

        if (x.css('display') === "none") {
            filter.fadeIn(500);
            x.css({'top': marge.toString() + "px"});
            $mdBottomSheet.cancel();
            x.fadeIn();
        }
    };
});
