var sendMailAPI = require('../tools/mail_message_functions');

function checkDataMail(email, callback) {
	pool.query('SELECT id FROM users WHERE email = ?', email,
		function(err, result) {
			if (err) throw err;
			if (result[0]) 
				return callback(false);
			else
				return callback(true);
		})
};

function checkDataMailInvite(email, callback) {
	pool.query('SELECT id FROM invitation WHERE invite_email = ? && date(creation_date) = curdate()', email,
		function(err, result) {
			if (err) throw err;
			if (result[0])
				return callback(false);
			else
				return callback(true);
		});
};

/*exports.checkExistenceMail = function(req, res) {

	emailCheck(req.body.email).then(function (check) {
		if (check)
			return res.status(200).send({success: true});
		else
			return res.status(200).send({success: false, failMail: req.body.email});
		// Returns "true" if the email address exists, "false" if it doesn't.
	})
	.catch(function (err) {
		if (err.message === 'refuse') {
			return res.status(200).send({success: false, failMail: req.body.email});
			// The MX server is refusing requests from your IP address.
		} else {
			// Decide what to do with other errors.
			return res.status(200).send({success: false, failMail: req.body.email});
		}
	});

};*/

exports.addInvitationMail = function(req, res) {
	/* Validation */
    req.checkBody('user_id', 'Error Message').isInt();
    req.checkBody('mailList', 'Error Message').isArray();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	var id 			= req.body.user_id,
    		mailList 	= req.body.mailList,
    		newMailList = [];

    	function recursive(index) {
    		if (mailList[index]) {
    			if (!req.body.team) {
    				checkDataMailInvite(mailList[index], function(exist) {
    					if (!exist) return recursive(index + 1);
		    			checkDataMail(mailList[index], function(valid) {
		    				if (valid) {
		    					newMailList.push(mailList[index]);
								pool.query('INSERT INTO invitation SET user_id = ?, invite_email = ?', [id, mailList[index]],
			    					function(err, result) {
			    						if (err) throw err;
			    						return recursive(index + 1);
			    					}); 
							} else
								return recursive(index + 1);
						});
					});
    			} else {
					newMailList.push(mailList[index]);
					pool.query('INSERT INTO invitation SET user_id = ?, invite_email = ?', [id, mailList[index]],
    					function(err, result) {
    						if (err) throw err;
    						return recursive(index + 1);
    					}); 
    			}
    		} else {
    			if (!req.body.team) {
	    			sendMailAPI.sendInvitationMail(id, newMailList, function(done) {
	    				return res.status(200).send(done);
	    			});
	    		} else {
	    			sendMailAPI.sendInvitationMailToTeam(id, newMailList, function(done) {
	    				return res.status(200).send(done);
	    			});
	    		}
    		}
    	};
    	recursive(0);
    }
};
