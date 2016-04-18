/*****Socket*****/

module.exports = function(app, io, ensureAuth) {
    var users = {};

    if (!ensureAuth)
	return res.status(404).send('Must to be login');

    io.on('connection', function(socket) {
	if (!io.connected) io.connected = true;
	socket.on('disconnect', function(data) {
            //if (!socket.nickname) return ;
            delete users[socket.nickname]; // delete user in the online users' list when the user is disconnect
            socket.broadcast.emit('userOnline', users);
	});

	/*** Register Users ***/
	socket.on('register', function(username){ // save all users connected on socket
	    if (username in users) { // check if user is already exist
	    	socket.broadcast.emit('userOnline', users); // Get Users Online
	    } else {
			socket.nickname = username;
			users[socket.nickname] = socket.id;
			updateNicknames();
	    }
	});

	updateNicknames = function() { // show all online users and update it
        var nicknames = JSON.stringify(users);
        socket.emit('userOnline', users);
        socket.broadcast.emit('userOnline', users);
    };

	/*** View Notification ***/
	socket.on('view-notification', function(view_user) {
	    if (view_user) {
		pool.query('SELECT id, CASE username WHEN ? THEN 1 WHEN ? THEN 2 END AS myorder FROM users WHERE username IN (?, ?) ORDER BY myorder',
			   [view_user.viewer, view_user.viewed, view_user.viewer, view_user.viewed],
			   function(err, data) {
			       if (err) throw err;
			       if (data[0] && data[1]) {
				   pool.query('SELECT * FROM views WHERE user_id = ? && user_viewed_id = ?',
					      [data[1].id, data[0].id], function(err, rows) {
						  if (err) throw err;
						  if (!rows.length) {
						      pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [data[0].id], function(err, name) {
							  pool.query('INSERT INTO views SET ?', {
							      user_id               : data[1].id,
							      user_viewed_id        : data[0].id,
							      user_viewed_username  : name[0].first_name + " " + name[0].last_name,
							  }, function(err, result){
							      if (err) throw err;
							      socket.broadcast.emit('view-notification', "get notif");
							  });
						      });
						  } else {
						      pool.query('UPDATE views SET view = view + ? WHERE user_id = ? && user_viewed_id = ?',
								 [1, data[0].id, data[1].id],
								 function(err, result) {
								     if (err) throw err;
								 });
						  }
					      });
			       }
			   });
	    }
	});

	/*** Follow User Notification ***/
	app.post('/follow/user/:username', ensureAuth, function(req, res){
            req.checkParams('username', 'id parameter must be an integer.').isString().min(1);
            var errors = req.validationErrors(true);
            if (errors) {
		return res.status(400).send(errors);
            } else {
		pool.query("SELECT id FROM users WHERE username = ?", req.params.username, function(err, data) {
		    if (data[0]) {
			if (data[0].id !== req.user.id) {
			    pool.query('SELECT * FROM user_followers WHERE user_id = ? && follow_user_id = ?', [req.user.id, data[0].id],
				       function(err, rows) {
					   if (err) throw err;
					   if (!rows.length) {
					       pool.query("SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", [req.user.id],
							  function(err, result) {
							      if (err) throw err;
							      var name = result[0].first_name + " " + result[0].last_name;
							      pool.query("INSERT INTO `user_followers` (`user_id`, `user_username`, `follow_user_id`) VALUES (?, ?, ?)",
									 [req.user.id, name, data[0].id],
									 function (err, results, fields) {
									     if(err) throw err;
									     socket.broadcast.emit('follow-notification', "get notif");
									     socket.broadcast.emit('my-follow-users', req.user.id);
									     res.send({success: true, msg: "User followed"});
									 });
							  });
					   } else {
					       pool.query("DELETE FROM user_followers WHERE user_id = ? && follow_user_id = ?",
							  [req.user.id, data[0].id], function(err, result) {
							      if (err) throw err;
							      res.send({success: true, msg: "User unfollowed"});
							      socket.broadcast.emit('follow-notification', "get notif");
							  });
					   }
				       });
			} else
			    res.send({success: false, object: "you can not follow yourself"});
		    } else
			res.send({success: false, object: "user not found"});
		});
	    }
	});

	/*** Follow Project Notification ***/
	app.put('/follow/project/:id', function(req, res){
        req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
        var errors = req.validationErrors(true);
        if (errors) {
            return res.status(400).send(errors);
        } if (!req.isAuthenticated()) {
            return res.status(400).send({message: 'User need to be logged'});
        } else {
            pool.query("SELECT id, title FROM projects WHERE public_id = ?", [req.params.id], function (err, id) {
                if (err) throw err;
                pool.query("SELECT * FROM project_followers WHERE user_id = ? && follow_project_id = ?", [req.user.id, id[0].id],
                function(err, row) {
                    if (err) throw err;
                    if (!row[0]) {
                        pool.query("SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", [req.user.id],
                        function(err, name) {
                            if (err) throw err;
                            var fullName = name[0].first_name + " " + name[0].last_name;
                            pool.query("INSERT INTO `project_followers` (`user_id`, `follow_project_id`, user_name, follow_project_title, follow_project_public_id) VALUES (?, ?, ?, ?, ?)",
                            [req.user.id, id[0].id, fullName, id[0].title, req.params.id,],
                            function (err, results, fields) {
                                if(err) throw err;
                                socket.broadcast.emit('follow-project-notification', "user follow project");
                                socket.broadcast.emit('my-follow-users', req.user.id);
                                res.send({success: true, msg: "Project followed"});
                            });
                        });
                    } else {
                        pool.query("DELETE FROM `project_followers` WHERE `user_id` = ? AND `follow_project_id` = ?", [req.user.id, id[0].id],
                        function(err, results) {
                            if (err) throw err;
                            socket.broadcast.emit('follow-project-notification', "user unfollow project");
                            res.send({success: true, msg: "Project unfollowed"});
                        });
                    }
                });
            });
        }
	});

	/*** Involve User in Project Notification ***/
	app.post('/project/involve', ensureAuth, function(req, res){
	    req.checkBody('project_id', 'Project id must be an integrer').isInt().min(1);
	    req.checkBody('user_id', 'User_id must be an integrer').isInt().min(1);
	    var errors = req.validationErrors(true);

	    if (errors) {
	    	return res.status(400).send(errors);
	    } else {
	        req.body.invited_by = req.user.id;
	   	    pool.query("INSERT into project_users set ?",
    	    req.body,
	        function(err, result) {
	      		if (err) {
	        		console.log(new Date());
	        		console.log("Error getting projects in projects.js/involvedUserInProject" + "\n");
	        		 throw err;
	        	}
	        	socket.broadcast.emit('involve-notification', 'involve project');
	        	res.send(result);
	    	});
	    }
	});

	/*** Send Private Message ***/
	socket.on('private message',  function (data) { // private message between users
	    var msg = data.msg.trim(); // clear all whitespace of the end and the begining
	    if (msg.substring(0, 9) === '/private '){ // check private
		msg = msg.substr(9);
		var username = data.adresser; // get username of destination
		// msg = msg.substring(msg.indexOf(' ') + 1);
		var names = {
                    senderName          : data.sender,
                    addresserName       : data.adresser,
		}
		if (username in users) { // check if username is in the list of online user
		    saveMessage(names, msg, function(infoMessage){
			socket.emit("send online", infoMessage); // display message to current user
			socket.broadcast.to(users[username]).emit("send online", infoMessage); // send message to the id corresponding to the username
			socket.broadcast.emit('notification', "notif");
		    });
		} else { // when user is offline, save message to the database
		    saveMessage(names, msg, function(infoMessage) {
			socket.emit('send offline', infoMessage);
			//socket.broadcast.emit("send offline", infoMessage); // display message
			socket.broadcast.emit('notification', "notif");
		    });
		}
	    };
	});
    });

    function saveMessage(names, message, callback) { // save message into the database
	pool.query('SELECT id, profile_id, CASE username WHEN ? then 1 WHEN ? then 2 END AS myorder FROM users WHERE username IN (?, ?) ORDER BY myorder',
		   [names.senderName, names.addresserName, names.senderName, names.addresserName],
		   function(err, data) {
		       if (err) throw err;
		       if (data[0] && data[1]) {
				    pool.query('SELECT first_name, last_name, profile_picture_icon, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM profiles WHERE id in (?, ?) ORDER BY myorder',
						[data[0].profile_id, data[1].profile_id, data[0].profile_id, data[1].profile_id],
						function(err, result) {
						    var parent = data[0].id + data[1].id;
						    var infoMessage = {
							from_user_id     : data[0].id,
							from_username    : result[0].first_name + ' ' + result[0].last_name,
							to_user_id       : data[1].id,
							to_username      : result[1].first_name + ' ' + result[1].last_name,
							parent_id        : parent,
							message          : message
						    };
						    pool.query('INSERT INTO messages SET ?', infoMessage, function(err, done) {
							if (err) throw err;
							infoMessage.from_picture= result[0].profile_picture_icon;
							infoMessage.date		= new Date();
							infoMessage.success		= true;
							callback(infoMessage);
						    });
						});
		       }
		   });
    };
};
