var bcrypt      = require('bcrypt-nodejs');
var mandrill    = require('mandrill-api/mandrill');
var pf          = require('../tools/profile_functions');
var mailchimp   = require('../mailchimpRequest');
var geo         = require('../tools/geolocation');
const crypto    = require('crypto');

exports.getUserShare = function(req, res) {
    req.checkParams('user_id', 'username must be an integer.').isInt();

    var errors = req.validationErrors(true);
    if (errors)
        return res.status(400).send(errors);
    else {
        pool.query('SELECT social_share FROM users WHERE id = ?', req.params.user_id,
            function(err, result) {
                if (err) throw err;
                if (!result[0].social_share)
                    return res.send({success: false})
                else
                    return res.send({success: true});
            });
    }
};

exports.updateUserShare = function(req, res) {

    req.checkParams('user_id', 'username must be an integer.').isInt();

    var errors = req.validationErrors(true);
    if (errors)
        return res.status(400).send(errors);
    else {
        pool.query('UPDATE users SET social_share = 1 WHERE id = ?', req.params.user_id,
            function(err, result) {
                if (err) throw err;
                else
                    return res.send({success: true});
            });
    }
};

exports.getUsersValidateMail = function (req, res) {
    pool.query('SELECT user_email from account_validation WHERE token = ?',
    req.params.token,
    function (err, result) {
        if (err) {
            console.log(new Date());
            throw err;
        } else {
            if (result.length !== 0) {
                return res.send(result[0]);
            } else {
                return res.status(404).send({message: 'no'});
            }
        }
    });
}

exports.ValidateAccount = function(req, res) {
    pool.query('SELECT token from account_validation WHERE token = ?',
    req.params.token,
    function (err, result) {
        if (err) {
            console.log(new Date());
            throw err;
        } if (result.length !== 0) {
            pool.query('UPDATE users SET valid = 1 WHERE email = ?',
            req.body.email,
            function (err, response) {
                if (err) {
                    console.log(new Date());
                    throw err;
                } else {
                    pool.query('DELETE FROM account_validation WHERE token = ?',
                    req.params.token,
                    function (err, data) {
                        if (err) {
                            console.log(new Date());
                            throw err;
                        } else {
                            return res.send({message: 'ok!'});
                        }
                    });
                }
            });
        } else {
            return res.status(404).send({message: 'nop'});
        }
    });
}

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
    pool.query('SELECT id, profile_id, username FROM `users` ORDER BY username',
    function (err, results, fields) {
        if(err){
            throw err;
        }
        function recursive(index){
            if (results[index]) {
                pool.query('SELECT id, first_name, last_name, profession, network, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM `profiles` WHERE `id` = ?', [results[index].profile_id],
                function (err, result, field) {
                    if(err){
                        throw err;
                    }
                    results[index].profile = result;
                    results[index].fullname = result[0].first_name + ' ' + result[0].last_name;
                    recursive(index + 1);
                });
            } else
                return res.send(results);
        }
        recursive(0);
    });
};

