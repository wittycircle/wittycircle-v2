'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:SettingCtrl
 * @description
 * # MessageCtrl
 * Controller of the wittyApp
 **/

 angular.module('wittyApp')
 	.controller('MessageCtrl', function($sce, $http, $scope, $modal, $rootScope, $state, $stateParams, Users, $timeout, $filter, $location, redactorOptions) {

 	if ($rootScope.globals.currentUser) {
	 	var socket = io.connect('http://127.0.0.1');
	 	var x = $(window).width();
	 	var currentUrl = $location.path();

	 	/* Function vm */
	 		$scope.my_id = $rootScope.globals.currentUser.id;
	 	    $scope.backPic = $rootScope.globals.currentUser.profile_cover;

	    /***   DATA ***/
            $scope.userOnlineName = $rootScope.globals.currentUser.first_name + ' ' + $rootScope.globals.currentUser.last_name;
            $scope.currentUsername = $rootScope.globals.currentUser.username;

		$scope.onlineUser = $stateParams.userOn;
		$scope.newMessageArea = {};

	 	$scope.scrollDownMessage = function() {
	 		setTimeout(function() {
				var h = document.getElementById('mcb');
			    if (h !== null)
			    {
				h.scrollTop = h.scrollHeight;
			    }
			}, 500);
	 	};

	 	/*** MOBILE ***/
	 	if (x < 736) {
	 		$rootScope.$watch('dialogueMM', function(value) {
		 		if(value)
		 			$scope.showMessage(value);
		 	});
	 	}

	 	/***	EVENT	***/	
	 	$scope.keyPress = function(keycode, username, nameuser) {
	 		if (keycode == 13) {
	 			$scope.socket(username, nameuser);
	 			$scope.scrollDownMessage();
	 		}
	 	};

	 	socket.emit('register', $scope.userOnlineName);

	 	socket.on('userOnline', function(data){
	 	 	$scope.onlineUser = data;
	 	 	// io.getUserOnline(data);
	 	 	$scope.checkOnlineUser = true;
	 	 	$scope.$apply();
	 	});

	 	// $scope.$on("$destroy", function(){ 
	 	// 	socket.emit('disconnect', $scope.userOnlineName);
	 	// 	socket.close();
	 	// });

	 	var i;
	 	var redirectParams = $stateParams.input || false;

	 	i = !redirectParams ? 0 : 1;

	 	$scope.refreshDialogue = function(check) { // main function to retrieve all $parent.dialogues within last information
	 		if (x < 736) {
		 	 	$http.get('/messages/get/all').success(function(res){ // get all dialogues of user
			 		if (res.success) {
			 			Users.count();
			 			$scope.$parent.dialogues = res.topic;
			 			if ((i === 0 && $scope.$parent.dialogues[0]) || check) {

			 				$scope.showMessage($scope.$parent.dialogues[0]);
			 				i = 1;
			 			}
			 			if (redirectParams) {
			 				$scope.showMessage(redirectParams);
			 				redirectParams = null;
			 			}
			 			$scope.scrollDownMessage();
			 		}
			 	});
			} else {
				$http.get('/messages/get/all').success(function(res){ // get all dialogues of user
			 		if (res.success) {
			 			Users.count();
			 			$scope.dialogues = res.topic;
			 			if ((i === 0 && $scope.dialogues[0]) || check) {
			 				$scope.showMessage($scope.dialogues[0]);
			 				i = 1;
			 			}
			 			if (redirectParams) {
			 				$scope.showMessage(redirectParams);
			 				redirectParams = null;
			 			}
			 			$scope.scrollDownMessage();
			 		}
			 	});
			}
		};
		if (currentUrl === '/messages') {
			$scope.refreshDialogue();
		}

	 	$scope.showMessage = function(dialogue) { // show all messages between current user and client
	 		// if (!$scope.checkOnlineUser) {
		 		if (x <= 736) {
			 		$scope.tab = dialogue.id;
			 		if (dialogue.sender !== $scope.userOnlineName && !$scope.c) { // take off notification when click on it
			 			$http.put('/messages/', {id : dialogue.id}).success(function(res){
			 				if (res.success) {
			 					Users.count();
			 					$scope.refreshDialogue();
			 				}
			 			});
			 		}

			 		$http.get('/messages/' + dialogue.id).success(function(res){
			 			if (res.success) {
			 				var last 							= res.messages[res.messages.length - 1];
			 				$scope.$parent.messages				= res.messages;
			 				$scope.$parent.name 				= res.name.first_name;
			 				$scope.$parent.username 			= res.name.first_name + ' ' + res.name.last_name;
			 				$scope.$parent.nameuser 			= res.name.username,
			 				$scope.$parent.profile_my_picture 	= res.picture.my_picture;
			 				$scope.$parent.profile_user_picture = res.picture.user_picture;
			 				$scope.$parent.c 					= 0;
			 				$scope.$parent.show 				= true;
			 			}
			 			$scope.$parent.offMessages = [];
			 		});
			 	} else {
			 		$scope.tab = dialogue.id;

			 		if (dialogue.sender !== $scope.userOnlineName && !$scope.c) { // take off notification when click on it
			 			$http.put('/messages/', {id : dialogue.id}).success(function(res){
			 				if (res.success) {
			 					Users.count();
			 					$scope.refreshDialogue();
			 				}
			 			});
			 		}

			 		$http.get('/messages/' + dialogue.id).success(function(res){
			 			if (res.success) {
			 				var last 							= res.messages[res.messages.length - 1];
			 				$scope.messages				= res.messages;
			 				$scope.name 				= res.name.first_name;
			 				$scope.username 			= res.name.first_name + ' ' + res.name.last_name;
			 				$scope.nameuser 			= res.name.username,
			 				$scope.profile_my_picture 	= res.picture.my_picture;
			 				$scope.profile_user_picture = res.picture.user_picture;
			 				$scope.c 					= 0;
			 				$scope.show 				= true;
			 			}
			 			$scope.offMessages = [];
			 		});
			 	}
			// } else {
			// 	$scope.checkOnlineUser;
			// }
	 	};

	 	$scope.transformHtml = function(html) {
	 		return $sce.trustAsHtml(html);
	 	};

	 	$scope.showHomeMobile = function() {
	 		window.location.href = "http://127.0.0.1";
	 	};

	 	$scope.deleteMessage = function() {
	 		$http.put('/messages/delete', $scope.messages).success(function(res) {
	 			$scope.refreshDialogue();
	 			$state.reload();
	 		});
	 	};

	 	/***   MODAL   ***/
	 	$scope.$on("message-params", function(event, params) {
	 		$scope.searchArea(params.profile, params.user_id, params.username);
	 	});

	 	Users.getUsers().then(function (resource) {
			$scope.profiles = resource;
		});

		$scope.getListUser = function() {
			$http.post('/profileId/' + $rootScope.globals.currentUser.id).success(function(res) {
				$scope.checkId = res.content.profile_id;
			});
		}

		$scope.searchArea = function(profile, user_id, username) { // modal new message
			$scope.newMessageArea = {
				first_name: profile.first_name,
				last_name: profile.last_name,
			};
			$scope.createName = profile.first_name + ' ' + profile.last_name;
			$scope.Pi = user_id;
		 	$scope.pUser = username;

		};

		$scope.acceptHelpMessage = function(index, m_id, check, to_user_id, project_id) {
			$scope.messages[index].ask_for_help = 0;

			if (check) {
				$http.put('/messages/ask/accept', {id: m_id, check: check}).success(function(res) {
					if (res.success) {
						$scope.newMessageArea.message = "<i>... " + $rootScope.globals.currentUser.first_name + " accepted your request. Let's chat</i> <br />";
						$scope.Pi = to_user_id;
						$scope.checkAccept = true;
						$scope.createNewMessage(false);
					}
				});
				$http.post('/contributor/project', {project_id: project_id, user_id: $scope.my_id, contributor_check: 1});
				return ;	
			} else {
				$http.put('/messages/ask/accept', {id: m_id, check: check});
				$http.post('/contributor/project', {project_id: project_id, user_id: $scope.my_id, contributor_check: 0});
			}
		};

		$scope.showAcceptItem = function(message) {
			if (message.accept_help === 0)
				return true;
			else if (message.accept_help === 1) {
				if (message.from_user_id === $scope.my_id)
					return false;
				else
					return true;
			} else 
				return false;
		};

		$scope.createNewMessage = function(modal) {
			if (!$scope.newMessageArea.message && !$scope.sendNeed)
				return ;
			if ($scope.sendNeed) {
				var needHelp = angular.element(pmnhelp).html();
				$scope.newMessageArea.message = $scope.newMessageArea.message ? $scope.newMessageArea.message : " ";
				needHelp = "<div id='pmnhelp' class='profile-message-needs'>" + "\n" + needHelp + "<i>" + $scope.newMessageArea.message + "</i>";

				$scope.infoMessage = {
					from_user_id	: $rootScope.globals.currentUser.id,
					to_user_id 		: $scope.Pi,
					message 		: needHelp,
					ask_project_id	: $scope.project_p_id,
					ask_for_help: 1,
					accept_help: 0
				}
			} else {

				if ($scope.checkAccept) {
					$scope.infoMessage = {
						from_user_id: $rootScope.globals.currentUser.id,
						to_user_id: $scope.Pi,
						message: $scope.newMessageArea.message,
						ask_for_help: 0,
						accept_help: 1
					}
					$scope.checkAccept = false;
				} else {
					$scope.infoMessage = {
						from_user_id: $rootScope.globals.currentUser.id,
						to_user_id: $scope.Pi,
						message: $scope.newMessageArea.message,
						ask_for_help: 0,
						accept_help: 0
					}
				}
			}

			if ($scope.onlineUser && $scope.onlineUser[$scope.createName] !== undefined) {
				$scope.socket($scope.createName, $scope.pUser);
			} else {
				if ($rootScope.globals.currentUser.id !== $scope.Pi) {	
				    $http.post('/messages', $scope.infoMessage).success(function(res) {
						if (res.success) {
							if (modal) {
								$rootScope.$emit('message-send', true);
								$('#messages-newpost-modal').hide();
				            	$('#messages-modal-newMessageArea').hide();
				            	$('#profile-modal-newMessageArea').hide();
				            	$('#project-modal-newMessageArea').hide();
				            	Users.count();
				            	$scope.refreshDialogue(modal);
				            	$timeout(function() {
				            		if ($('.main-discover-slick')) {
										$('.main-discover-slick').slick("unslick");
		            					$('.main-discover-slick').find('.slick-list').remove();
	            					}
								    $state.reload()
								}, 1000);
				            	return ;
							}
							Users.count();
						    $scope.refreshDialogue(true);
							$timeout(function() {
								if ($('.main-discover-slick')) {
									$('.main-discover-slick').slick("unslick");
	            					$('.main-discover-slick').find('.slick-list').remove();
	            				}
							    $state.reload()
							}, 1500);
						}
					});
				}
			}
		};

		// if ($stateParams.user_id) {
		// 	$scope.searchArea($stateParams.profile, $stateParams.user_id, $stateParams.username);
		// 	setTimeout(function() {
		// 		$('#messages-modal-newMessageArea').fadeIn(function() {
		// 			$('#messages-modal-searchArea').fadeOut(function(){
		// 				$('#messages-newpost-modal').fadeIn();
		// 			});
		// 		});
		// 	}, 300);
	 // 	}

		/***   SOCKET   ***/

		//*** All socket's scopes
		if (x <= 736) {
		 	$scope.$parent.liveMessages = [];
		 	$scope.$parent.offMessages = [];
		 } else {
		 	$scope.liveMessages = [];
		 	$scope.offMessages = [];
		 }

	 	//*** All socket's functions
	 	socket.on('send online', function(data){ // get all message data from sender online
	 		$scope.c = 1;
	 		if (data) {
	 			if ($rootScope.globals.currentUser.id === data.to_user_id)
	 				$scope.showMessage({id: data.from_user_id});
	 			else
	 				$scope.showMessage({id: data.to_user_id});
				$scope.refreshDialogue();
	 		}

		});

		socket.on('send offline', function(data) { // get all message data from sender offline
			if (data.success) {
				if (x <= 736)  {
					$scope.$parent.offMessages.push(data);
				}
				else
					$scope.offMessages.push(data);
				$scope.refreshDialogue();
			}
		});
		

	 	$scope.socket = function(username, nameuser) { // send message to a particular client 
	 		if ($scope.socket.message  || ($scope.newMessageArea && $scope.newMessageArea.message)) {
	 			if (username && nameuser && $rootScope.globals.currentUser){
	 				var msg;
		 			if ($scope.socket.message)
			 			msg = "/private " + $scope.socket.message;
			 		else
			 			msg = "/private " + $scope.newMessageArea.message;
			 	 	socket.emit('private message', {msg: msg, name: username, adresser: nameuser, sender: $rootScope.globals.currentUser.username});
			 	 	if (x <= 736) {
			 	 		$timeout(function() {
							$('.messages-body-conversation-mobile').scrollTop($('.messages-body-conversation-mobile')[0].scrollHeight);
						}, 200);
			 	 	}
			 	 	if ($scope.socket.message)
			 	 		delete $scope.socket.message;
			 	 	if ($scope.newMessageArea && $scope.newMessageArea.message)
			 	 		delete $scope.newMessageArea.message;
		 		}
		 	}
	 	};

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
	} else {
		if ($location.path() === "/messages") {
			$location.path('/login').replace();
		}
	}
}).directive('messageModal', function() {
	var x = $(window).width();

	if (x >= 736) {
		return {
			templateUrl: 'views/messaging/messaging.modals.view.client.html',
			restrict: "AE",
			link: function(scope, element, attr) {
				// var myelem = (angular.element(element.children()[0]));

				// myelem.on('click', function(e) {
				// 	var target = e.target.id;

				// 	if (target === "mmo") {
				// 		document.getElementById('messages-modal-searchArea').style.display = "none";
				// 		document.getElementById('messages-modal-newMessageArea').style.display = "block";
				// 	}
				// });
			}
		}
	}

	return {

	}
});
