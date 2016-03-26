exports.getInterests = function(req, res){
    pool.query("SELECT * FROM `interests` ORDER BY priority DESC",
    function (err, results, fields) {
        if (err) throw err;
        res.send({interests: results});
    });
};

exports.getInterest = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `user_interests` WHERE `user_id` = ?", [req.params.id],
        function (err, results, fields) {
            if(err) throw err;
            res.send({success: true, data: results});
        });
    }
};

exports.getInterestsByUsername = function(req, res) {
    req.checkParams('username', 'username must be maximum 128 characters.').isString().max(128);
    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        pool.query("SELECT * FROM user_interests WHERE user_id in (SELECT id FROM users WHERE username = ?)", req.params.username,
                   function(err, result) {
                       if (err) throw err;
                       res.send({success: true, data: result});
                   });
    }
};

exports.searchInterests = function(req, res){
    req.checkParams('search', 'Error Message').isString().max(128);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `interests` WHERE `name` LIKE '%" + req.params.search + "%'",
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.createInterest = function(req, res){
    var session = checkSession(req);
    req.checkBody('name', 'Interest name must be a string between 0 and 64 characters')
    .isString().max(64);
    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query('INSERT INTO `interests` SET ?', req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.updateInterest = function(req, res){
    var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    req.checkBody('name', 'Category name must be a string between 0 and 64 characters')
    .isString().max(64);
    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query('UPDATE `interests` SET ? WHERE `id` = ' + req.params.id, req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.deleteInterest = function(req, res){
    var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query("DELETE FROM `interests` WHERE `id` = ?",
        [req.params.id],
        function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.deleteUserInterest = function(req, res) {
    req.checkParams('id', 'id must be and interger.').isInt().min(1);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
        pool.query('DELETE FROM user_interests WHERE user_id = ? && interest_id = ?', [req.user.id, req.params.id],
                   function(err, result) {
                       if (err) throw err;
                       res.send({success: true});
                   });
    }
};

exports.addInterestsToUser = function(req, res) {
    req.checkBody('interest_id', 'id must be and interger.').isInt().min(1);
    req.checkBody('interest_name', 'name must be a string').isString().min(1);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
	pool.query('SELECT * FROM user_interests WHERE user_id = ? && interest_id = ?', [req.user.id, req.body.interest_id],
                   function(err, result) {
		              if (err) throw err;
		              if (!result[0]) {
				  req.body.user_id = req.user.id;
				  pool.query('INSERT INTO user_interests SET ?', req.body,
				             function(err, result) {
						 if (err) throw err;
						 res.send({success: true});
					     });
			      }
                   });
    }
};
