function checkRightUser(user_id, project_id, callback) {
	pool.query('SELECT creator_user_id FROM projects WHERE id = ?', project_id,
		function(err, result) {
			if (err) throw err;
			else {
				if (result[0].creator_user_id === user_id)
					return callback(false);
				else
					return callback(true);
			}
		});
};

exports.createProjectContributor = function(req, res) {
	req.checkBody('user_id', 'Error Message').isInt();
    req.checkBody('project_id', 'Error Message').isInt();
    req.checkBody('contributor_check', 'Error Message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
    	return res.status(400).send(errors);
    } else {
    	checkRightUser(req.body.user_id, req.body.project_id, function(done) {
    		if (done) {
    			pool.query('INSERT INTO project_contributor SET ?', req.body,
    				function(err, result) {
    					if (err) throw err;
    					return res.status(200).send("SUCCESS");
    				});
    		} else
    			return res.status(403).send("FORBIDDEN");
    	});
    }
};

exports.contributorsToProject = function(req, res) {
    req.checkBody('project_id', 'Error message').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT user_id FROM project_followers WHERE follow_project_id = ?", req.body.project_id,
            function(err, result) {
                if (err) throw err;

                var arr = result.map( function(el) { return el.user_id; });
                pool.query("SELECT id, first_name, last_name, profile_picture FROM profiles WHERE id IN (" + arr + ")",
                    function(err, result2) {
                        if (err) throw err;
                        function recursive(index) {
                            if (result2[index]) {
                                pool.query("SELECT username FROM users WHERE profile_id = ?", result2[index].id,
                                    function(err, result3) {
                                        if (err) throw err;
                                        else {
                                            result2[index].username = result3[0].username;
                                            return recursive(index + 1);
                                        }
                                    });
                            } else {
                                return res.status(200).send({success: true, data: result2});
                            }
                        };
                        recursive(0);
                    });
            })
    }
};