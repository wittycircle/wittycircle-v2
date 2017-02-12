/**** UC INVITE ****/
const mandrill  = require('mandrill-api/mandrill');
const crypto      = require('crypto');


/* BABSON UNIVERSITY INVITATION MAILS */
// function inviteMailToUc(university, sender_id, callback) {
// 	pool.query('SELECT first_name, last_name, description, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', sender_id,
// 		function(err, result) {
// 			if (err) throw err;

// 			pool.query('SELECT id, first_name, email, message, university FROM invite_university WHERE university = ? AND send_date IS NULL', university,
// 				function(err, list) {	
// 					if (err) throw err;
// 					if (list[0]) {
//             			pool.query('SELECT token FROM networks WHERE name = ? and type = "university"', list[0].university, function(err, done) {
//             				if (err) throw err;

// 							function recursive(index) {
// 								if (list[index]) {
// 									/* FROM PROFILE SETTING */
// 									var ffname = result[0].first_name + " " + result[0].last_name;

// 	                                var subj = "Wittycircle is now open to the " + list[index].university + " community"

// 	                                var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

// 	                                var template_name = "uc-invitation";
// 	                                var template_content = [{
// 	                                    "name": "uc-invitation",
// 	                                    "content": "content",
// 	                                }];

// 	                                var message = {
// 	                                    "html": "<p>HTML content</p>",
// 	                                    "subject": subj,
// 	                                    "from_email": "noreply@wittycircle.com",
// 	                                    "from_name": ffname + " via Wittycircle",
// 	                                    "to": [{
// 	                                        "email": list[index].email,
// 	                                        "name": 'recipient',
// 	                                        "type": "to"
// 	                                    }],
// 	                                    "headers": {
// 	                                        "Reply-To": "noreply@wittycircle.com"
// 	                                    },
// 	                                    "important": false,
// 	                                    "inline_css": null,
// 	                                    "preserve_recipients": null,
// 	                                    "view_content_link": null,
// 	                                    "tracking_domain": null,
// 	                                    "signing_domain": null,
// 	                                    "return_path_domain": null,
// 	                                    "merge": true,
// 	                                    "merge_language": "mailchimp",
// 	                                    "global_merge_vars": [{
// 	                                        "name": "merge1",
// 	                                        "content": "merge1 content"
// 	                                    }],
// 	                                    "merge_vars": [
// 	                                        {
// 	                                            "rcpt": list[index].email,
// 	                                            "vars": [
// 	                                                {
// 	                                                    "name": "fname",
// 	                                                    "content": list[index].first_name
// 	                                                },
// 	                                                {
// 	                                                    "name": "message",
// 	                                                    "content": list[index].message
// 	                                                },
// 	                                                {
// 	                                                    "name": "funame",
// 	                                                    "content": ffname
// 	                                                },
// 	                                                {
// 	                                                	"name": "fnetwork",
// 	                                                	"content": list[index].university
// 	                                                },
// 	                                                {
// 	                                                	"name": "url",
// 	                                                	"content": "www.wittycircle.com/welcome/" + list[index].university + "/" + done[0].token
// 	                                                },
// 	                                                {
// 	                                                    "name": "pimg",
// 	                                                    "content": result[0].profile_picture
// 	                                                },
// 	                                                {
// 	                                                    "name": "fdesc",
// 	                                                    "content": result[0].description
// 	                                                },
// 	                                            ]
// 	                                        }
// 	                                    ]
// 	                                };

// 	                                var async = false;
// 	                                mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
// 	                                	return ;
// 	                                    pool.query('UPDATE invite_university SET send_date = NOW() WHERE id = ?', list[index].id,
// 											function(err, done) {
// 												return recursive(index + 1);
// 											});
// 	                                }, function(e) {
// 	                                	return recursive(index + 1);
// 	                                    // Mandrill returns the error as an object with name and message keys
// 	                                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
// 	                                    throw e;
// 	                                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
// 	                                });

// 								} else {
// 									return callback(true);
// 								}
// 							};
// 							recursive(0);
// 						});
// 					} else
// 						return callback(false);
// 				});

// 	});
// };

