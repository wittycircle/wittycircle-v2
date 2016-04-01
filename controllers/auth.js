var passport = require('passport');

/** DEV **/
exports.facebookAuth = {
    'clientID'      : '793713660760465',
    'clientSecret'  : '07591de283d45f6657dcf79aefcadb25',
    'callbackURL'   : 'http://localhost/auth/facebook/callback'
};

exports.googleAuth = {
    'clientID'      : '462789229840-h9vot9kt0ihli4hvoh7eeooddm6l4kqa.apps.googleusercontent.com',
    'clientSecret'  : 'qjVoxMQ-eU85H3ODsm86N5Fq',
    'callbackURL'   : 'http://localhost/auth/google/callback'
};

    /** PUBLIC **/
    // exports.facebookAuth = {
    //     'clientID'      : '487284094736758',
    //     'clientSecret'  : '01638b636efc1d6dce71c43138c7c88f',
    //     'callbackURL'   : 'http://www.wittycircle.com/auth/facebook/callback'
    // };

    // exports.googleAuth = {
    //     'clientID'      : '1000804181890-epc9jh416f4hvqp7gklkk0f3ot1u7gg6.apps.googleusercontent.com',
    //     'clientSecret'  : 'EUQK_lzSb9Ba-z288oagNThx',
    //     'callbackURL'   : 'http://www.wittycircle.com/auth/google/callback'
    // };

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
		    username	: user.username
		};
		res.send({success: true, user: get_user});
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
