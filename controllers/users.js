var bcrypt = require('bcrypt-nodejs');
var mandrill = require('mandrill-api/mandrill');


exports.checkFirstLog = function(req, res) {
    pool.query('SELECT value FROM first_log WHERE user_id = ?', req.user.id,
	       function(err, result) {
		   if (err) throw err;
		   res.send(result[0]);
	       });
};

exports.updateFirstLog = function(req, res) {
    pool.query('UPDATE first_log SET value = 1 WHERE user_id = ?', req.user.id,
	       function(err, result) {
		   if (err) throw err;
		   res.send({success: true});
	       });
};

exports.getUserIdByProfileId = function(req, res) {
    pool.query('SELECT id, username FROM users WHERE profile_id = ?', req.params.profile_id, function(err, data) {
	if (err) throw err;
	res.send({success: true, userId: data[0]});
    });
};

exports.getProfilesByProfileId = function(req, res) {
    pool.query('SELECT *  FROM profiles WHERE id = ?', req.params.profile_id, function(err, data) {
	if (err) throw err;
	res.send({success: true, content: data[0]});
    });
};

exports.getProfileIdByUserId = function(req, res) {
    pool.query('SELECT profile_id FROM users WHERE id = ?', req.params.user_id, function(err, data) {
	if (err) throw err;
	res.send({success: true, content: data[0]});
    });
};

exports.getUsers = function(req, res){
    pool.query('SELECT id, profile_id FROM `users`',
    function (err, results, fields) {
        if(err){
            throw err;
        }
        function recursive(index){
            if (results[index]) {
                pool.query('SELECT * FROM `profiles` WHERE `id` = ?', [results[index].profile_id],
                function (err, result, field) {
                    if(err){
                        throw err;
                    }
                    results[index].profile = result;
                    recursive(index + 1);
                });
            } else
                res.send(results);
        }
        recursive(0);
    });
};

exports.getProfiles = function(req,res){
    pool.query('SELECT * FROM `profiles` ORDER BY views DESC', function (err, results) {
	if (err) throw (err);
	else
	    res.send(results);
    });
};

exports.getUser = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT `id`, `profile_id` FROM `users` WHERE `id` = ?',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            if (results[0]) {
	            function recursive(index){
	                if(index !== results.length){
	                    pool.query('SELECT * FROM `profiles` WHERE `id` = ?',
	                    [results[index].profile_id],
	                    function (err, result, field) {
	                        if(err){
	                            throw err;
	                        }
	                        results[index].profile = result;
	                        recursive(index + 1);
	                    });
	                } else {
			    pool.query('SELECT id, email, username FROM `users` WHERE `id` = ?', [req.params.id], 
				       	function(err, data) {
				       		if (data[0])
					   			res.send({success: true, profile: results[0].profile[0], data: data[0]});
				       	});
	                }
	            }
	            recursive(0);
	        }
        });
    }
};

function sortCardProfile(req, data, callback) {
    if (data[0]) {
		var newCardProfile = [];
		function recursive(index) {
		    if (data[index]) {
				pool.query('SELECT count(*) as followers FROM user_followers WHERE follow_user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
				    function(err, followers) {
				        if (err) throw err;
				        pool.query('SELECT count(*) as following FROM user_followers WHERE user_id IN (SELECT id FROM users WHERE profile_id = ?)', data[index].id,
						    function(err, following) {
								if (err) throw err;
								pool.query('SELECT id FROM users WHERE profile_id = ?', data[index].id,
									function(err, row) {
										if (err) throw err;
										if (row[0]) {
											data[index].followers = followers[0].followers;
											data[index].following = following[0].following;
											data[index].user_id 	= row[0].id;
											newCardProfile.push(data[index]);
											recursive(index + 1);
										} else
											recursive(index + 1);
								});
						});
				});
		    } else
				callback(newCardProfile);
		};
		recursive(0);
    }
};

exports.getCardProfile = function(req, res) {
    pool.query('SELECT * FROM `profiles` ORDER BY views DESC', function (err, results) {
        if (err) throw (err);
	sortCardProfile(req, results, function(array) {
	    res.send({success: true, data: array});
	});
    });
};

exports.getUserbyEmail = function(req, res){
    req.checkParams('email', 'email parameter must be an integer.').isString().max(128).min(1);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT `id`, `profile_id` FROM `users` WHERE `email` = ?',
        [req.params.email],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            function recursive(index){
                if(index !== results.length){
                    pool.query('SELECT * FROM `profiles` WHERE `id` = ?',
                    [results[index].profile_id],
                    function (err, result, field) {
                        if(err){
                            throw err;
                        }
                        results[index].profile = result;
                        recursive(index + 1);
                    });
                } else {
                    res.send(results);
                }
            }
            recursive(0);
        });
    }
};