function inviteMailToUcBySender(list, university, sender_id, send_message, callback) {
	pool.query('SELECT first_name, last_name, description, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', sender_id,
		function(err, result) {
			if (err) throw err;
			pool.query('SELECT token FROM networks WHERE name = ? and type = "university"', university, function(err, done) {
				if (err) throw err;

				console.log(done);
				function recursive(index) {
					if (list[index]) {
						/* FROM PROFILE SETTING */
						var ffname = result[0].first_name + " " + result[0].last_name;
						console.log(ffname);

                        var subj = "Wittycircle is now open to the " + university + " community"

                        var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                        var template_name = "uc-invitation";
                        var template_content = [{
                            "name": "uc-invitation",
                            "content": "content",
                        }];

                        var message = {
                            "html": "<p>HTML content</p>",
                            "subject": subj,
                            "from_email": "noreply@wittycircle.com",
                            "from_name": ffname + " via Wittycircle",
                            "to": [{
                                "email": list[index],
                                "name": 'recipient',
                                "type": "to"
                            }],
                            "headers": {
                                "Reply-To": "noreply@wittycircle.com"
                            },
                            "important": false,
                            "inline_css": null,
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
                                    "rcpt": list[index],
                                    "vars": [
                                        {
                                            "name": "fname",
                                            "content": "There"
                                        },
                                        {
                                            "name": "message",
                                            "content": send_message
                                        },
                                        {
                                            "name": "funame",
                                            "content": ffname
                                        },
                                        {
                                        	"name": "fnetwork",
                                        	"content": university
                                        },
                                        {
                                        	"name": "url",
                                        	"content": "www.wittycircle.com/welcome/" + university + "/" + done[0].token
                                        },
                                        {
                                            "name": "pimg",
                                            "content": result[0].profile_picture
                                        },
                                        {
                                            "name": "fdesc",
                                            "content": result[0].description
                                        },
                                    ]
                                }
                            ]
                        };

                        var async = false;
                        mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
							return recursive(index + 1);
                        }, function(e) {
                        	return recursive(index + 1);
                            // Mandrill returns the error as an object with name and message keys
                            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                            throw e;
                            // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                        });

					} else {
						return callback(true);
					}
				};
				return recursive(0);
			});

	});
};

exports.verifyNetworks = function(req, res) {
	req.checkBody('token', 'Error occurs!').isString();
	req.checkBody('ucUrl', 'Error occurs!').isString();

	var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
    	pool.query('SELECT id FROM networks WHERE url_name = ? AND token = ?', [req.body.ucUrl, req.body.token],
    		function(err, result) {
    			if (err) throw err;
    			else {
    				if (!result[0]) return res.status(200).send(false);
    				else {
                        pool.query('SELECT name FROM networks WHERE token = ?', req.body.token,
                            function(err, result2) {
                                if (err) throw err;
                                return res.status(200).send({success: true, uc_name: result2[0].name});
                            });
                    }
    			}
    		});
    }
};

function getSenderFullName(id, callback) {
	if (id) {
		pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', id,
			function(err, result) {
				if (err) throw err;
				return callback(result[0].first_name + ' ' + result[0].last_name);
			});
	} else
		return callback(null);
};

function getTokenForUniversity(uc_name, callback) {
    if (uc_name) {
        pool.query('SELECT token FROM networks WHERE name = ?', uc_name,
            function(err, result) {
                if (err) throw err;
                else
                    return callback(result[0].token);
            });
    } else
        return callback(null);
};

exports.getUniversityList = function(req, res) {
	pool.query('SELECT university, message, creation_date, max(send_date), number_students, sender FROM invite_university GROUP BY university ORDER BY creation_date ASC',
		function(err, result) {
			if (err) throw err;
			else {
				function recursive(index) {
					if (result[index]) {
                        getTokenForUniversity(result[index].university, function(token) {
                            result[index].ucUrl = '/welcome/' + result[index].university.replace(/\s+/g, '') + '/' + token;
    						getSenderFullName(result[index].sender, function(fullname) {
    							result[index].senderName = fullname;
    							pool.query('SELECT count(*) as number FROM invite_university WHERE university = ? AND send_date is null', result[index].university,
    								function(err, result2) {
    									if (err) throw err;
    									result[index].rest = result2[0].number;
    									return recursive(index + 1);
    								});
    						});
                        });
					} else
						return res.status(200).send({success: true, data: result});
				};
				recursive(0);
			}
		});
};

