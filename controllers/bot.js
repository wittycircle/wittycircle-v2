var mandrill = require('mandrill-api/mandrill');
var CronJob = require('cron').CronJob;


function getInformationAndSendMail(data, email, first_name, last_name, callback) {
	if (data[0]) {
		var arr = data.map( function(el) { return el.user_notif_id; })
		pool.query('SELECT profile_id, username FROM users WHERE id IN (' + arr + ')',
			function(err, result) {
				if (err) throw err;
				else {
					var arr2 = result.map( function(el) { return el.profile_id; });
					pool.query('SELECT first_name, last_name, profile_picture, location_city, location_state, location_country FROM profiles WHERE id IN (' + arr2 + ')', 
						function(err, info2) {
							if (err) throw err;
							else {
								var main_name = first_name;
								var subj = first_name + ", someone is interested in your profile.";
								var view_number = data.length;

								if (info2[0]) {
									var locat1 = info2[0].location_state ?
									// State existe
									info2[0].location_city ? info2[0].location_city + ", " + info2[0].location_state : info2[0].location_state + ", " + info2[0].location_country || ""
									// Or not
									: info2[0].location_city ? info2[0].location_city + ", " + (info2[0].location_country || "") : info2[0].location_country || "";
									var picture1 	= info2[0].profile_picture;
									var fullName1 	= info2[0].first_name + ' ' + info2[0].last_name;
									var username1 	= result[0].username;
								}
								if (info2[1]) {
									var locat2 = info2[1].location_state ?
									info2[1].location_city ? info2[1].location_city + ", " + info2[1].location_state : info2[1].location_state + ", " + info2[1].location_country || ""
									: info2[1].location_city ? info2[1].location_city + ", " + (info2[1].location_country || "") : info2[1].location_country || "";
									var picture2 	= info2[1].profile_picture;
									var fullName2 	= info2[1].first_name + ' ' + info2[1].last_name;
									var username2 	= result[1].username;
								}
								if (info2[2]) {
									var locat3 = info2[2].location_state ?
									info2[2].location_city ? info2[2].location_city + ", " + info2[2].location_state : info2[2].location_state + ", " + info2[2].location_country || ""
									: info2[2].location_city ? info2[2].location_city + ", " + (info2[2].location_country || "") : info2[2].location_country || "";
									var picture3 	= info2[2].profile_picture;
									var fullName3 	= info2[2].first_name + ' ' + info2[2].last_name;
									var username3 	= result[2].username;
								}
								if (info2[3]) {
									var locat4 = info2[3].location_state ?
									info2[3].location_city ? info2[3].location_city + ", " + info2[3].location_state : info2[3].location_state + ", " + info2[3].location_country || ""
									: info2[3].location_city ? info2[3].location_city + ", " + (info2[3].location_country || "") : info2[3].location_country || "";
									var picture4 	= info2[3].profile_picture;
									var fullName4 	= info2[3].first_name + ' ' + info2[3].last_name;
									var username4 	= result[3].username;
								}
								if (info2[4]) {	
									var locat5 = info2[4].location_state ?
									info2[4].location_city ? info2[4].location_city + ", " + info2[4].location_state : info2[4].location_state + ", " + info2[4].location_country || ""
									: info2[4].location_city ? info2[4].location_city + ", " + (info2[4].location_country || "") : info2[4].location_country || "";
									var picture5 	= info2[4].profile_picture;
									var fullName5 	= info2[4].first_name + ' ' + info2[4].last_name;
									var username5 	= result[4].username;
								}

								var view_more = view_number - 5;
								if (view_more > 0)
									var more = "and " + view_more + " more";
								else
									var more = null;

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
                                        "email": email,
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
                                            "rcpt": email,
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
                                                    "content": picture1
                                                },
                                                {
                                                    "name": "pname1",
                                                    "content": fullName1
                                                },
                                                {
                                                    "name": "ploc1",
                                                    "content": locat1 || ""
                                                },
                                                {
                                                    "name": "purl1",
                                                    "content": "https://www.wittycircle.com/" + username1
                                                },
                                                {
                                                    "name": "pimg2",
                                                    "content": picture2 || null
                                                },
                                                {
                                                    "name": "pname2",
                                                    "content": fullName2 || null
                                                },
                                                {
                                                    "name": "ploc2",
                                                    "content": locat2 || ""
                                                },
                                                {
                                                    "name": "purl2",
                                                    "content": "https://www.wittycircle.com/" + username2
                                                },
                                                {
                                                    "name": "pimg3",
                                                    "content": picture3 || null
                                                },
                                                {
                                                    "name": "pname3",
                                                    "content": fullName3 || null
                                                },
                                                {
                                                    "name": "ploc3",
                                                    "content": locat3 || ""
                                                },
                                                {
                                                    "name": "purl3",
                                                    "content": "https://www.wittycircle.com/" + username3
                                                },
                                                {
                                                    "name": "pimg4",
                                                    "content": picture4 || null
                                                },
                                                {
                                                    "name": "pname4",
                                                    "content": fullName4 || null
                                                },
                                                {
                                                    "name": "ploc4",
                                                    "content": locat4 || ""
                                                },
                                                {
                                                    "name": "purl4",
                                                    "content": "https://www.wittycircle.com/" + username4
                                                },
                                                {
                                                    "name": "pimg5",
                                                    "content": picture5 || null
                                                },
                                                {
                                                    "name": "pname5",
                                                    "content": fullName5 || null
                                                },
                                                {
                                                    "name": "ploc5",
                                                    "content": locat5 || ""
                                                },
                                                {
                                                    "name": "purl5",
                                                    "content": "https://www.wittycircle.com/" + username5
                                                },
                                                {
                                                	"name": "more",
                                                	"content": more
                                                },
                                            ]
                                        }
                                    ]
                                };

                                mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result_send) {
                                	return callback();
                                }, function(e) {
                                    // Mandrill returns the error as an object with name and message keys
                                    throw e;
                                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                });
							}
						});
				}
			});
	} else
		return callback();
};