exports.getUserbyUsername = function(req, res){
    req.checkParams('username', 'username must be a string.').isString().max(128).min(1);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `users` WHERE `username` = ?',
        [req.params.username],
        function (err, results, fields) {
            if(err){
		        throw err;
            }
            function recursive(index){
                if(index !== results.length){
                    pool.query('SELECT * FROM `profiles` WHERE `id` = ?',
                    [results[index].profile_id],
                    function (err, result, field) {
                        if(err){
                            throw err;
                        }
                        results[index].profile = result;
                        recursive(index + 1);
                    });
                } else {
                    res.send(results);
                }
            }
            recursive(0);
        });
    }
};

exports.updateProfileView = function(req, res) {
	req.checkParams('username', 'username must be a string').isString().min(1).max(128);
	var errors = req.validationErrors(true);
	if (errors) return res.status(400).send(errors);
	else {
		pool.query('UPDATE profiles SET views = views + 1 WHERE id in (SELECT profile_id FROM users WHERE username = ?)', [req.params.username],
		   function(err, result) {
		       if (err) throw err;
		       res.send({success: true});
		});
	}
};

exports.searchUser = function(req, res){
    req.checkParams('search', 'Search must be a string between 1 and 128 characters.').isString().max(128).min(1);
    req.sanitize('search').Clean();
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `profiles` WHERE `first_name` LIKE '%" + req.params.search + "%' OR `last_name` LIKE '%" + req.params.search + "%'",
        function (err, results, fields) {
            if(err){
                throw err;
            }
            function recursive(index){
                if(index !== results.length){
                    pool.query("SELECT `id`, `profile_id` FROM `users` WHERE `profile_id` = ? ",
                    [results[index].id],
                    function (err, result, field) {
                        if(err){
                            throw err;
                        }
                        results[index].user = result;
                        recursive(index + 1);
                    });
                } else {
                    res.send(results);
                }
            }
            recursive(0);
        });
    }
};

