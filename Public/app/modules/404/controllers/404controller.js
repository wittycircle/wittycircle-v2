'use strict';


angular.module('wittyApp').controller('404Ctrl', function ($scope) {

	$('#header-section').hide();
    $('#footerCore').hide();

	$scope.$on("$destroy", function(){
		$('#header-section').show();
	    $('#footerCore').show();
	});

});