function sendProfileViewMail() {
	pool.query('SELECT user_id, user_notif_id FROM notification_list WHERE type_notif = "view" AND n_read = 0 AND DATE(date_of_view) = CURDATE() - INTERVAL 1 DAY GROUP BY user_id',
		function(err, result) {
			if (err) throw err;
			else {
				if (result[0]) {
					function recursive(index) {
						if (result[index]) {						
							pool.query('SELECT user_notif_id FROM notification_list WHERE user_id = ? AND type_notif = "view" AND n_read = 0 AND DATE(date_of_view) = CURDATE() - INTERVAL 1 DAY', result[index].user_id,
								function(err, result2) {
									if (err) throw err;
									else {
										pool.query('SELECT email, profile_id, fake FROM users WHERE id = ?', result[index].user_id,
											function(err, result3) {
												if (err) throw err;
                                                if (result3[0].fake === 1)
                                                    return recursive(index + 1);
                                                else {
    												pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result3[0].profile_id,
    													function(err, result4) {
    														if (err) throw err;
    														getInformationAndSendMail(result2, result3[0].email, result4[0].first_name, result4[0].last_name, function() {
    															return recursive(index + 1);
    														});
    													});
                                                }
											});
									}
								});
						} else {
						    return ;
						}
					};
					recursive(0);
				} else
					return ;
			}
		});
};

function checkView(user_id, user_notif_id, callback) {
    pool.query('SELECT * FROM notification_list WHERE user_id = ? AND user_notif_id = ? AND type_notif = "view"', [user_id, user_notif_id],
        function(err, result) {
            if (err) throw err;
            else {
                if (result[0])
                    return callback(false);
                else
                    return callback(true);
            }
        });
};

function addUserView(user_id, numView, numberProfiles, callback) {
    function recursive(index) {
        if (index < numView) {
            var randomId = Math.floor((Math.random() * numberProfiles) + 1);
            if (randomId === user_id)
                return recursive(index);
            checkView(user_id, randomId, function(res) {
                if (res) {
                    pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', randomId,
                        function(err, result) {
                            if (err) throw err;
                            else {
                                if (!result[0])
                                    return recursive(index);
                                var fullName = result[0].first_name + " " + result[0].last_name;
                                pool.query('INSERT INTO notification_list SET user_id = ?, user_notif_id = ?, user_notif_username = ?, type_notif = "view"', [user_id, randomId, fullName],
                                    function(err, result2) {
                                        if (err) throw err;
                                        return recursive(index + 1);
                                    });
                            }
                        });
                } else
                    return recursive(index);
            });
        } else
            return callback();
    };
    recursive(0);
};

function increaseUserView() {
    var d = new Date();
    var n = d.getDay();

    if (n > 0) {
        pool.query('SELECT count(*) as number FROM profiles', 
            function(err, result) {
                if (err) throw err;
                else {
                    var slice = Math.round(result[0].number / 6);
                    if (n === 1) {
                        var start   = 1;
                        var end     = slice;
                    } else {
                        var start   = (n - 1) * slice;
                        var end     = n * slice; 
                    }
                    function recursive(index) {
                        if (index >= start && index < end) {
                            pool.query('SELECT count(*) as number FROM notification_list WHERE type_notif = "view" AND n_read = 0 AND user_id = ?', index,
                                function(err, result1) {
                                    if (err) throw err;
                                    if (result1[0].number >= 3)
                                        return recursive(index + 1);
                                    else {
                                        var randomView = Math.floor((Math.random() * 3) + 1);
                                        pool.query('SELECT count(*) as number FROM users WHERE id = ?', index,
                                            function(err, check) {
                                                if (err) throw err;
                                                if (!check[0].number)
                                                    return recursive(index + 1);
                                                else {
                                                    addUserView(index, randomView, result[0].number, function() {
                                                        return recursive(index + 1);
                                                    });
                                                }
                                            });
                                    }
                                });
                        } else {
                            console.log("DONE!");
                            return ;
                        }
                    };
                    recursive(start);
                }
            });
    } else
        return ;
};

var job = new CronJob({
    cronTime: '00 00 19 * * 0-6',
    onTick: function() {
        sendProfileViewMail();
    },
    start: false,
    timeZone: 'America/Los_Angeles'
});
job.start();

var hack = new CronJob({
    cronTime: '00 00 16 * * 0-6',
        onTick: function() {
        increaseUserView();
    },
    start: false,
    timeZone: 'America/Los_Angeles'
});
hack.start();


// function checkLastConnection(timestamp, callback) {
//  if (!timestamp)
//      callback(true);
//  else {
//      var day = Math.round((new Date().getTime() / 1000 - 1464288580) / 86400);
//      if (day >= 4)
//          callback(true);
//      else
//          callback(false);
//  }
// };

// function checkSent(user_id, callback) {
//  pool.query('SELECT sent FROM send_mail WHERE user_id = ?', user_id,
//      function(err, result) {
//          if (err) throw err;
//          if (!result[0])
//              return callback(false);
//          else
//              return callback(result[0].sent);
//      });
// }
