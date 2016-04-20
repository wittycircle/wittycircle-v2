'use strict';

/**
 * @ngdoc function
 * @name wittyApp.controller:SettingCtrl
 * @description
 * # MessageCtrl
 * Controller of the wittyApp
 **/

 angular.module('wittyApp')
 	.controller('MessageCtrl', function($http, $scope, $modal, $rootScope, $state, $stateParams, Users, $timeout) {

 	var socket = io.connect('/');

 	/* Function vm */

	if ($rootScope.globals.currentUser) {
 	    $scope.my_id = $rootScope.globals.currentUser.id;
 	    $scope.backPic = $rootScope.globals.currentUser.profile_cover;

	    /***   DATA ***/
            $scope.userOnlineName = $rootScope.globals.currentUser.first_name + ' ' + $rootScope.globals.currentUser.last_name;
            $scope.currentUsername = $rootScope.globals.currentUser.username;
	}
	$scope.onlineUser = $stateParams.userOn;

 	function scrollDownMessage() {
 		setTimeout(function() {
			var h = document.getElementById('mcb');
			if (h) {
				h.scrollTop = h.scrollHeight;
			}
		}, 500);
 	};

 	/***	EVENT	***/	
 	$scope.keyPress = function(keycode, username, nameuser) {
 		if (keycode == 13) {
 			$scope.socket(username, nameuser);
 			scrollDownMessage();
 		}
 	};

 	socket.emit('register', $scope.userOnlineName);

 	socket.on('userOnline', function(data){
 	 	$scope.onlineUser = data;
 	 	// io.getUserOnline(data);
 	 	$scope.refreshDialogue();
 	});

 	// $scope.$on("$destroy", function(){ 
 	// 	socket.emit('disconnect', $scope.userOnlineName);
 	// 	socket.close();
 	// });

 	var i = 0;
 	var redirectParams = $stateParams.input;
 	$scope.refreshDialogue = function(check) { // main function to retrieve all dialogues within last information
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
	 			scrollDownMessage();
	 		}
	 	});
	};
	$scope.refreshDialogue();

 	$scope.showMessage = function(dialogue) { // show all messages between current user and client
 		$scope.tab = dialogue.id;
 		var url = '/messages/' + dialogue.id;

 		if (dialogue.sender !== $scope.userOnlineName && !$scope.c) { // take off notification when click on it
 			$http.put('/messages/', {id : dialogue.id}).success(function(res){
 				console.log(res);
 				if (res.success) {
 					Users.count();
 					$scope.refreshDialogue();
 				}
 			});
 		}

 		$http.get(url).success(function(res){
 			if (res.success) {
 				var last 					= res.messages[res.messages.length - 1];
 				$scope.$parent.messages		= res.messages;
 				$scope.$parent.name 				= res.name.first_name;
 				$scope.$parent.username 			= res.name.first_name + ' ' + res.name.last_name;
 				$scope.$parent.nameuser 			= res.name.username,
 				$scope.$parent.profile_my_picture 	= res.picture.my_picture;
 				$scope.$parent.profile_user_picture = res.picture.user_picture;
 				$scope.$parent.c 					= 0;
 				$scope.$parent.show 				= true;
 				console.log($scope.$parent.messages);
 			}
 			$scope.offMessages = [];
 		});
 	};

 	$scope.deleteMessage = function() {
 		$http.put('/messages', $scope.messages).success(function(res) {
 			$scope.refreshDialogue();
 			$state.reload();
 		});
 	};

 	/***   MODAL   ***/
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

	$scope.createNewMessage = function() {
		$scope.infoMessage = {
			from_user_id: $rootScope.globals.currentUser.id,
			to_user_id: $scope.Pi,
			message: $scope.newMessageArea.message
		}
		if ($scope.onlineUser && $scope.onlineUser[$scope.createName] !== undefined) {
			$scope.socket($scope.createName, $scope.pUser);
		} else {
			if ($rootScope.globals.currentUser.id !== $scope.Pi) {
				$http.post('/messages', $scope.infoMessage).success(function(res){
					if (res.success) {
						Users.count();
						$scope.refreshDialogue(true);
					}
				});
			}
		}
	};

	if ($stateParams.profile_id) {
		$scope.searchArea($stateParams.profile_id);
		setTimeout(function() {
			$('#messages-modal-newMessageArea').fadeIn(function() {
				$('#messages-modal-searchArea').fadeOut(function(){
					$('#messages-newpost-modal').fadeIn();
				});
			});
		}, 300);
 	}

	/***   SOCKET   ***/

	//*** All socket's scopes
 	$scope.liveMessages = [];
 	$scope.offMessages = [];

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
		 	 	if ($scope.socket.message)
		 	 		delete $scope.socket.message;
		 	 	if ($scope.newMessageArea && $scope.newMessageArea.message)
		 	 		delete $scope.newMessageArea.message;
	 		}
	 	}
 	};
});