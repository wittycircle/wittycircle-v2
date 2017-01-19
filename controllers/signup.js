

/*** Sign Up ***/
const crypto      = require('crypto');
const mandrill  = require('mandrill-api/mandrill');

exports.loadNetworkByIp = function(req, res) {
    req.checkBody('ip', 'Error occurs!').isString();
    console.log(req.body.ip);

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        pool.query('SELECT network_token FROM track_client_ip WHERE ip_address = ? ORDER BY creation_date DESC', req.body.ip,
            function(err, result) {
                if (err) throw err;
                else {
                    if (!result[0]) return res.status(200).send('');

                    pool.query('SELECT name FROM networks WHERE token = ?', result[0].network_token, 
                        function(err, result2) {
                            if (err) throw err;
                            else {
                                if (!result2[0]) return res.status(200).send('');
                                else
                                    return res.status(200).send(result2[0].name);
                            }
                        });
                }
            });
    }
};

exports.updateBasic = function(req, res) {

    req.checkBody('genre', 'Genre must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    // req.checkBody('birthdate', 'Birthdate must be between 1 and 64 characters.').optional().isString().min(1).max(64);
    // req.checkBody('location_country', 'Location country must be between 1 and 64 characters').optional().max(64);
    // req.checkBody('location_city', 'Location city must be between 1 and 64 characters').optional().min(1).max(64);
    // req.checkBody('location_state', 'Location state must be between 1 and 64 characters').optional();

    req.sanitize('genre').Clean(true);
    // req.sanitize('birthday').Clean(true);
    req.sanitize('location_city').Clean(true);
    //req.sanitize('location_country').Clean(true);

    var errors = req.validationErrors(true);
    if (errors)
	return res.status(400).send(errors);

    if (req.body.genre && req.params.id) {
    	pool.query('SELECT profile_id FROM users where id = ?', req.params.id,
    	    function(err, result) {
                pool.query('UPDATE profiles SET genre = ?, location_country = ?, location_city = ?, location_state = ?, network = ? WHERE id = ?', [req.body.genre, req.body.location_country, req.body.location_city, req.body.location_state, req.body.network, result[0].profile_id],
    			   function(err, result) {
    			       if (err) throw err;
    			       return res.send({success: true});
    			   });
    	    });
    } // else if (req.body.genre && req.params.id) {
    //     pool.query('SELECT profile_id FROM users where id = ?', req.params.id,
    //         function(err, result) {
    //             pool.query('UPDATE profiles SET genre = ? WHERE id = ?', [req.body.genre, result[0].profile_id],
    //                function(err, result) {
    //                    if (err) throw err;
    //                    return res.send({success: true});
    //                });
    //         });
    // }
};

exports.updateAbout = function(req, res) {
    req.checkBody('about', 'About must be a string.').optional().isString();
    req.checkBody('description', 'Description must be a string.').optional().isString();

  //  req.sanitize('about').Clean(true);
 
    req.checkBody('about', 'About must be a string.').optional().isString();
    req.checkBody('description', 'Description must be a string.').optional().isString(); 

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    pool.query('UPDATE profiles SET about = ?, description = ? WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [req.body.about, req.body.description, req.user.id],
	       function(err, result) {
		   if (err) throw err;
		      return res.send({success: true});
	       });
};

function checkExistEmail(email, callback) {
    if (email) {
        pool.query('SELECT id FROM profile_network WHERE email = ?', email,
            function(err, result) {
                if (err) throw err;
                else {
                    if (!result[0])
                        return callback(true);
                    else
                        return callback(false);
                }
            });
    } else
        return callback(false);
};

exports.addUniversityNetworkForVerification = function(req, res) {
    req.checkBody('network', "Error occurs!").isString();
    req.checkBody('email', "Error occurs!").isString().isEmail();

    console.log("OK");
    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        var buf     = crypto.randomBytes(40),
            token   = buf.toString('hex');

        checkExistEmail(req.body.email, function(check) {
            if (check) {
                var object = {
                    user_id : req.user.id,
                    network : req.body.network,
                    email   : req.body.email,
                    token   : token
                }
                pool.query('INSERT INTO profile_network SET ?', object,
                    function(err, result) {
                        if (err) throw err;
                        else {
                            pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', req.user.id,
                                function(err, result) {
                                    if (err) throw err;

                                    var link = 'http://www.wittycircle.com/network/validation/' + token;
                                    var subj = "Please confirm you're part of the " + req.body.network + " network";
                                    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                    var template_name = "verification-network";
                                    var template_content = [{
                                        "name": "verification-network",
                                        "content": "content",
                                    }];

                                    var message = {
                                        "html": "<p>HTML content</p>",
                                        "subject": subj,
                                        "from_email": "noreply@wittycircle.com",
                                        "from_name": "Wittycircle",
                                        "to": [{
                                            "email": req.body.email,
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
                                                "rcpt": req.body.email,
                                                "vars": [
                                                    {
                                                        "name": "ffname",
                                                        "content": result[0].first_name
                                                    },
                                                    {
                                                        "name": "link",
                                                        "content": link
                                                    },
                                                    {
                                                        "name": "network",
                                                        "content": req.body.network
                                                    },
                                                ]
                                            }
                                        ]
                                    };

                                    var async = false;
                                    mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
                                        return ;
                                    }, function(e) {
                                        // Mandrill returns the error as an object with name and message keys
                                        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                        throw e;
                                        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                    });
                                    return res.status(200).send(true);
                                });
                        }
                    });
            } else
                return res.status(200).send(false);
        });
    }
};

