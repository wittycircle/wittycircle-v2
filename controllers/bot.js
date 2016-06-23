var mandrill = require('mandrill-api/mandrill');

function checkLastConnection(timestamp, callback) {
	if (!timestamp)
		callback(true);
	else {
		var day = Math.round((new Date().getTime() / 1000 - 1464288580) / 86400);
		if (day >= 4)
			callback(true);
		else
			callback(false);
	}
};

pool.query('SELECT count(*) AS count, user_id FROM notification_list WHERE type_notif = "view" && n_read = 0 && user_id IN (696, 552, 296) GROUP BY user_id',
	function(err, result) {
		if (err) throw err;
		else {
			function recursive(index) {
				if (result[index]) {
					if (result[index].count >= 5) {
						pool.query('SELECT profile_id, email, last_activity FROM users WHERE id = ?', result[index].user_id,
							function(err, result2) {
								if (err) throw err;
								else {
									checkLastConnection(result2[0].last_activity, function(res) {
										if (res) {
											pool.query('SELECT user_notif_id FROM notification_list WHERE type_notif = "view" && n_read = 0 && user_id = ? ORDER BY user_notif_id', result[index].user_id,
												function(err, result3) {
													if (err) throw err;
													else {
														var arr = result3.map( function(el) { return el.user_notif_id; })
														pool.query('SELECT profile_id, username FROM users WHERE id IN (' + arr + ')', function(err, info) {
															if (err) throw err;
															else {
																var arr2 = info.map( function(el) { return el.profile_id; });
																pool.query('SELECT first_name, last_name, profile_picture, location_city, location_state, location_country FROM profiles WHERE id IN (' + arr2 + ')', 
																	function(err, info2) {
																		if (err) throw err;
																		else {
																			pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result2[0].profile_id, function(err, m_info){
																				if (err) throw err;

																				var main_name = m_info[0].first_name;
																				var subj = m_info[0].first_name + ' ' + m_info[0].last_name + ", your profile is being viewed a lot.";
																				var view_number = result3.length;
																				// if (info2[0].location_state)
																				// 	var locat1 = info2[0].location_city + ", " + info2[0].location_state
																				// else
																				// 	var locat1 = info2[0].location_city + ", " + info2[0].location_country;

																				// if (info2[1].location_state)
																				// 	var locat2 = info2[1].location_city + ", " + info2[1].location_state
																				// else
																				// 	var locat2 = info2[1].location_city + ", " + info2[1].location_country;

																				// if (info2[2].location_state)
																				// 	var locat3 = info2[2].location_city + ", " + info2[2].location_state
																				// else
																				// 	var locat3 = info2[2].location_city + ", " + info2[2].location_country;

																				// if (info2[3].location_state)
																				// 	var locat4 = info2[3].location_city + ", " + info2[3].location_state
																				// else
																				// 	var locat4 = info2[3].location_city + ", " + info2[3].location_country;

																				// console.log(info2[4]);
																				// if (info2[4].location_state)
																				// 	var locat5 = info2[4].location_city + ", " + info2[4].location_state
																				// else
																				// 	var locat5 = info2[4].location_city + ", " + info2[4].location_country;

																				var locat1 = info2[0].location_state ? info2[0].location_city + ", " + info2[0].location_state : info2[0].location_city + ", " + info2[0].location_country;
																				var locat2 = info2[1].location_state ? info2[1].location_city + ", " + info2[1].location_state : info2[1].location_city + ", " + info2[1].location_country;
																				var locat3 = info2[2].location_state ? info2[2].location_city + ", " + info2[2].location_state : info2[2].location_city + ", " + info2[1].location_country;
																				var locat4 = info2[3].location_state ? info2[3].location_city + ", " + info2[3].location_state : info2[3].location_city + ", " + info2[1].location_country;
																				var locat5 = info2[4].location_state ? info2[4].location_city + ", " + info2[4].location_state : info2[4].location_city + ", " + info2[1].location_country;

																				var view_more = view_number - 5;
																				if (view_more)
																					var more = "and " + view_more + " more";
																				else
																					var more = " "; 

																				var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

									                                            var template_name = "view-notif";
									                                            var template_content = [{
									                                                "name": "view-notif",
									                                                "content": "content",
									                                            }];

									                                            var message = {
									                                                "html": "<p>HTML content</p>",
									                                                "subject": subj,
									                                                "from_email": "noreply@wittycircle.com",
									                                                "from_name": "Wittycircle",
									                                                "to": [{
					                                                                    "email": result2[0].email,
					                                                                    "name": 'Recipient',
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
					                                                                        "rcpt": result2[0].email,
					                                                                        "vars": [
					                                                                            {
					                                                                                "name": "uname",
					                                                                                "content": main_name
					                                                                            },
					                                                                            {
					                                                                                "name": "nview",
					                                                                                "content": view_number
					                                                                            },
					                                                                            {
					                                                                                "name": "pimg1",
					                                                                                "content": info2[0].profile_picture
					                                                                            },
					                                                                            {
					                                                                                "name": "pname1",
					                                                                                "content": info2[0].first_name + ' ' + info2[0].last_name
					                                                                            },
					                                                                            {
					                                                                                "name": "ploc1",
					                                                                                "content": locat1
					                                                                            },
					                                                                            {
					                                                                                "name": "purl1",
					                                                                                "content": "https://www.wittycircle.com/" + info[0].username
					                                                                            },
					                                                                            {
					                                                                                "name": "pimg2",
					                                                                                "content": info2[1].profile_picture
					                                                                            },
					                                                                            {
					                                                                                "name": "pname2",
					                                                                                "content": info2[1].first_name + ' ' + info2[1].last_name
					                                                                            },
					                                                                            {
					                                                                                "name": "ploc2",
					                                                                                "content": locat2
					                                                                            },
					                                                                            {
					                                                                                "name": "purl2",
					                                                                                "content": "https://www.wittycircle.com/" + info[1].username
					                                                                            },
					                                                                            {
					                                                                                "name": "pimg3",
					                                                                                "content": info2[2].profile_picture
					                                                                            },
					                                                                            {
					                                                                                "name": "pname3",
					                                                                                "content": info2[2].first_name + ' ' + info2[2].last_name
					                                                                            },
					                                                                            {
					                                                                                "name": "ploc3",
					                                                                                "content": locat3
					                                                                            },
					                                                                            {
					                                                                                "name": "purl3",
					                                                                                "content": "https://www.wittycircle.com/" + info[2].username
					                                                                            },
					                                                                            {
					                                                                                "name": "pimg4",
					                                                                                "content": info2[3].profile_picture
					                                                                            },
					                                                                            {
					                                                                                "name": "pname4",
					                                                                                "content": info2[3].first_name + ' ' + info2[3].last_name
					                                                                            },
					                                                                            {
					                                                                                "name": "ploc4",
					                                                                                "content": locat4
					                                                                            },
					                                                                            {
					                                                                                "name": "purl4",
					                                                                                "content": "https://www.wittycircle.com/" + info[3].username
					                                                                            },
					                                                                            {
					                                                                                "name": "pimg5",
					                                                                                "content": info2[4].profile_picture
					                                                                            },
					                                                                            {
					                                                                                "name": "pname5",
					                                                                                "content": info2[4].first_name + ' ' + info2[4].last_name
					                                                                            },
					                                                                            {
					                                                                                "name": "ploc5",
					                                                                                "content": locat5
					                                                                            },
					                                                                            {
					                                                                                "name": "purl5",
					                                                                                "content": "https://www.wittycircle.com/" + info[4].username
					                                                                            },
					                                                                            {
					                                                                            	"name": "more",
					                                                                            	"content": more
					                                                                            },
					                                                                        ]
					                                                                    }
					                                                                ]
									                                            };
									                                            // mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result) {
									                                            // 	recursive(index + 1);
									                                            // }, function(e) {
									                                            //     // Mandrill returns the error as an object with name and message keys
									                                            //     console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
									                                            //     throw e;
									                                            //     // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
									                                            // });
																			});
																		}
																	});
															}
														});
													}
												});
										} else
											recursive(index + 1); 
									});
								}
							});
					} else {
						recursive(index + 1);
					}
				} else
					return ;
			};
			recursive(0);
		}
	});