exports.createUser = function(req, res){
    /* Validate */
    req.checkBody('email', 'E-Mail is already in used.').isUnique('email');
    req.checkBody('email', 'E-Mail is not valid.').isString().isEmail().min(2).max(64);
    req.checkBody('password', 'Password must be between 5 and 32 characters.').isString().min(5).max(32);
    req.checkBody('first_name', 'First Name must be between 1 and 64 characters.').isString().min(1).max(64);
    req.checkBody('last_name', 'Last Name must be between 1 and 64 characters.').isString().min(1).max(64);
//    req.checkBody('username', 'Username is already used.').isUnique('username', 'users');
//    req.checkBody('username', 'Username is not valid.').isString().min(4).max(32);

    /* Sanitize */
    req.sanitize('email').Clean();
    req.sanitize('password').trim();
    req.sanitize('first_name').Clean(true);
    req.sanitize('last_name').Clean(true);
//    req.sanitize('username').Clean(true) ;

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    pool.query('SELECT * FROM users WHERE email = ?', req.body.email,
	       function(err, result) {
		   if (err) throw err;
		   if (!result[0]) {
			   var username1 = [];
			   var firstName = req.body.first_name.replace(/\s+/g, '');
			   var lastName = req.body.last_name.replace(/\s+/g, '');
			   for (var i = firstName.length; i > 0; i--) {
			       username1.push(firstName.slice(0, i) + '.' + lastName);
			   };
			   for (var i = lastName.length - 1; i > 0; i--) {
			       username1.push(firstName + '.' + lastName.slice(0, i));
			   }
			   //shasum = crypto.createHash('sha1');
			   //shasum.update(req.body.password);

			   pool.query('INSERT INTO `profiles` SET ?', {
			       first_name: req.body.first_name,
			       last_name: req.body.last_name
			   } , function(err, result) {
			       if (err) {
				   throw err;
			       } else {
				   //		pool.query('SELECT `id`  FROM `users` WHERE `username` = ?', [username1[username1.length - 1]], function(err, result){

				   function recursive(index) {
				       if (username1[index]) {
					   checkUsername(username1[index], function(data) {
					       if (data.length <= 0) {
						   pool.query('INSERT INTO `users` SET ?', {
						       profile_id: result.insertId,
						       email: req.body.email,
						       username: username1[index],
						       password: bcrypt.hashSync(req.body.password)
						       //password: shasum.digest('hex')
						   }, function(err, result) {
						       if (err) throw err;
						       pool.query('UPDATE profiles SET username = ? WHERE id = ?', [username1[index], result.insertId],
								  function(err, success) {
								        if (err) throw err;
										res.send({success: true, result: result});
								  });
						   });
					       }
					       else {
						   recursive(index + 1);
					       }
					   });
				       }
				       else {
					   var random_number = Math.floor((Math.random() * 10000) + 1);
					   username1 = [firstName + '.' + lastName + random_number];
					   recursive(0);
				       }
				   }
				   recursive(0);
			       }
			   });

			   function checkUsername(value, callback) {
			       pool.query('SELECT `id`  FROM `users` WHERE `username` = ?', [value], function(err, result){
				   if (err) {
				       throw err;
				   }
				   return callback(result);
			       });
			   };

			   var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

			   var template_name = "welcome";
			   var template_content = [{
			       "name": "welcome",
			       "content": "content",
			   }];

			   var message = {
			       "html": "<p>HTML content</p>",
			       "subject": "Welcome to Wittycircle",
			       "from_email": "noreply@wittycircle.com",
			       "from_name": "Wittycircle",
			       "to": [{
				   "email": req.body.email,
				   "name": req.body.first_name,
				   "type": "to"
			       }],
			       "headers": {
				   "Reply-To": "message.reply@example.com"
			       },
			       "important": false,
			       "track_opens": null,
			       "track_clicks": null,
			       "auto_text": null,
			       "auto_html": null,
			       "inline_css": null,
			       "url_strip_qs": null,
			       "preserve_recipients": null,
			       "view_content_link": null,
			       "tracking_domain": null,
			       "signing_domain": null,
			       "return_path_domain": null,
			       "merge": true,
			       "merge_language": "mailchimp",
			       "global_merge_vars": [{
				   "name": "merge1",
				   "content": "merge1 content"
			       }],
			       "merge_vars": [
				   {
				       "rcpt": req.body.email,
				       "vars": [
					   {
					       "name": "fname",
					       "content": req.body.first_name
					   },
					   {
					       "name": "lname",
					       "content": "Smith"
					   }
				       ]
				   }
			       ]
			   };

			   var async = false;
			   /*mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
			       var date = new Date();
			       console.log("MAIL at " + date + ":" + "\n" + "A new mail was sent to " + req.body.email);
			       console.log("response is:");
			       console.log(result);
			   }, function(e) {
			       // Mandrill returns the error as an object with name and message keys
			       console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
			       // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
			   });*/
		   } else
		       res.send({sucess: false, msg: 'Email is already taken'});
	       });
};

