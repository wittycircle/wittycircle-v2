// config/passport.js

// load all the things we need
var LocalStrategy	= require('passport-local').Strategy;
var FacebookStrategy	= require('passport-facebook').Strategy;
var FB = require('fb');

//var TwitterStrategy	= require('passport-twitter').Strategy;
var GoogleStrategy	= require('passport-google-oauth').OAuth2Strategy;
// var GoogleContacts = require('google-contacts-with-photos');

// load up the user model
var mysql	= require('mysql');
var bcrypt	= require('bcrypt-nodejs');
var dbconfig	= require('./database');
var pool	= mysql.createConnection(dbconfig.connection);
pool.query('USE ' + dbconfig.database);


// load the auth variables
var configAuth = require('./controllers/auth');

// Mandrill mail api
var mandrill = require('mandrill-api/mandrill'); 

// Cloudinary
var cloudinary = require('cloudinary');

// Mailchimp
var mailchimp = require('./mailchimpRequest');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
	if (id) {
            pool.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows) {
		if (err) {
		    console.log(new Date());
		    throw err;
		}
		if (rows[0])
		    done(err, rows[0]);
		else
		    done(null, false);
		//done(null, false);
            });
	}
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
            pool.query("SELECT * FROM users WHERE email = ?", [email], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false);
                }
		if (rows[0].password === "")
		    return done(null, false);
                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false); // create the loginMessage and save it to session as flashdata */

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
	profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified',  'photos'],

    }, function(token, refreshToken, profile, done) { // facebook will send back the token and profile's user
	FB.setAccessToken(token);

	FB.api('/me/friends', function (res) {
	    if(!res || res.error) {
		console.log(!res ? 'error occurred' : res.error);
		return;
	    }
	    console.log(res);
	});

	var info = profile._json;
	var facebook_info = {
	    facebook_id		: profile.id,
	    facebook_token	: token, 
	};
	var username1 = []; // username's array to get all username possibility
	var firstName = info.first_name.replace(/\s+/g, ''); // remove all white space from first and last name
	var lastName  = info.last_name.replace(/\s+/g, '');
	for (var i = firstName.length; i > 0; i--) {
            username1.push(firstName.slice(0, i) + '.' + lastName); // push username to array
        };
        for (var i = lastName.length - 1; i > 0; i--) {
            username1.push(firstName + '.' + lastName.slice(0, i));
	};
	process.nextTick(function() {
	    pool.query('SELECT * FROM `users` WHERE `profile_id` IN (SELECT `id` FROM `profiles` WHERE `facebook_id` = ?)', [profile.id], 
		       function(err, rows) { // find the user in the database based on their facebook id
			
			   if (err)  return done(err);
			   if (!info.email) return done(err);
			   if (!rows.length) {
			       pool.query('SELECT * FROM users WHERE email = ?', [info.email], function(err, rows) { // check email
				   if (err) throw err;
				   if (rows.length) {
				       pool.query('UPDATE profiles SET ? WHERE id IN (SELECT profile_id FROM users WHERE email = ?)', [facebook_info, info.email], function(err, result) {
					   if (err) throw err;
					   pool.query('SELECT * FROM users WHERE email = ?', [info.email], function(err, user) {
					       if (err) throw err;
					       return done(null, user[0]);
					   });
				       });
				   } else {
				       var profile_object = {};
				       var url_photo = "https://graph.facebook.com/me/picture?width=200&height=200&access_token=" + token;

				           cloudinary.uploader.upload(url_photo, function(result) {
					       profile_object = {
						   first_name   : info.first_name,
						   last_name            : info.last_name,
						   genre: info.gender,
						   profile_picture : result.secure_url,
						   profile_picture_icon : result.secure_url,
						   facebook_id          : profile.id,
						   facebook_token       : token,
					       };
					       var mailObject = {
                                                   'email_address': info.email,
                                                   'status': 'subscribed',
                                                   'merge_fields': {
                                                       'FNAME': info.first_name,
                                                       'LNAME': info.last_name
                                                   }
                                               };
                                               mailchimp.addMember(mailObject, function(){});
					       pool.query('INSERT INTO `profiles` SET ?', profile_object, // set all of the facebook information in our profile model
						  	function(err, result) {
						      	if (err) throw err;
						      function recursive(index) { // recursive function to find out available username
							  if (username1[index]) {
							      checkUsername(username1[index], function(found) {
								  if (found.length <= 0) {
								      pool.query('INSERT INTO `users` SET ?', { // set all of the facebook information in our user model
									  profile_id	: result.insertId,
									  email		: info.email,
									  username	: username1[index],
								      }, function(err, data){
									  if (err) throw err;
									  pool.query('UPDATE invitation SET status = "registed" WHERE invite_email = ? AND status = "pending"', info.email,
                                                function(err, check) {
                                                    if (err) throw err;
											  pool.query('UPDATE profiles SET username = ? WHERE id = ?', [username1[index], result.insertId],
												     function(err, success) {
													 if (err) throw err;
													 pool.query('SELECT * FROM `users` WHERE profile_id = ?', [result.insertId], // return our user model to serialize and deserialize.
														    function(err, user) {
															if (err) throw err;
															pool.query('INSERT INTO first_log SET user_id = ?', user[0].id,
																   function(err, save) {
																       if (err) { 
																	   throw err;
																       }
																       var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');
																       
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
																			 "email": info.email,
																			 "name": info.first_name,
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
																		   "rcpt": "maxencemasson.mm@gmail.com",
																		   "vars": [
																		       {
																			   "name": "fname",
																			   "content": info.first_name
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
																	   console.log("MAIL at " + date + ":" + "\n" + "A new mail was sent to " + info.email);
																	   console.log("response is:");
																	   console.log(result);
																       }, function(e) {
																	   console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
																       });
																       return done(null, user[0]);
																   });
														    });
												     });
												});
								      });
								  } else {
								      recursive(index + 1);
								  }
							      });
							  } else { // if all possibility is already taked, we bind a random number to the username.
							      var random_number = Math.floor((Math.random() * 10000) + 1);
							      username1 = [firstName + '.' + lastName + random_number];
							      recursive(0);
							  }
						      }
						      recursive(0);
						  });
					   }, {width: 200, height: 200, crop: "fill", format: "jpg", gravity: "face" });
				   }
			       });
			   } else
                               return done(null, rows[0]); // user found, return that user
		       });
	});
    }));
    function checkUsername(value, callback) {
	    pool.query('SELECT `id`  FROM `users` WHERE `username` = ?', [value], function(err, result){
                if (err) {
                    throw err;
                }
                callback(result);
            });
        };
    
    // =========================================================================
    // TWITTER =================================================================
    // =========================================================================
    /*passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,

    }, function(token, tokenSecret, profile, done) {
	process.nextTick(function(){
	    pool.query('SELECT * FROM `users` WHERE `profile_id` IN (SELECT `id` FROM `profiles` WHERE `twitter_id` = ?)', [profile.id],
		       function(err, rows) { // find the user in the database based on their twitter id
			   if (err) return done(err);
			   if (!rows.length) {
			       pool.query('INSERT INTO `profiles` SET ?', { // set all of the twitter information in our user model
				   first_name		: "Coco",
				   last_name		: "Cici",
				   twitter_id		: profile.id,
				   twitter_token	: token,
			       }, function(err, result){
				   if (err) throw err;
				   pool.query('INSERT INTO `users` SET ?', {
				       profile_id	: result.insertId,
				       email		: "moi",
				   }, function(err, data) {
				       if (err) throw err;
				       pool.query('SELECT * FROM `users` WHERE profile_id = ?', [result.insertId],
						  function(err, user) {
						      if (err) throw err;
						      return done(null, user[0]);
						  });
				   });
			       });
			   } else {
			       console.log("user found");
			       return done(null, rows[0]); // user found, return that user
			   }
		       });
	});
	}));*/

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    
    function getGooglePicture(url, render) {
	if (url) {
	    if (url === "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=50")
		render({success:false});
	    else {
		var index	= url.indexOf("sz=");
		var newUrl	= url.substring(0, index - 1) + "sz=200";
		render({success: true, newUrl: newUrl});
	    }
	}
    };

    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,

    },
    function(token, refreshToken, profile, done) {
	process.nextTick(function() {
		// console.log(token);
		// var opts = {
		// 	token: token
		// };

		// GoogleContacts(opts)
		//     .then(function (data) {
		//         // console.log(data);
		//     })
		//     .catch(function (err) {
		//         console.log(err);
		//     });
		    
	    var user = profile._json;
	    var google_info = {
		google_id	: user.id,
		google_token	: token,
	    };
	    var username1 = []; // username's array to get all username possibility
            var firstName = user.name.givenName.replace(/\s+/g, ''); // remove all white space from first and last name
	    var lastName  = user.name.familyName.replace(/\s+/g, '');
            for (var i = firstName.length; i > 0; i--) {
		username1.push(firstName.slice(0, i) + '.' + lastName); // push username to array
            };
            for (var i = lastName.length - 1; i > 0; i--) {
		username1.push(firstName + '.' + lastName.slice(0, i));
	    };
	    pool.query('SELECT * FROM `users` WHERE `profile_id` IN (SELECT `id` FROM `profiles` WHERE `google_id` = ?)', [user.id],
		       function(err, rows) { //find the user in the database based on their google id
			   if (err) return done(err);
			   if (!rows.length) {
			       pool.query('SELECT * FROM users WHERE email = ?', [user.emails[0].value], function(err, rows) { // check email
                                   if (err) throw err;
                                   if (rows.length) {
                                       pool.query('UPDATE profiles SET ? WHERE id IN (SELECT profile_id FROM users WHERE email = ?)', [google_info, user.emails[0].value], function(err, result) {
                                           if (err) throw err;
                                           pool.query('SELECT * FROM users WHERE email = ?', [user.emails[0].value], function(err, user) {
                                               if (err) throw err;
                                               return done(null, user[0]);
                                           });
                                       });
                                   } else {
				       var object_profile = {
					   first_name           : user.name.givenName,
                                           last_name            : user.name.familyName,
                                           google_id            : user.id,
                                           google_token         : token,
				       };
				       if (user.gender)
					   object_profile.genre = user.gender;
				       if (user.image.url) {
					   getGooglePicture(user.image.url, function(res) {
					       if (res.success) {
						   object_profile.profile_picture = res.newUrl;
						   object_profile.profile_picture_icon = res.newUrl;
					       }
					   });
				       }
				       var mailObject = {
                                           'email_address': user.emails[0].value,
                                           'status': 'subscribed',
                                           'merge_fields': {
                                               'FNAME': user.name.givenName,
                                               'LNAME': user.name.familyName,
                                           }
                                       };
                                       mailchimp.addMember(mailObject, function(){});
				       pool.query('INSERT INTO profiles SET ?', object_profile, // set all of the google information in our user model
						  function(err, result){
						      if (err) throw err;
						      function recursive(index) {
							  if (username1[index]) {
							      checkUsername(username1[index], function(found) {
								  if (found.length <= 0) {
								      pool.query('INSERT INTO users SET ?', { // set all of the google information in our user model
									  profile_id	: result.insertId,
									  email		: user.emails[0].value,
									  username	: username1[index],
								      }, function(err, data) {
									  if (err) throw err;
									  	pool.query('UPDATE invitation SET status = "registed" WHERE invite_email = ? AND status = "pending"', user.emails[0].value,
                                                function(err, check) {
                                                    if (err) throw err;
													  pool.query('UPDATE profiles SET username = ? WHERE id = ?', [username1[index], result.insertId],
														     function(err, success) {
															 if (err) throw err;
															 pool.query('SELECT * FROM users WHERE profile_id = ?', [result.insertId], // return our user model to serialize and deserialize
																    function(err, user) {
																	if (err) throw err;
																	pool.query('INSERT INTO first_log SET user_id = ?', user[0].id,
																		   function(err, save) {
																		       if (err) throw err;
																		       return done(null, user[0]);
																		   });
																    });
														     });
												});
								      });
								  } else {
								      recursive(index + 1);
								  }
							      });
							  } else { // if all possibility is already taked, we bind a random number to the username.
							      var random_number = Math.floor((Math.random() * 10000) + 1);
							      username1 = [firstName + '.' + lastName + random_number];
							      recursive(0);
							  }
						      }
						      recursive(0);
						  });
				   }
			       });
			   } else {
			       return done(null, rows[0]); // user found, return that user
			   }
		       });
	});
    }));
};

global.checkSession = function(req){
    if(typeof req.session.user === 'undefined'){
        var obj = {
            "error": true,
            "msg": "Permission Denied"
        };
        return obj;
    } else {
        return false;
    }
};

global.checkLogin = function(req){
    if(typeof req.session.user !== 'undefined'){
        var obj = {
            "error": true,
            "msg": "Already Logged In."
        };
        return obj;
    } else {
        return false;
    }
};

global.pool = pool;
