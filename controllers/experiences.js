exports.getUserExperiences = function(req, res) {
    pool.query('SELECT * FROM user_experiences WHERE user_id = ?', req.user.id,
	       function(err, result) {
		   if (err) throw err;
		   res.send({success: true, data: result});
	       });
};

exports.getUserExperiencesByUsername = function(req, res) {
    req.checkParams('username', 'username must be maximum 128 characters.').isString().max(128);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
        pool.query("SELECT * FROM user_experiences WHERE user_id in (SELECT id FROM users WHERE username = ?)", req.params.username,
                   function(err, result) {
                       if (err) throw err;
                       res.send({success: true, data: result});
                   });
    }
};

exports.createUserExperience = function(req, res){
    //var session = checkSession(req);
    req.checkBody('title', 'Error Message').isString().max(128);
    req.checkBody('company', 'Error Message').isString().max(128);
    req.checkBody('date_from', 'Error Message').isString().max(128);
    req.checkBody('date_to', 'Error Message').isString().max(128);
    req.checkBody('location_city', 'Error Message').optional().isString().max(128);
    req.checkBody('location_state', 'Error Message').optional().isString().max(128);
    req.checkBody('location_country', 'Error Message').optional().isString().max(128);
    req.checkBody('description', 'Error Message').optional().isString();
    
    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    req.body.user_id = req.user.id;
    pool.query('INSERT INTO `user_experiences` SET ?', req.body, function(err, result) {
        if (err) throw err;
        res.send({success: true});
    });
};

exports.updateUserExperience = function(req, res){
    //var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    req.checkBody('title', 'Error Message').optional().isString().max(128);
    req.checkBody('company', 'Error Message').optional().isString().max(128);
    req.checkBody('date_from', 'Error Message').optional().isString().max(128);
    req.checkBody('date_to', 'Error Message').optional().isString().max(128);
    req.checkBody('location_city', 'Error Message').optional().isString().max(128);
    req.checkBody('location_state', 'Error Message').optional().isString().max(128);
    req.checkBody('location_country', 'Error Message').optional().isString().max(128);
    req.checkBody('description', 'Error Message').optional().isString();

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        pool.query('UPDATE `user_experiences` SET ? WHERE `id` = ' + req.params.id, req.body, function(err, result) {
            if (err) throw err;
            res.send({success: true});
        });
    }
};

exports.deleteUserExperience = function(req, res){
    //var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
	pool.query("SELECT user_id FROM user_experiences WHERE id = ?", req.params.id,
		   function(err, check) {
		       if (err) throw err;
		       if (req.user.id === check[0].user_id) {
			   pool.query("DELETE FROM `user_experiences` WHERE `id` = ?", [req.params.id],
				      function(err, result) {
					  if (err) throw err;
					  res.send({success: true});
				      });
		       } else
			   res.send({success: false, msg: "Cannot delete postion"});
		   });
    }
};
