/**** UC INVITE ****/
const mandrill  = require('mandrill-api/mandrill');
const crypto      = require('crypto');


/* BABSON UNIVERSITY INVITATION MAILS */
function inviteMailToUc(university, callback) {
	pool.query('SELECT first_name, last_name, description, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = 1829)',
		function(err, result) {
			if (err) throw err;
	
			pool.query('SELECT id, first_name, email, message, university FROM invite_university WHERE university = ? AND send_date IS NULL', university,
				function(err, list) {	
					if (err) throw err;
					if (list[0]) {
						var buf     = crypto.randomBytes(40),
            				token   = buf.toString('hex');
            			pool.query('INSERT INTO networks SET name = ?, type = "university", token = ?', [list[0].university, token], function(err, done) {
            				if (err) throw err;
							function recursive(index) {
								if (list[index]) {
									/* FROM PROFILE SETTING */
									var ffname = result[0].first_name + " " + result[0].last_name;

	                                var subj = "Wittycircle is now open to the " + list[index].university + " community"

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
	                                        "email": "friends@wittycircle.com",
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
	                                            "rcpt": "friends@wittycircle.com",
	                                            "vars": [
	                                                {
	                                                    "name": "fname",
	                                                    "content": list[index].first_name
	                                                },
	                                                {
	                                                    "name": "message",
	                                                    "content": list[index].message
	                                                },
	                                                {
	                                                    "name": "funame",
	                                                    "content": ffname
	                                                },
	                                                {
	                                                	"name": "fnetwork",
	                                                	"content": list[index].university
	                                                },
	                                                {
	                                                	"name": "url",
	                                                	"content": "www.wittycircle.com/welcome/" + list[index].university + "/" + token
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
	                                	return ;
	                                    pool.query('UPDATE invite_university SET send_date = NOW() WHERE id = ?', list[index].id,
											function(err, done) {
												return recursive(index + 1);
											});
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
							recursive(0);
						});
					} else
						return callback(false);
				});

	});
};

exports.verifyNetworks = function(req, res) {
	req.checkBody('token', 'Error occurs!').isString();
	req.checkBody('uc', 'Error occurs!').isString();

	var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
    	pool.query('SELECT id FROM networks WHERE name = ? AND token = ?', [req.body.uc, req.body.token],
    		function(err, result) {
    			if (err) throw err;
    			else {
    				if (!result[0]) return res.status(200).send(false);
    				else
    					return res.status(200).send(true);
    			}
    		});
    }
};

exports.getUniversityList = function(req, res) {
	pool.query('SELECT university, message, creation_date, max(send_date), number_students FROM invite_university GROUP BY university ORDER BY creation_date ASC',
		function(err, result) {
			if (err) throw err;
			else {
				function recursive(index) {
					if (result[index]) {
						pool.query('SELECT count(*) as number FROM invite_university WHERE university = ? AND send_date is null', result[index].university,
							function(err, result2) {
								if (err) throw err;
								result[index].rest = result2[0].number;
								return recursive(index + 1);
							});
					} else
						return res.status(200).send({success: true, data: result});
				};
				recursive(0);
			}
		});
};

exports.addUniversityMailList = function(req, res) {
	if (req.body.university_name && req.body.university_mail_list[0]) {
		var ucName = req.body.university_name;
		var ucList = req.body.university_mail_list; 
		var ucMessage = req.body.university_message;
		var ucSender = req.body.university_sender;
		var object = {};

		function recursive(index) {
			if(ucList[index]) {
				if (ucList[index].email) {
					object.first_name  	= ucList[index].first_name;
					object.email 		= ucList[index].email;
					object.university 	= ucName;
					object.sender 		= ucSender;
					object.message 		= ucMessage; 
					pool.query('INSERT INTO invite_university SET ?', object,
						function(err, result) {
							return recursive(index + 1);
						});
				} else
					return recursive(index + 1);
			} else 
				return res.status(200).send({success: true});
		};
		recursive(0);
	} else
		return res.status(404).send("ERROR!");
};

exports.sendUcCampaignMail = function(req, res) {
	if (req.body.uc) {
		inviteMailToUc(req.body.uc, function(done) {
			if (done) {
				pool.query('SELECT university, creation_date, max(send_date) FROM invite_university GROUP BY university ORDER BY creation_date ASC',
					function(err, data) {
						if (err) throw err;
						else
							return res.status(200).send({success: true, data: data});
					});
			} else
				return res.status(400).send("FORBIDDEN !")
		});
	} else
		return res.status(404).send("ERROR !");
};

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