exports.getProfiles = function(req,res){
    pool.query('SELECT * FROM `profiles` ORDER BY views DESC', function (err, results) {
	if (err) throw (err);
	else
	    return res.status(200).send(results);
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
	                    pool.query('SELECT id, first_name, last_name, profession, network, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM `profiles` WHERE `id` = ?',
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

exports.getCardProfile = function(req, res) {
    console.time('Time to find: ');
    var query = "select u.id, u.profile_id, u.username, uf.followers, fu.following, r.myRank, p.first_name, p.last_name, p.description, p.network, p.location_city, p.location_state, p.location_country, p.profile_picture, p.about, p.cover_picture_cards from users as u inner join (select id as profile_id2, first_name, last_name, description, network, location_city, location_state, location_country, profile_picture, about, cover_picture_cards from profiles where description != '' && DESCRIPTION is not null && profile_picture is not null && fake = 0 ORDER BY rand()) as p on u.profile_id=p.profile_id2 left join (select follow_user_id, count(*) as followers from user_followers group by follow_user_id) as uf on u.id=uf.follow_user_id left join (select user_id, count(*) as following from user_followers group by user_id) as fu on u.id=fu.user_id left join (select user_id, rank as myRank from rank_of_the_day) as r on u.id=r.user_id where id in (SELECT user_id FROM user_skills WHERE user_id IN (SELECT user_id FROM user_experiences GROUP BY user_id) GROUP BY user_id) order by rand()"    
    
    pool.query(query, function(err, result) {
        if (err) throw err;
        function recursive(index) {
            if (result[index]) {
                pool.query('SELECT skill_name FROM user_skills WHERE user_id = ?', result[index].id,
                    function(err, result2) {
                        result[index].user_id = result[index].id;
                        result[index].skills = result2;
                        return recursive(index + 1);
                    });
            } else  {
                console.timeEnd('Time to find: ');
                return res.send({success: true, data: result})
            }
        };
        recursive(0);
    });
    // pool.query("SELECT id, first_name, last_name, description, network, location_city, location_state, location_country, profile_picture, about, cover_picture_cards FROM `profiles` WHERE id IN ( SELECT profile_id FROM users WHERE id IN (SELECT user_id FROM user_skills WHERE user_id IN (SELECT user_id FROM user_experiences GROUP BY user_id) GROUP BY user_id) )  && (DESCRIPTION != '' && DESCRIPTION is not null) && profile_picture is not null && fake = 0 ORDER BY rand()",
    //     function(err, result) {
    //         if (err) throw err;
    //         pf.sortCardProfile(result, function(array) {
    //             console.timeEnd('Time to find: ');
    //             if (array[0]) {
    //                 return res.send({success: true, data: array})
    //             } else
    //                 return res.send({success: false});
    //         });
    //     });
    // pool.query('SELECT profile_id FROM users WHERE id IN (SELECT user_id FROM user_skills WHERE user_id IN (SELECT user_id FROM user_experiences GROUP BY user_id) GROUP BY user_id)',
    //     function(err, result) {
    //         console.log(result.length);
    //         if (err) throw err;
    //         else {
    //             var arr = result.map( function(el) { return el.user_id; })
    //             pool.query("SELECT id FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id IN (" + arr + ")) && (DESCRIPTION != '' && DESCRIPTION is not null)",
    //                 function(err, result2) {
    //                     if (err) throw err;
    //                     var arr2 = result2.map( function(el) { return el.id});
    //                     pool.query('SELECT id, first_name, last_name, description, network, location_city, location_state, location_country, profile_picture, about, cover_picture_cards FROM `profiles` WHERE id IN (' + arr2 + ') && profile_picture is not null && fake = 0 ORDER BY rand()', 
    //                         function (err, result3) {                                
    //                             if (err) throw (err);
    //                             pf.sortCardProfile(result3, function(array1) {
    //                                 console.timeEnd('Time to find: ');
    //                                 if (array1[0]) {
    //                                     return res.send({success: true, data: array1})
    //                                 } else
    //                                     return res.send({success: false});
    //                             });
    //                         });
    //                 });
    //         }
    //     });
};

exports.getCardProfilePlus = function(req, res) {

    if (req.body[0]) {
        var arr = req.body.map(function(el) { return el.id});
        pool.query('SELECT id, first_name, last_name, description, location_city, network, location_state, location_country, profile_picture, about, cover_picture_cards FROM `profiles` WHERE id NOT IN (' + arr + ') && profile_picture is not null && fake = 0 ORDER BY rand() LIMIT 100', 
            function (err, result) {
                if (err) throw (err);
                pf.sortCardProfile(result, function(array) {
                    var newArray = req.body.concat(array);
                    return res.send({success: true, data: newArray});
                });
            });
    } else
        return res.status(400).send("Error data!");
};

exports.getCardProfileHome = function(req, res) {
    req.checkBody('ip', "error").isString();

    var errors = req.validationErrors(true);
    if (errors) 
        return res.status(400).send(errors);
    else {
        geo.getLocation(req.body, function(city, state, country) {
            if (city) {
                pool.query("SELECT id, first_name, last_name, profession, description, network, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM `profiles` WHERE location_city LIKE '%" + city + "%' && fake = 0 ORDER BY rand() LIMIT 4",
                    function(err, result) {
                        if (err) throw err;
                        else {
                            if (result.length < 4) {
                                pool.query("SELECT id, first_name, last_name, profession, network, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM `profiles` WHERE location_state LIKE '%" + state + "%' && fake = 0 ORDER BY rand() LIMIT 4",
                                    function(err, result2) {
                                        if (err) throw err;
                                        else {
                                            result = result.concat(result2);
                                            if (result.length < 4) {
                                                pool.query("SELECT id, first_name, last_name, network, profession, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM `profiles` WHERE location_country LIKE '%" + country + "%' && fake = 0 ORDER BY rand() LIMIT 4",
                                                    function(err, result3) {
                                                        if (err) throw err;
                                                        else {
                                                            result = result.concat(result3);
                                                            if (result.length < 4) {
                                                                pf.sortCardProfile(result, function(array) {
                                                                    return res.status(200).send({success: true, data: array});
                                                                });
                                                            } else {
                                                                var newResult = result.slice(0, 4);
                                                                pf.sortCardProfile(newResult, function(array) {
                                                                    return res.status(200).send({success: true, data: array});
                                                                });
                                                            }
                                                        }
                                                    });
                                            } else {
                                                var newResult = result.slice(0, 4);
                                                pf.sortCardProfile(newResult, function(array) {
                                                    return res.status(200).send({success: true, data: array});
                                                });
                                            }
                                        }
                                    });
                            } else {
                                pf.sortCardProfile(result, function(array) {
                                    return res.status(200).send({success: true, data: array});
                                });
                            } 
                        }
                    });
            }
        });
    }

    // pool.query('SELECT count(*) as count, follow_user_id FROM user_followers GROUP BY follow_user_id HAVING count >= 10',
    //     function(err, result) {
    //         if (err) throw err;
    //         var arr = result.map(function(el) { return el.follow_user_id });
    //         pool.query('SELECT profile_id FROM users WHERE id IN (' + arr + ')', 
    //             function(err, result2) {
    //                 if (err) throw err;
    //                 var arr2 = result2.map(function(el) { return el.profile_id});
    //                 pool.query('SELECT id, first_name, last_name, profession, description, location_city, location_state, location_country, profile_picture, about, genre, creation_date, cover_picture, views, profile_picture_icon, cover_picture_cards FROM `profiles` WHERE id IN (' + arr2 + ') && fake = 0 ORDER BY rand() LIMIT 4',
    //                     function (err, results) {
    //                         if (err) throw (err);
    //                         pf.sortCardProfile(results, function(array) {
    //                             res.send({success: true, data: array});
    //                         });
    //                     });
    //             });
    //     });
}

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

function initShareInviteLink(first_name, last_name, user_id) {
    var invite_id = first_name.replace(/ /g,'') + last_name.replace(/ /g,'') + '_W';
        pool.query('SELECT count(*) AS number FROM share_invite_link WHERE invite_id like "' + invite_id + '%"', invite_id,
            function(err, result3) {
                if (!result3[0].number)
                    invite_id = invite_id + 1;
                else
                    invite_id = invite_id + (result3[0].number + 1);
                console.log(invite_id);
                pool.query('INSERT INTO share_invite_link SET user_id = ?, invite_id = ?', [user_id, invite_id],
                    function(err, done) {
                        return ;
                    });
            });
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
						       if (err) {
                                console.log(err);
                                return res.status(400).send({success: false});
                               }
                               initShareInviteLink(req.body.first_name, req.body.last_name, result.insertId);
						       var mailObject = {
							   'email_address': req.body.email,
							   'status': 'subscribed',
							   'merge_fields': {
							       'FNAME': req.body.first_name,
							       'LNAME': req.body.last_name
							   }
						       };
						       mailchimp.addMember(mailObject, function(){});
						       pool.query('UPDATE profiles SET username = ? WHERE id = ?', [username1[index], result.insertId],
								  function(err, success) {
								        if (err) throw err;
                                        else {
                                            pool.query('UPDATE invitation SET status = "registed" WHERE invite_email = ? AND status = "pending"', req.body.email,
                                                function(err, done) {
                                                    if (err) throw err;
                                                    return res.send({success: true, result: result});
                                                });
								        }
                                  });
						   });
					       }
					       else {
						      return recursive(index + 1);
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

               sendWelcomeMail();
               sendValidateAccountMail();

               function sendWelcomeMail () {
		   if (req.body.email.indexOf('witty') >= 0)
		       return ;
    			   var template_name = "welcome";
    			   var template_content = [{
    			       "name": "welcome",
    			       "content": "content",
    			   }];

    			   var message = {
    			       "html": "<p>HTML content</p>",
    			       "subject": "Welcome to Wittycircle",
    			       "from_email": "quentin@wittycircle.com",
    			       "from_name": "Quentin Verriere",
    			       "to": [{
    				   "email": req.body.email,
    				   "name": req.body.first_name,
    				   "type": "to"
    			       }],
    			       "headers": {
    				   "Reply-To": "quentin@wittycircle.com"
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
    			   mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
    			       var date = new Date();
    			       console.log("MAIL at " + date + ":" + "\n" + "A new mail was sent to " + req.body.email);
    			       console.log("response is:");
    			   }, function(e) {
    			       // Mandrill returns the error as an object with name and message keys
    			       console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
    			       // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    			   });
           }

           function sendValidateAccountMail () {
	       if (req.body.email.indexOf('witty') >= 0)
		   return ;
               var buf = crypto.randomBytes(20);
               var token = buf.toString('hex');
               var link_validate = 'https://www.wittycircle.com/validate-account/' + token;


               var template_name = "validate-account";
               var template_content = [{
                   "name": "validate-account",
                   "content": "content",
               }];

               var message = {
                   "html": "<p>HTML content</p>",
                   "subject": "Validate your Wittycircle account",
                   "from_email": "noreply@wittycircle.com",
                   "from_name": "Wittycircle",
                   "to": [{
                       "email": req.body.email,
                       "type": "to"
                   }],
                   "headers": {
                       "Reply-To": "noreply@wittycircle.com"
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
                           "name": "link",
                           "content": link_validate
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
               mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
                   //console.log(result);
                   pool.query('INSERT into account_validation (token, user_email) VALUES(?, ?)',
                    [token, req.body.email],
                    function (err, result) {
                        if (err) {
                            console.log(new Date());
                            throw err;
                        }
                    });
               }, function(e) {
                   // Mandrill returns the error as an object with name and message keys
                   console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                   throw e;
                   // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
               });
           }


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
        if (!req.body.curentPass) {
            console.log('hi');
        }
        if (!req.body.currentPass && !req.user.password && req.isAuthenticated()) {
            pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newSetting,
            function(err, result) {
                if (err){
                    throw err;
                }
                return res.send({success: true});
            });
        } else {
            //if (bcrypt.compareSync(req.body.curentPass, req.user.password)) {
                pool.query('UPDATE `users` SET ? WHERE `id` = ' + req.params.id, newSetting,
                function(err, result) {
                    if (err) throw err;
                    return res.send({success: true});
                });
            //} else {
                //return res.send({success: false});
            //}
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
