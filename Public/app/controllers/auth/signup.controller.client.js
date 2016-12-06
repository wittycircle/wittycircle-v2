/**
* @ngdoc function
* @name wittyApp.controller:LoginCtrl
* @description
* # LoginCtrl
* Controller of the wittyApp
*/
angular.module('wittyApp').controller('SignupCtrl', function ($http, $cookieStore, Upload, $filter, $stateParams, $location, $scope, $timeout, $rootScope, Authentication, Data_auth, Skills, Interests, Experiences, Locations, RetrieveData, redactorOptions, $state) {

	String.prototype.capitalizeFirstLetter = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}

    /**** AUTHENTICATION *****/
    var currentUser = $rootScope.globals.currentUser;
    
    if (!currentUser || !$stateParams.tagCheckFirst)
		$location.path('/');
    else {
	/*** Set Default Cover Picture ***/
	$http.get('/picture/cover').then(function(response) {
	    $rootScope.globals.currentUser.profile_cover = response.data.data;
	    $cookieStore.put('globals', $rootScope.globals);
	});

	/*** * * * JQUERY * * * ***/
	$('#header-section').hide();
	var aClassName  = $('#signup-basic-body');
	var bClassName  = $('#signup-skill-body');
	var cClassName  = $('#signup-interest-body');
	var dClassName  = $('#signup-experience-body');
	var eClassName  = $('#signup-about-body');
	
	var inRightBig  = "animated fadeInRightBig";
	var inLeftBig   = "animated fadeInLeftBig";
	var outRightBig = "animated fadeOutRightBig";
	var outLeftBig  = "animated fadeOutLeftBig";
	
	/**** DATA ****/
	/** basic data **/
	$scope.formDay    = "Day";
	$scope.formMonth  = "Month";
	$scope.formYear   = "Year";
	/** about data **/
	$scope.aboutText  = "join projects";
	/** experience data **/
	$scope.startMonth = "Month";
	$scope.startYear  = "Year";
	$scope.endMonth   = "Month";
	$scope.endYear    = "Year";
	
	RetrieveData.getData('/Schedule', 'GET').then(function(res) {
	    $scope.days                 = res.days;
	    $scope.months               = res.months;
	    $scope.years                = res.years;
	});
	
	function loadInfoProfile() {
	    if (currentUser) {
		$http.put('/user/checkLog/update');
		$http.post('/profileId/' + currentUser.id).success(function(res) {
		    /*** Set Default Profile Picture ***/
		    $http.get('/picture/check/profile/' + res.content.profile_id).success(function(check) {
			if (check.success) {
			    $http.get('/picture/profile');
			}
		    });
		    
		    $http.post('/profiles/' + res.content.profile_id).success(function(data) {
			$scope.personalInfo       = data.content;
			if (data.content.genre)
			    $scope.sexe             = data.content.genre.capitalizeFirstLetter();
			if (data.content.profile_picture) {
			    if (data.content.profile_picture.indexOf("default_profile") < 0)
				$scope.signUpPicture    = data.content.profile_picture;
				
			}
			if (data.content.description)
				$scope.aboutDescription = data.content.description;
			if (data.content.birthdate) {
			    var d                   = data.content.birthdate.toString();
			    var e                   = new Date(d);
			    $scope.formDay          = e.getDate();
			    $scope.formYear         = e.getFullYear();
			    $scope.formMonth        = $scope.months[e.getMonth()].Pap;
			    $scope.formMonth1       = $scope.months[e.getMonth()].Num;
			}
			
			if (data.content.location_city) {
			    if (data.content.location_state) {
				$scope.basicLocation    = data.content.location_city + ', ' + data.content.location_state.toUpperCase() + ', ' + data.content.location_country;
				$scope.displayLocation  = data.content.location_city + ', ' + data.content.location_state.toUpperCase();
			    }
			    else {
				$scope.basicLocation    = data.content.location_city + ', ' + data.content.location_country;
				$scope.displayLocation  = data.content.location_city + ', ' + data.content.location_country;
			    }
			}
			if (data.content.genre && data.content.birthdate && data.content.location_city) {
			    $scope.canPass          = true;
			}
			else
			    $scope.canPass          = false;
		    });
		});
	    }
	}; loadInfoProfile();
	
	/*
	** Initiate base var and scope for signup module and data
	*/
	$scope.user = $rootScope.globals.currentUser;
	$scope.selectedskills = [];
	$scope.selectedinterests = [];
	$scope.test = Data_auth.getData();
	$scope.formData = {};
	$scope.formData.skills = $scope.selectedskills;
	$scope.formData.interests = $scope.selectedinterests;
	$scope.searchText = [];
	$scope.skillCascade = [];
	$scope.interestList = [];
	
	/*
	** Glabal function for signup
	*/
	function contains(base, search) {
	    for(var i = 0; i < base.length; i++) {
		if (base[i].id === search) {
		    return true;
		}
	    }
	    return false;
	}
	
	/*
	** Initiate controller to get list of Skills and Interests
	*/
	$scope.skills = $http.get('/skills').success(function (response) {
	    $scope.skills = response;
	}).error(function (response) {
	    console.log('error getting skills');
	});
	
	$scope.interests = $http.get('/interests').success(function (response) {
	    $scope.interests = response;
	}).error(function (response) {
	    console.log('error gettings interests');
	});
	
	
	/*** Basic ***/
	$scope.getSexe      = function(sexe) {
	    $scope.sexe       = sexe;
	};
	$scope.getDay       = function(day) {
	    $scope.formDay    = day;
	};
	$scope.getMonth     = function(month) {
	    $scope.formMonth  = month.Pap;
	    $scope.formMonth1 = month.Num;
	};
	$scope.getYear      = function(year) {
	    $scope.formYear   = year;
	};
	
	$scope.$watchGroup(['sexe', 'basicLocation', 'displayLocation'], function(newValue, oldValue, scope) {
	    if (newValue[0] && newValue[1]) {
			$scope.checked = true;
			$scope.canPass = true;
	    } else if (newValue[0] && newValue[2]) {
	    	$scope.checked = true;
	    	$scope.canPass = true;
	    }
	});
	
	$scope.nLocation = {};
	$scope.saveBasics = function() {
	    var profileData = {};
	 //    if (!$scope.basicLocation || !$scope.sexe) {
		// 	console.log("ERROR");
		// 	return ;
		// }
	    // else {
		Locations.setplaces($scope.basicLocation, $scope.nLocation);
		// var timestamp                 = new Date(($scope.formYear + '.' + $scope.formMonth1 + '.' + $scope.formDay).toString());
		// if (isNaN(timestamp))
		//     profileData.birthdate       = new Date(Date.UTC($scope.formYear, parseInt($scope.formMonth1, 10) - 1, $scope.formDay, 12, 0, 0)).toISOString();
		// else
		//     profileData.birthdate       = timestamp;
		profileData.genre             = $scope.sexe;
		profileData.location_country  = $scope.nLocation.location_country || '';
		profileData.location_city     = $scope.nLocation.location_city || '';
		profileData.location_state    = $scope.nLocation.location_state || '';
		
		$http.put('/signup/basic/' + currentUser.id, profileData).success(function(res) {
		    if (res.success) {
				$scope.canPass = true;
				bClassName.attr('class', inRightBig);
				bClassName.css('display', 'block');
				aClassName.attr('class', outLeftBig);
				setTimeout(function() {
				    aClassName.hide();
				}, 200);
		    }
		});
	    // }
	};
	
	$scope.reloadCredential = function() {
	    $http.get('/profile').success(function(res){
			Authentication.SetCredentialsSocial(res.user, res.user_info);
	    });
	};
	
	$scope.uploadProfilePicture = function(file) {
	    var data = {};
	    if (file) {
		$scope.imageSignupLoading = true;
		Upload.dataUrl(file, true).then(function(url){
		    data.url = url;
		    $http.post('/upload/profile_pic_icon', data).success(function(res1) {
			$http.put('/profile/picture', {profile_picture: res1.secure_url, profile_picture_icon: res1.secure_url}).success(function(res) {
			    if (res.success) {
				$scope.reloadCredential();
				loadInfoProfile();
				$scope.imageSignupLoading = false;
			    }
			});
		    });
		});
	    }
	};
	
	/***** ABOUT *****/
	$scope.getAboutText = function(text) {
	    $scope.aboutText = text.toLowerCase();
	};
	$scope.saveAbout = function() {
	    var profileData = {};
	    
	    profileData.about = $scope.aboutText;
	    profileData.description = $scope.aboutDescription;
	    if (profileData.about) {
			$http.put('/signup/about', profileData).success(function(res) {
			    if (res.success) {
					$state.go('statistics', {firstVisit: true});
			    }
			});
	    } else
	    	console.log("ERROR!");
	};
	
	/*** Skills ***/
	$http.get('/skills').success(function(res) {
	    $scope.cSkills = res.skills;
	});
	$scope.sButton         = "Skip";
	
	$scope.getSignUpSkill        = function() {
		if ($rootScope.globals.currentUser) {
		    $http.get('/skills/' + $rootScope.globals.currentUser.username).success(function(res) {
			if (res.success)
			    $scope.skillCascade    = res.data;
			if ($scope.skillCascade[0])
			    $scope.sButton         = "Continue";
			else
			    $scope.sButton         = "Skip";
		    });
		}
	}; $scope.getSignUpSkill();
	
	$scope.getSkill    = function(skill) {
	    var object = {
			skill_id    : skill.id,
			skill_name  : skill.name,
	    };
	    var length = $scope.skillCascade.length;
	    for (var i = 0; i < length; i++) {
	    	if ($scope.skillCascade[i].skill_id === object.skill_id)
	    		return ;
	    }
	    $scope.skillCascade.push(object);
	    $scope.sButton         = "Continue";
	    $http.post('/skills/add', object).success(function(res) {
	    });
	};
	
	$scope.removeSkill = function(index, index2) {
		$scope.skillCascade.splice(index2, 1);
		if (!$scope.skillCascade[0])
			$scope.sButton         = "Skip";
	    $http.delete('/skills/delete/' + index).success(function(res) {});
	};
	
	$scope.saveSkill   = function() {
	    cClassName.attr('class', inRightBig);
	    cClassName.css('display', 'block');
	    bClassName.attr('class', outLeftBig);
	    setTimeout(function() {
		bClassName.hide();
	    }, 200);
	}
	
	/*** Interests ***/
	$http.get('/interests').success(function(res) {
	    $scope.cInterests     = res.interests;
	});
	// $scope.iButton          = "Skip";
	
	$scope.getSignUpInterest     = function() {
		if ($rootScope.globals.currentUser) {
		    $http.get('/interest/' + $rootScope.globals.currentUser.username).success(function(res) {
			if (res.success)
			    $scope.interestList = res.data;
			if ($scope.interestList[0])
			    $scope.iButton    = "Continue";
			else
			    $scope.iButton    = "Skip";
		    });
		}
	}; $scope.getSignUpInterest();
	
	$scope.getInterest      = function(interest) {
	    var object            = {
			interest_id     : interest.id,
			interest_name   : interest.name,
	    };
	    var length = $scope.interestList.length;
    	for (var i = 0; i < length; i++) {
    		if ($scope.interestList[i].interest_id === object.interest_id)
    			return ;
    	}
	    $scope.interestList.push(object);
	    $scope.iButton    = "Continue";
	    $http.post('/interests/add', object).success(function(res) {
	    });
	};
	
	$scope.removeInterest = function(index, index2) {
		$scope.interestList.splice(index2, 1);
		if (!$scope.interestList[0])
			$scope.iButton         = "Skip";
	    $http.delete('/interest/delete/' + index).success(function(res) {
	    });
	};
	
	$scope.saveInterest     = function() {
	    dClassName.attr('class', inRightBig);
	    dClassName.css('display', 'block');
	    cClassName.attr('class', outLeftBig);
	    setTimeout(function() {
		cClassName.hide();
	    }, 200);
	}
	
	/*** Experience ***/
	$scope.getIndex       = -1;
	$scope.exButton       = "Skip";
	$scope.positions      = [];
	$scope.startPeriod    = {};
	$scope.endPeriod      = {};
	
	$scope.loadEx         = function() {
	    $http.get('/experiences').success(function(res) {
		if (res.success)
		    $scope.positions  = res.data;
		else
			$scope.positions  = [];
		if ($scope.positions[0])
		    $scope.exButton   = "Continue";
	    });
	};
	$scope.loadEx();
	
	$scope.getStartMonth  = function(month) {
	    $scope.startPeriod.month  = month;
	    $scope.startMonth         = month.Pap
	};
	$scope.getStartYear   = function(year) {
	    $scope.startPeriod.year   = year;
	    $scope.startYear          = year;
	};
	$scope.getEndMonth    = function(month) {
	    $scope.endPeriod.month    = month;
	    $scope.endMonth           = month.Pap;
	};
	$scope.getEndYear     = function(year) {
	    $scope.endPeriod.year     = year;
	    $scope.endYear            = year;
	};
	
	$scope.addNewPosition = function() {
	    $scope.getIndex = -1;
	    $scope.startMonth       = "Month";
	    $scope.startYear        = "Year";
	    $scope.endMonth         = "Month";
	    $scope.endYear          = "Year";
	    $scope.displayLocation2 = null;
	    $scope.eJob             = null;
	    $scope.eCompany         = null;
	    $scope.exLocation       = null;
	    $scope.eJobDescription  = null;
	    $scope.noJob            = false;
	    $scope.noCompany        = false;
	    $scope.noLocation       = false;
	    $scope.noTime           = false;
	    $scope.checkboxEndTime  = false;
	    $('#signup-experience-body').removeClass('animated fadeInRightBig');
	    $('#signup-experience-body').fadeOut();
	    $('#signup-experience-modal').fadeIn();
	};

	function displayProfiles(profiles) {

		var member 			 = profiles.values[0],
			linPositions 	 = member.positions.values,
			newSavePositions = {}; 

		$scope.aboutDescription = member.summary ? member.summary : null;
		$scope.$apply();

		if (linPositions) {
			function recursive(index) {
				if (linPositions[index]) {
					newSavePositions.company 			= linPositions[index].company.name || null;
					newSavePositions.description 		= linPositions[index].summary || null;
					newSavePositions.location_city		= linPositions[index].location.name || null;
					newSavePositions.location_country 	= linPositions[index].location.country ? linPositions[index].location.country.name : null;
					newSavePositions.title  			= linPositions[index].title || null;

					if (linPositions[index].isCurrent)
						newSavePositions.date_to = "Present";
					newSavePositions.date_from 	= new Date(linPositions[index].startDate.month + "-01-" + linPositions[index].startDate.year);

					$http.post('/experiences', newSavePositions).success(function(res) {
					    if (res.success)
							return recursive(index + 1);
					});			
				} else {
					$scope.loadEx();
					$scope.onImport 		= false;
					$scope.exButton         = "Continue";
				}
			};
			recursive(0);
		} else {
			$scope.onImport 		= false;
			$scope.noCurrentPosition = true;
			$timeout(function() {
				$scope.noCurrentPosition;
			}, 5000)
		}
	};

	function retrieveLinkedinPosition() {
		IN.API.Profile('me').fields([
			'headline', // Current Headline 
			'summary', // Current summary
			'first-name', 'last-name', // Add these to get the name
			'industry', 'date-of-birth', 'educations:(id,school-name)',
			'positions', // Add this one to get the job history
		])
		.result(displayProfiles)
		.error(function(err) {
			$scope.onImport = false;
	    	alert(err);
	    });;
	};

	$scope.getLinkedinField = function() {
		$scope.onImport = true;
		IN.User.authorize(retrieveLinkedinPosition);
	};
	
	$scope.savePosition   = function(no) {
	    var endTime, dStart, position;
	    
	    /*** Error case ***/
	    if (!$scope.eJob || !$scope.eCompany || !$scope.exLocation || !$scope.startPeriod.month || !$scope.startPeriod.year)
	    {
		$scope.noJob      = !$scope.eJob ?        true : false;
		$scope.noCompany  = !$scope.eCompany ?    true : false;
		$scope.noLocation = !$scope.exLocation ?  true : false;
		$scope.noTime     = (!$scope.startPeriod.month || !$scope.startPeriod.year) ? true : false;
		return ;
	    }
	    
	    if (!$scope.endPeriod.month || !$scope.endPeriod.year || $scope.checkboxEndTime)
		endTime     = "Present";
	    else {
		endTime = new Date($scope.endPeriod.year + '.' + $scope.endPeriod.month.Num + '.' + "01");
		if (isNaN(endTime))
		    endTime = new Date(Date.UTC($scope.endPeriod.year, parseInt($scope.endPeriod.month.Num, 10) - 1, 1, 12, 0, 0)).toISOString();
	    }
	    
	    dStart = new Date($scope.startPeriod.year + '.' + $scope.startPeriod.month.Num + '.' + "01");
	    if (isNaN(dStart))
		dStart = new Date(Date.UTC($scope.startPeriod.year, parseInt($scope.startPeriod.month.Num, 10) - 1, 1, 12, 0, 0)).toISOString();
	    
	    position = {
			title             : $scope.eJob,
			company           : $scope.eCompany,
			description       : $scope.eJobDescription,
			date_from         : dStart,
			date_to           : endTime,
	    };
	    Locations.setplaces($scope.exLocation, position);
	    
	    if (no === 1) {
		$http.put('/experience/' + $scope.getIndex, position).success(function(res) {
		    if (res.success) {
			$scope.loadEx();
			$('#signup-experience-body').fadeIn();
			$('#signup-experience-modal').fadeOut();
		    }
		});
	    } else {
		$http.post('/experiences', position).success(function(res) {
		    if (res.success) {
			$scope.loadEx();
			$scope.exButton         = "Continue";
			$('#signup-experience-body').fadeIn();
			$('#signup-experience-modal').fadeOut();
		    }
		});
	    }
	};
	
	$scope.editPosition         = function(index, position) {
	    $scope.getIndex           = position;
	    var disDate1              = $filter('wittyDateFilterEx')($scope.positions[index].date_from, 1);
	    var disDate2              = $filter('wittyDateFilterEx')($scope.positions[index].date_to, 1);
	    
	    if ($scope.positions[index].date_to.toLowerCase() !== "present") {
		$scope.endMonth         = disDate2.month;
		$scope.endYear          = disDate2.year;
		$scope.checkboxEndTime  = false;
	    }
	    else
		$scope.checkboxEndTime  = true;
	    if ($scope.positions[index].location_state) {
		$scope.displayLocation2 = $scope.positions[index].location_city + ', ' + $scope.positions[index].location_state.toUpperCase() + ', ' + $scope.positions[index].location_country;
		$scope.exLocation       = $scope.positions[index].location_city + ', ' + $scope.positions[index].location_state + ', ' + $scope.positions[index].location_country;
	    }
	    else {
		$scope.displayLocation2 = $scope.positions[index].location_city + ', ' + $scope.positions[index].location_country;
		$scope.exLocation       = $scope.positions[index].location_city + ', ' + $scope.positions[index].location_country;
	    }
	    
	    if (disDate2 !== "Present") {
			$scope.endMonth         	= disDate2.month;
			$scope.endYear          	= disDate2.year;
			$scope.endPeriod.month  	= {Num: disDate2.monthN, Pap: disDate2.month};
			$scope.endPeriod.year   	= disDate2.year;
		}
	    $scope.startMonth         = disDate1.month;
	    $scope.startYear          = disDate1.year;
	    $scope.startPeriod.month  = {Num: disDate1.monthN, Pap: disDate1.month};
	    $scope.startPeriod.year   = disDate1.year;
	    $scope.eJob               = $scope.positions[index].title;
	    $scope.eCompany           = $scope.positions[index].company;
	    $scope.eJobDescription    = $scope.positions[index].description;
	    $scope.noJob              = false;
	    $scope.noCompany          = false;
	    $scope.noLocation         = false;
	    $scope.noTime             = false;
	    $('#signup-experience-body').removeClass('animated fadeInRightBig');
	    $('#signup-experience-modal').fadeIn();
	    $('#signup-experience-body').fadeOut();
	};
	
	$scope.removePosition       = function(id, index) {
		if (index)
			$scope.positions.splice(index, 1);
		if (id) {
	 	    $http.delete('/experience/' + id).success(function(res) {
			if (res.success)
			    $scope.loadEx();
		    });
	 	}
	};
	
	$scope.saveExperience          = function() {
		eClassName.attr('class', inRightBig);
	    eClassName.css('display', 'block');
	    dClassName.attr('class', outLeftBig);
	    setTimeout(function() {
		dClassName.hide();
	    }, 200);
	};
	
	$rootScope.$on('$stateChangeStart', function(next, current) { 
	    $('#header-section').show();
	});
	// **Redactor configuration

		redactorOptions.buttonSource = false;
		redactorOptions.imageResizable = false;
		redactorOptions.imageEditable = false;
		redactorOptions.imageLink = false;
		redactorOptions.visual = false;// false for html mode

		redactorOptions.buttons = false;
		redactorOptions.plugins = false;
		redactorOptions.formatting = false;
	/*
	**End Redactor configuration
	*/
    }
})
.directive('locationSearch', function() {
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
						scope.basicLocation   = model.$viewValue;
						scope.exLocation      = model.$viewValue;
					});
				});

			scope.$watch('displayLocation', function(value) {
				if (value) {
					var checkCountry          = value.indexOf('United States');
					if (checkCountry >= 0) {
						scope.displayLocation   = value.slice(0, checkCountry - 2);
					}
				}
			});

			scope.$watch('displayLocation2', function(value) {
				if (value) {
					var checkCountry2         = value.indexOf('United States');
					if (checkCountry2 >= 0) {
						scope.displayLocation2  = value.slice(0, checkCountry2 - 2);
					}
				}
			});
		}
	};
})
.directive('addPosition', function() {
	return {
		restrict: 'A',
		link: function(scope, element, attrs, model) {
// scope.$watch('positions', function(value, oldvalue) {
//   $('#signup-experience-modal').fadeOut();
//   $('#signup-experience-body').fadeIn();
// });
}
};
});
