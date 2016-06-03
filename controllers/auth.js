const passport = require('passport');
const mandrill = require('mandrill-api/mandrill');
const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');


//TODO: CHANGE Server url
/** DEV **/
// exports.facebookAuth = {
//     'clientID'      : '793713660760465',
//     'clientSecret'  : '07591de283d45f6657dcf79aefcadb25',
//     'callbackURL'   : 'http://localhost/auth/facebook/callback'
// };

// exports.googleAuth = {
//     'clientID'      : '462789229840-h9vot9kt0ihli4hvoh7eeooddm6l4kqa.apps.googleusercontent.com',
//     'clientSecret'  : 'qjVoxMQ-eU85H3ODsm86N5Fq',
//     'callbackURL'   : 'http://localhost/auth/google/callback'
// };

/** PUBLIC **/
exports.facebookAuth = {
  'clientID'      : '487284094736758',
  'clientSecret'  : '01638b636efc1d6dce71c43138c7c88f',
  'callbackURL'   : 'https://www.wittycircle.com/auth/facebook/callback'
};

exports.googleAuth = {
  'clientID'      : '1000804181890-epc9jh416f4hvqp7gklkk0f3ot1u7gg6.apps.googleusercontent.com',
  'clientSecret'  : 'EUQK_lzSb9Ba-z288oagNThx',
  'callbackURL'   : 'https://www.wittycircle.com/auth/google/callback'
};

exports.checkLog = function(req, res) {
    if (req.isAuthenticated())
    res.send({success: true});
    else
    res.send({success: false});
};

exports.ensureAuthenticated = function(req, res, next) { // make sure that the user is authenticated
    if(req.isAuthenticated()) {
        return next();
    } else {
        return res.status(400);
    };
};

exports.ensureAdminAuthenticated = function(req, res, next) {
    if (req.isAuthenticated() && req.user.moderator) {
        return next();
    } else {
        return res.redirect('/');
    };
}

exports.hasAccess = function(req, res, next) {
    if (req.headers && req.headers.access_token) {
        if (req.headers.access_token == 'oTJaUTHa6FFTSSLrzQOb') {
            next();
        }
    } else {
        //return res.status(404);
        path = __dirname;
        path = path.replace('/controllers', '');
        return res.sendFile(path + '/Public/app/index.html');
        //res.sendFile('/Public/app/index.html');
    }
}

exports.login = function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        if (err || !user) {
            return res.send({success: false});
        }
        req.logIn(user, function(err) {
            if (err) {
                res.send({success: false});
                console.log('error in login');
                return next(err);
            } else {
                var get_user = {
                    id		: user.id,
                    email	: user.email,
                    profile_id	: user.profile_id,
                    username	: user.username,
		    moderator	: user.moderator
                };
                return res.send({success: true, user: get_user});
            }
        });
    })(req, res, next);
};


exports.logout = function (req, res) {
    if (!req.isAuthenticated()) {
        res.send({message: 'User is not logged in'});
    } else {
        req.session.destroy(function (err) {
            if (err) throw err;
            res.send({success: true});
        });
    }
};

exports.ResetPassword = function (req, res) {
    req.checkBody('email_reset', 'error email must be a string').isString();

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        var buf = crypto.randomBytes(20);
        var token = buf.toString('hex');
        var link = 'https://www.wittycircle.com/password/reset/' + token;

        pool.query('SELECT id FROM users WHERE email = ?',
        req.body.email_reset,
        function (error, response) {
            if (error) {
                console.log(new Date());
                throw error;
            } if (response.length === 0) {
                return res.status(400).send({message: "No account with this email"});
            } else {
                pool.query('INSERT into reset_passwords (token, user_id, user_email) VALUES (?, ?, ?)',
                [token, response[0].id, req.body.email_reset],
                function (err, result) {
                    if (err) {
                        console.log(new Date());
                        throw err;
                    } else {
                        var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                        var template_name = "resetpassword";
                        var template_content = [{
                            "name": "resetpassword",
                            "content": "content",
                        }];

                        var message = {
                            "html": "<p>HTML content</p>",
                            "subject": "Reset your Wittycircle password",
                            "from_email": "noreply@wittycircle.com",
                            "from_name": "Wittycircle",
                            "to": [{
                                "email": req.body.email_reset,
                                "name": 'kkkkk',
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
                                    "rcpt": req.body.email_reset,
                                    "vars": [
                                        {
                                            "name": "link",
                                            "content": link
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
                            return res.send('ok!');
                        }, function(e) {
                            // Mandrill returns the error as an object with name and message keys
                            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                            throw e;
                            // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                        });
                    }
                });
            }
        });


    }
}

exports.getUserForResetPassword = function(req, res) {
    req.checkParams('token', 'token must be a string').isString();

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT token, user_id, user_email FROM reset_passwords WHERE token = ?',
        req.params.token,
        function(err, result) {
            if (err) {
                console.log(new Date());
                throw err;
            } else {
                if (result.length == 0) {
                    return res.status(404).send({message: 'fucker your not Authorized, get outta here plz'});
                } else {
                    return res.send({data: result, message: 'ok!'});
                }
            }
        });
    }
}

exports.updatePasswordReset = function(req, res) {
    req.checkBody('token', 'token must be a string').isString().max(128);
    req.checkBody('email', 'email must be a string').isString().max(128);
    req.checkBody('password', 'password must be min 8').min(8).max(30);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT token FROM reset_passwords WHERE token = ?',
        [req.body.token],
        function(err, result) {
            if (err) {
                console.log(new Date());
                throw err;
            } else {
                if (result.length == 0) {
                    return res.status(404).send({message: 'fucker your not Authorized, get outta here plz'});
                } else {
                    var pass = bcrypt.hashSync(req.body.password);
                    pool.query('UPDATE users SET password = ? WHERE email = ?',
                    [pass, req.body.email],
                    function (err, result) {
                        if (err) {
                            console.log(new Date());
                            throw err;
                        } else {
                            return res.send(result);
                        }
                    })
                }
            }
        });
    }
}
