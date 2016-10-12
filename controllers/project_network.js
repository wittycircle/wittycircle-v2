exports.getInfoFromValidateProjectNetwork = function(req, res) {
	req.checkParams('token', 'ERROR').isString();

	var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	pool.query('SELECT first_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id IN (SELECT creator_user_id FROM projects WHERE id IN (SELECT project_id FROM project_network WHERE token = ?)))',
    		req.params.token, function(err, result) {
    			if (err) throw err;
    			else {
    				pool.query('SELECT title, public_id FROM projects WHERE id IN (SELECT project_id FROM project_network WHERE token = ?)', req.params.token,
    					function(err, result2) {
    						if (err) throw err;
    						else {
    							return res.status(200).send({first_name: result[0].first_name, title: result2[0].title, public_id: result2[0].public_id});
    						}
    					})
    			}
    		});
    }
}