exports.getUniversityToken = function(req, res) {
	pool.query('SELECT token FROM networks WHERE name = ? and type = "university"', req.body.uc,
		function(err, result) {
			if (err) throw err;
			else
				return res.status(200).send(result[0].token);
		});
};

exports.addUniversityMailList = function(req, res) {
	if (req.body.university_name) {
		var ucName = req.body.university_name;
        var ucUrlName = ucName.replace(/\s+/g, '');
		var ucMessage = req.body.university_message;
		var ucSender = req.body.university_sender;
		var object = {};

		var buf     = crypto.randomBytes(40),
            token   = buf.toString('hex');
        pool.query('INSERT INTO networks SET name = ?, url_name = ?, type = "university", token = ?', [ucName, ucUrlName, token], 
        	function(err, done) {
	        	if (err) throw err;
				object.university 	= ucName;
				object.sender 		= ucSender;
				object.message 		= ucMessage; 
				pool.query('INSERT INTO invite_university SET ?', object,
					function(err, result) {
						if (err) throw err;
						return res.status(200).send({success: true});
					});
			});
	} else
		return res.status(404).send("ERROR!");
};

exports.sendInvitationBySender = function(req, res) {
	pool.query('SELECT university, message FROM invite_university WHERE sender = ? GROUP BY university', req.body.id,
		function(err, result) {
			if (err) throw err;
			else {
				inviteMailToUcBySender(req.body.emails, result[0].university, req.body.id, result[0].message, function(done) {
					if (done)
						return res.status(200).send(true);
				});
			}
		});
};

// exports.sendUcCampaignMail = function(req, res) {
// 	if (req.body.uc) {
// 		pool.query('SELECT sender FROM invite_university WHERE university = ? GROUP BY university', req.body.uc,
// 			function(err, hello) {
// 				if (err) throw err;
// 				if (hello[0]) {
// 					inviteMailToUc(req.body.uc, hello[0].sender, function(done) {
// 						if (done) {
// 							pool.query('SELECT university, creation_date, max(send_date) FROM invite_university GROUP BY university ORDER BY creation_date ASC',
// 								function(err, data) {
// 									if (err) throw err;
// 									else
// 										return res.status(200).send({success: true, data: data});
// 								});
// 						} else
// 							return res.status(400).send("FORBIDDEN !")
// 					});
// 				} else
// 					return ;
// 			});
// 	} else
// 		return res.status(404).send("ERROR !");
// };

exports.getUcStudentsNumber = function(req, res) {
	pool.query('SELECT * FROM invite_university WHERE university = ?', req.params.university, 
		function(err, check) {
			if (err) throw err;
			if (check[0]) {
				// if (check[0].number_students)
				// 	var new_number = check[0].number_students + 3;
				// else 
				// 	var new_number = 3;
				pool.query('UPDATE invite_university SET number_students = number_students + 1 WHERE university = ?', req.params.university,
					function(err, update) {
						if (err) throw err;
						pool.query('SELECT number_students FROM invite_university WHERE university = ? GROUP BY university', req.params.university,
							function(err, result) {
								if (err) throw err;
								if (!result[0])
									return res.status(200).send({success: false});
								else
									return res.status(200).send({success: true, students: result[0].number_students});
							});
					});
			} else
				return res.status(200).send({success: false});
		});
};

exports.giveInvitPermission = function(req, res) {
	if (req.body.id) {
		pool.query('UPDATE profiles set university_communication = 1 WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', req.body.id,
			function(err, result) {
				if (err) throw err;
				return res.status(200).send(true);
			});
	} else
		return ;
};

exports.getInvitPermission = function(req, res) {
	pool.query('SELECT university_communication FROM profiles WHERE id = ?', req.user.id,
		function(err, result) {
			if (err) throw err;
			if (result[0].university_communication) 
				return res.status(200).send(true);
			else
				return res.status(200).send(false);
		});
};

