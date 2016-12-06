angular.module('wittyApp')
	.controller('RankCtrl', function($http, $location, $scope, $rootScope, $timeout, RetrieveData, $state, Upload) {

		var currentUser = $rootScope.globals.currentUser || null;

		if (currentUser) {
			
			/*** BACKGROUND ***/
			var width = $(window).width();
			if (width < 350)
				$scope.wwidth = '280';
			else
				$scope.wwidth = '350';
			$scope.backPic = $rootScope.globals.currentUser.profile_cover;
			$scope.mailList = [];
			$scope.inviteW = "Invite";
			$scope.firstVisit = $state.params.firstVisit;

			$scope.initRanking = function() {
				RetrieveData.getData('/rank/statistic', 'GET').then(function(res) {
					if (res.success)
						$scope.pRank = res.data;
				});

				RetrieveData.ppdData('/rank/statistic', 'POST', { user_id: currentUser.id }).then(function(res) {
					if (res.success) {
						$scope.myRank = res.rank;
						$scope.myCompareRank = res.compareR;
					}
				});

				RetrieveData.getData('/rank/statistic/alltime', 'GET').then(function(res) {
					if (res.success) {
						if (!res.data[0])
							return ;
						initGraph(res.min, res.max, res.data);
					}
				});
			};
			$scope.initRanking();

			/***	EVENT	***/
			$scope.displayInvite = function() {	
		 		if ($scope.dInvite)
		 			$scope.dInvite = false;
		 		else
		 			$scope.dInvite = true;
		 	};

		 	$scope.addEmailToList = function(keycode, email) {
		 		if (keycode === 13 && !email) {
		 			$scope.errorMail = true;
		 			return ;
		 		}
		 		if (keycode == 13 && email) {
		 			if (email.indexOf(',') > 0) {
		 				email 			= email.replace(/\s+/g, '');
            			var mailArray 	= email.split(',');
            			var mailLength 	= mailArray.length;
            			var re 			= /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

            			for (var i = 0; i < mailLength; i++) {
            				if (re.test(mailArray[i])) {
            					$scope.errorMail = false;
            					$scope.mailList.push(mailArray[i]);
            				}
            			};

            			$scope.email = [];
		 			} else {
		 				var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		 				if (re.test(email)) {
				 			$scope.errorMail = false;
				 			$scope.mailList.push(email);
				 			$scope.email = [];
				 		} else {
				 			$scope.errorMail = true;
		 					return ;
				 		}
			 		}
		 		}
		 	};

		 	$scope.loadCsvFile = function(file) {
		 		var r = new FileReader();
				r.onload = function(e) {
					var content = e.target.result;
					content = content.replace(/\r?\n|\r/g, ",");
					if (typeof content === "string") {
						$scope.addEmailToList(13, content);
					}
				};

				r.readAsText(file); 		
		 	};

		 	$scope.removeMailFromList = function(index) {
		 		$scope.mailList.splice(index, 1);
		 	};

		 	$scope.sendInvitation = function() {
		 		if ($scope.mailList[0]) {
		 			RetrieveData.ppdData('/invitation/new', "POST", {user_id: currentUser.id, mailList: $scope.mailList, team: false}).then(function(res) {
		 				if (res.success) {
		 					$scope.inviteW = "Invited";
		 					$scope.sended = true;
		 					$timeout(function() {
		 						$("#sinvitem").fadeOut(200);
		 						$scope.mailList = [];
		 						$scope.sended = false;
		 						$scope.inviteW = "Invite";
		 					}, 500);
		 				}
		 			});
		 		}
		 	};
		 	// $timeout(function() {
		 	// 	$scope.displayPage = true;
		 	// }, 1000)


		 	// CANVAS GRAPH HTML5

    		function initGraph(min, max, data) {
    			data.unshift(" ");
    			var monthNames 	= ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    			var sections 	= data.length,
    				canvas 		= document.getElementById("myCanvas"),
					context 	= canvas.getContext("2d");

    			$(document).ready(function() {
		    		var	val_max 	= max - min,
		    			val_min 	= 0,
		    			yScale 		= (canvas.height - 40) / val_max,
		    			xScale 		= (canvas.width - 10) / sections,
		    			d 			= new Date(data[1].date),
                        beginDate 	= monthNames[d.getMonth()] + " " + d.getFullYear().toString().slice(2, 4);

					
                    // Start date of Ranking (easting)
                    context.beginPath();
                    context.font = "14px FreigBook";
					context.fillText(beginDate, 0, canvas.height);
					context.strokeStyle = "black"
					context.stroke();

					// Middle of Ranking (easting)
					var middleEasting = Math.round(val_max / 2);
					var middleRank 	  = Math.round(max / 2);
					context.beginPath();
					context.setLineDash([5, 3]);
					context.fillText("#" + middleRank, canvas.width - 30, middleEasting * yScale + 3);
					context.moveTo(xScale, middleEasting * yScale);
					context.lineTo(canvas.width - 40, middleEasting * yScale)
					context.strokeStyle = "#999999";
					context.lineWidth 	= 2; 
					context.stroke();

					// Today Ranking (northing)
					var length = data.length - 1;
					context.beginPath();
					context.font="14px FreigBook";
					context.fillText("Now", length * xScale - 15, canvas.height);
					context.strokeStyle = "black"
					context.stroke();

					context.beginPath();
					context.setLineDash([0, 0]);
					var count = 2;
					var beginDraw = (data[1].rank - min) * yScale + 30;
					context.moveTo(xScale, beginDraw);
					for (i = 2; i < sections; i++) {
						var scaleRank = data[count].rank - min;
						context.lineTo(i * xScale, scaleRank * yScale + 30);
						context.strokeStyle = "black";
						count++;
					}
					context.lineWidth = 2;
					context.stroke();

					// Start date of ranking
					// var d = new Date(begin);
					// var beginDate = monthNames[d.getMonth()] + " " + d.getFullYear().toString().slice(2, 4);
					// context.beginPath();
					// context.font="14px FreigBook";
					// context.fillText(beginDate, 30, canvas.height);

					// Today ranking
					// context.beginPath();
					// context.font="16px FreigBook";
					// context.fillText("Now", canvas.width - 30, 20);

					// Middle of ranking
					// context.beginPath();
					// context.setLineDash([5, 3]);
					// var rest = val_max - val_min;
					// if ($scope.myRank <= 10)
					// 	var temScale = "#10";
					// else if ($scope.myRank > 10 && $scope.myRank <= 50)
					// 	var temScale = "#50";
					// else if ($scope.myRank > 50 && $scope.myRank <= 100)
					// 	var temScale = "#100";
					// else if ($scope.myRank > 100 && $scope.myRank <= 500)
					// 	var temScale = "#500";
					// console.log(temScale);
					// context.fillText(temScale, canvas.width - 30, canvas.height / 2 + 3);
					// context.moveTo(50, canvas.height / 2);
					// context.lineTo(canvas.width - 40, canvas.height / 2);
					// context.strokeStyle = "#999999"
					// context.stroke();

					// Ranking curve
					// context.beginPath();
					// context.translate(rowSize, canvas.height + val_min * yScale);
					// context.scale(1, -1 * yScale);

					// context.beginPath();
					// context.setLineDash([0, 0]);
					// context.moveTo(0, data[0] + 220);
					// for (i = 1; i < sections; i++) {
					// 	context.lineTo(i * xScale, data[i] + 220);
					// 	context.strokeStyle = "#222";
					// }
					// context.stroke();
				});

	    	};
		
		} else {
			if($location.path() === "/rank") {
	            $location.path('/login').replace();
	        }
		}

	});