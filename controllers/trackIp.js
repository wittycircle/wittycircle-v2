
/* Track Client Activity by IP */

exports.addInviteUniversityActivity = function(req, res) {
	req.checkBody('ip', 'Error occurs!').isString();
	req.checkBody('token', 'Error occurs!').isString();

	var errors = req.validationErrors(true);
    if (errors) return res.status(404).send(errors);
    else {
    	if (req.isAuthenticated())
    		var user_id = req.user.id;
    	else
    		var user_id = '';

    	var object = {
    		ip_address 			: req.body.ip,
    		type_of_activity 	: 'Invite University',
    		network_token 		: req.body.token,
    		user_id 			: user_id
    	}

    	pool.query('INSERT INTO track_client_ip SET ?', object,
    		function(err, result) {
    			if (err) throw err;
    			else 
    				return ;
    		});
    }
};