'use strict';

/**
* @ngdoc function
* @name wittyApp.controller:ExperiencesModalCtrl
* @description
* # ExperiencesModalCtrl
* Controller of the wittyApp
**/

angular.module('wittyApp').controller('EditExperiencesModalCtrl', function ($modalInstance, $filter, $http, $location, $scope, Profile, $rootScope, $stateParams, Experiences, Skills, Interests, Locations, indexId) {

	$scope.getStartMonth        = function(month) {
      $scope.startPeriod.month  = month;
      $scope.startMonth         = month.Pap;
    };
    $scope.getStartYear         = function(year) {
      $scope.startPeriod.year   = year;
      $scope.startYear          = year;
    };
    $scope.getEndMonth          = function(month) {
      $scope.endPeriod.month    = month;
      $scope.endMonth           = month.Pap;
    };
    $scope.getEndYear           = function(year) {
      $scope.endPeriod.year     = year;
      $scope.endYear            = year;
    };

	$scope.loadEx         	= function() {
      $http.get('http://127.0.0.1/experiences').success(function(res) {
        if (res.success) {
        	$scope.positions  = res.data;
        	$scope.editPosition(indexId);
        }
      });
    }; $scope.loadEx();


    $scope.editPosition = function(index) {
    	$scope.getIndex 			= $scope.positions[index].id;
		var disDate1              	= $filter('wittyDateFilterEx')($scope.positions[index].date_from, 1);
		var disDate2              	= $filter('wittyDateFilterEx')($scope.positions[index].date_to, 1);

		if ($scope.positions[index].date_to.toLowerCase() !== "present") {
			$scope.endMonth         = disDate2.month;
			$scope.endYear          = disDate2.year;
			$scope.checkboxEndTime  = false;
		} else
			$scope.checkboxEndTime  = true;

		if ($scope.positions[index].location_state) {
			$scope.displayEditLocation 	= $scope.positions[index].location_city + ', ' + $scope.positions[index].location_state.toUpperCase();
			$scope.addExLocation      	= $scope.positions[index].location_city + ', ' + $scope.positions[index].location_state + ', ' + $scope.positions[index].location_country;
		} else {
			$scope.displayEditLocation 	= $scope.positions[index].location_city + ', ' + $scope.positions[index].location_country;
			$scope.addExLocation        = $scope.positions[index].location_city + ', ' + $scope.positions[index].location_country;
		}

		$scope.startMonth         	= disDate1.month;
		$scope.startYear          	= disDate1.year;
		$scope.startPeriod.month  	= {Num: disDate1.monthN, Pap: disDate1.month};
		$scope.startPeriod.year   	= disDate1.year;
		$scope.eJob               	= $scope.positions[index].title;
		$scope.eCompany           	= $scope.positions[index].company;
		$scope.eJobDescription    	= $scope.positions[index].description;
		$scope.noJob              	= false;
		$scope.noCompany          	= false;
		$scope.noLocation         	= false;
		$scope.noTime             	= false;
		$('#signup-experience-body').removeClass('animated fadeInRightBig');
		$('#signup-experience-modal').fadeIn();
		$('#signup-experience-body').fadeOut();
	};

	$scope.saveEditPosition        	= function() {
		var endTime, dStart, position;

		/*** Error case ***/
		if (!$scope.eJob || !$scope.eCompany || !$scope.addExLocation || !$scope.startPeriod.month || !$scope.startPeriod.year) {
			$scope.noJob            = !$scope.eJob ?        true : false;
			$scope.noCompany        = !$scope.eCompany ?    true : false;
			$scope.noLocation       = !$scope.addExLocation ?  true : false;
			$scope.noTime           = (!$scope.startPeriod.month || !$scope.startPeriod.year) ? true : false;
			return ;
		}

		if (!$scope.endPeriod.month || !$scope.endPeriod.year || $scope.checkboxEndTime)
			endTime                 = "Present";
		else {
			endTime                 = new Date($scope.endPeriod.year + '.' + $scope.endPeriod.month.Num + '.' + "01");
			if (isNaN(endTime))
				endTime             = new Date(Date.UTC($scope.endPeriod.year, parseInt($scope.endPeriod.month.Num, 10) - 1, 1, 12, 0, 0)).toISOString();
		}

		dStart                		= new Date($scope.startPeriod.year + '.' + $scope.startPeriod.month.Num + '.' + "01");
		if (isNaN(dStart))
			dStart 					=new Date(Date.UTC($scope.startPeriod.year, parseInt($scope.startPeriod.month.Num, 10) - 1, 1, 12, 0, 0)).toISOString();

		position              	= {
			title             : $scope.eJob,
			company           : $scope.eCompany,
			description       : $scope.eJobDescription,
			date_from         : dStart,
			date_to           : endTime,
		};
		Locations.setplaces($scope.addExLocation, position);

		$http.put('http://127.0.0.1/experience/' + $scope.getIndex, position).success(function(res) {
			if (res.success) {
				$scope.getProfileExp();
				$modalInstance.dismiss();
			}
		});
	};

	$scope.dismiss = function () {
      $modalInstance.dismiss();
    };
})
.directive('editExLocation', function($http, Locations) {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, model) {
      var options = {
        types: ['(cities)'],
      };

      scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

      google.maps.event.addListener(scope.gPlace, 'place_changed',
      function() {
          scope.$apply(function() {
              model.$setViewValue(element.val());
              scope.editLocation = model.$viewValue;
          });
      });

      scope.$watch('displayEditLocation', function(value) {
        if (value) {
          scope.addExLocation = value;
          var checkCountry          = value.indexOf('United States');
          if (checkCountry >= 0) {
            scope.displayLocation   = value.slice(0, checkCountry - 2);
          }
        }      
      });
    }
  };
});