exports.updateUser = function(req, res){
    //var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    //req.checkParams('id', 'id parameter must be current logged user.').isLoggedUser(req);
    req.checkBody('email', 'E-Mail is not valid.').isString().isEmail().min(2).max(64);
    req.checkBody('username', 'Username is not valid.').isString().min(2).max(64);
    req.checkBody('first_name', 'First Name must be between 1 and 64 characters.').isString().min(1).max(64);
    req.checkBody('last_name', 'Last Name must be between 1 and 64 characters.').isString().min(1).max(64);
    req.checkBody('profession', 'Profession must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('description', 'Profession must be between 1 and 512 characters.').optional().isString().min(1).max(512);
    req.checkBody('location_city', 'City must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('location_country', 'Country must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('website_url', 'Website URL must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('facebook_url', 'Facebook URL must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('twitter_url', 'Twitter URL must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('google_url', 'Google URL must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('linkedin_url', 'LinkedIn URL must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('about', 'About Text is limited to 10000 characters.').optional().isString().min(1).max(10000);
    req.checkBody('genre', 'Genre must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    req.checkBody('birthdate', 'Birthdate must be between 1 and 64characters.').optional().isString().min(1).max(64);

    req.sanitize('email').Clean(true);
    req.sanitize('username').Clean(true);
    //req.sanitize('first_name').Clean(true);
    //req.sanitize('last_name').Clean(true);
    req.sanitize('profession').Clean(true);
    req.sanitize('description').Clean(true);
    req.sanitize('location_city').Clean(true);
    req.sanitize('location_country').Clean(true);
    req.sanitize('website_url').Clean();
    req.sanitize('facebook_url').Clean();
    req.sanitize('twitter_url').Clean();
    req.sanitize('google_url').Clean();
    req.sanitize('linkedin_url').Clean();
    req.sanitize('about').Clean(true);
    req.sanitize('genre').Clean(true);
    req.sanitize('birthdate').Clean();

    var errors		= req.validationErrors(true);
    var newInfo		=  {
	email	: req.body.email,
	username: req.body.username
    };
    var newName		= {
	first_name	: req.body.first_name,
	last_name	: req.body.last_name
    };

    if (errors) return res.status(400).send(errors);
    if ((req.user.username !== req.body.username) || (req.user.email !== req.body.email)) {
	pool.query('SELECT * FROM users WHERE email = ?', req.body.email,
		   function (err, check1) {
		       if (err) throw err;
		       pool.query('SELECT * FROM users WHERE username = ?', req.body.username,
				  function (err, check2) {
				      if (err) throw err;
				      if (check1[0] && check2[0] && check1[0].email === req.user.email && check2[0].username === req.user.username) {
						  pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newInfo, function(err, done) {
						      if (err) throw err;
						      pool.query('UPDATE `profiles` SET ? WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ' + req.params.id + ')', newName,
								 function(err, result) { // updating profile user from the variable newName
								     if (err) throw err;
								     req.user.email = req.body.email;
								     req.user.username = req.body.username;
								     res.send({result: result, success: true, data: req.user});
								 });
						  });
				      } else if (check2[0] && !check1[0] && check2[0].username === req.user.username) {
				      	pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newInfo, function(err, done) {
						      if (err) throw err;
						      pool.query('UPDATE `profiles` SET ? WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ' + req.params.id + ')', newName,
								 function(err, result) { // updating profile user from the variable newName
								     if (err) throw err;
								     req.user.email = req.body.email;
								     req.user.username = req.body.username;
								     res.send({result: result, success: true, data: req.user});
								 });
						  });

				      } else if (check1[0] && !check2[0] && check1[0].email === req.user.email) {
				      	pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newInfo, function(err, done) {
						      if (err) throw err;
						      pool.query('UPDATE `profiles` SET ? WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ' + req.params.id + ')', newName,
								 function(err, result) { // updating profile user from the variable newName
								     if (err) throw err;
								     req.user.email = req.body.email;
								     req.user.username = req.body.username;
								     res.send({result: result, success: true, data: req.user});
								 });
						  });
				      } else if (!check1[0] && !check2[0]) {
				      	pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newInfo, function(err, done) {
						      if (err) throw err;
						      pool.query('UPDATE `profiles` SET ? WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ' + req.params.id + ')', newName,
								 function(err, result) { // updating profile user from the variable newName
								     if (err) throw err;
								     req.user.email = req.body.email;
								     req.user.username = req.body.username;
								     res.send({result: result, success: true, data: req.user});
								 });
						  });
				      }else {
				      	console.log("ERROR");
							if (check1[0] && req.user.email !== req.body.email) {
								return res.send({success: false, msg: 'Email already in use'});
							}
							else {
								return res.send({success: false, msg: 'Username already in use'});
							}
				      }
				  });
		   });
    }
    else {
	pool.query('UPDATE `profiles` SET ? WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ' + req.params.id + ')', newName,
		   function(err, result) { // updating profile user from the variable newName
		       if (err) throw err;
		       res.send({result: result, success: true, data: req.user});
		   });
    }
};

exports.updateUserCredentials = function(req, res){
    //var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    //req.checkParams('id', 'id parameter must be current logged user.').isLoggedUser(req);
    req.checkBody('email', 'E-Mail is already in used.').isUnique('email', 'users');
    req.checkBody('email', 'E-Mail is not valid.').isString().isEmail().min(2).max(64);
    req.checkBody('password', 'Password must be between 8 and 32 characters.').optional().isString().min(8).max(32);

  /*  req.sanitize('email').Clean(); */
    req.sanitize('password').trim();
    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } if (!req.isAuthenticated()) {
        return res.status(404).send({message: "not logged in"});
    } else {
	if (typeof req.body.password !== 'undefined'){
	    var newSetting = {
		password: bcrypt.hashSync(req.body.password),
		email: req.body.email
            };
	}
	if (!req.body.curentPass && !req.user.password && req.isAuthenticated()) {
	    pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newSetting,
                       function(err, result) {
                           if (err){
                               throw err;
                           }
                           res.send({success: true});
		       });
	} else {
	    if (bcrypt.compareSync(req.body.currentPass, req.user.password)) {
		pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newSetting,
			   function(err, result) {
			       if (err) throw err;
			       res.send({success: true});
			   });
	    } else {
		res.send({success: false});
	    }
	}
    }
};

exports.deleteUser = function(req, res){
    var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    req.checkParams('id', 'id parameter must be current logged user.').isLoggedUser(req);

    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query("DELETE FROM `profiles` WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE Id = ?)",
        [req.params.id],
        function(err, result) {
            if (err){
                throw err;
            }
            res.send({success: true, result: result});
        });
    }
};