exports.verifyUniversityNetwork = function(req, res) {
    req.checkBody('token', "Error occurs!").isString();

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        pool.query('SELECT user_id, network FROM profile_network WHERE token = ?', req.body.token,
            function(err, result) {
                if (err) throw err;
                else {
                    if (!result[0])
                        return res.status(400).send('Token not valid');
                    else {
                        pool.query('UPDATE profile_network SET verification = 1 WHERE token = ?', req.body.token,
                            function(err, result2) {
                                if (err) throw err;
                                else {
                                    pool.query('UPDATE profiles SET network = ? WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [result[0].network, result[0].user_id],
                                        function(err, result3) {
                                            if (err) throw err;
                                            else
                                                return res.status(200).send({success: true, message: "Token valid"})
                                        });
                                }
                            });
                    }
                }
            });
    }
}

function checkExistNetworkForUser(user_id, network, callback) {
    if (user_id && network) {
        pool.query('SELECT id FROM profile_network_2 WHERE user_id = ? AND network = ?', [user_id, network],
            function(err, result) {
                if (err) throw err;
                else {
                    if (!result[0])
                        return callback(true);
                    else
                        return callback(false);
                }
            });
    } else
        return callback(false);
}

exports.addSocietyNetworkForVerification = function(req, res) {
    req.checkBody('network', "Error occurs!").isString();

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        checkExistNetworkForUser(req.user.id, network, function(res) {
            if (!res) return ;

            var buf     = crypto.randomBytes(40),
                token   = buf.toString('hex');

            var object = {
                user_id : req.user.id,
                network : req.body.network,
                token   : token,
            }
            pool.query('INSERT INTO profile_network_2 SET ?', object,
                function(err, result) {
                    if (err) throw err;
                    else
                        return res.status(200).send({success: true, message: "Network Added"})
                });
        });
    }
};

exports.verifySocietyNetwork = function(req, res) {
    req.checkBody('token', 'Error occurs!').isString();

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        pool.query('SELECT user_id, network FROM profile_network_2 WHERE token = ?', req.body.token,
            function(err, result) {
                if (err) throw err;
                else {
                    if (!result[0]) return res.status(400).send('Token not valid');
                    else {
                        pool.query('UPDATE profile_network_2 SET verification = 1 WHERE token = ?', req.body.token,
                            function(err, result2) {
                                if (err) throw err;
                                else {
                                    pool.query('UPDATE profiles SET network = ? WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [result[0].network, result[0].user_id],
                                        function(err, result3) {
                                            if (err) throw err;
                                            else
                                                return res.status(200).send({success: true, message: "Token valid"})
                                        });
                                }
                            });
                    }
                }
            });
    }    
};
