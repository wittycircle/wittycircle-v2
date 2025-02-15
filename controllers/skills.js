exports.getSkills = function(req, res){
    pool.query("SELECT * FROM `skills` ORDER BY priority DESC",
    function (err, results, fields) {
        if(err){
            throw err;
        }
        res.send({skills: results});
    });
};

exports.getSkill = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `user_skills` WHERE `user_id` = ?",
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send({success: true, data: results});
        });
    }
};

exports.getSkillsByUsername = function(req, res) {
    req.checkParams('username', 'username must be maximum 128 characters.').isString().max(128);

    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
	pool.query("SELECT * FROM user_skills WHERE user_id in (SELECT id FROM users WHERE username = ?)", req.params.username,
		   function(err, result) {
		       if (err) throw err;
		       res.send({success: true, data: result});
		   });
    }
};

exports.searchSkills = function(req, res){
    req.checkParams('search', 'Search string must be maximum 128 characters.').isString().max(128);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `skills` WHERE `name` LIKE '%" + req.params.search + "%'",
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.createSkill = function(req, res){
    var session = checkSession(req);
    req.checkBody('name', 'Skill name must be a string between 0 and 64 characters')
    .isString().max(64);
    req.sanitize('name').Clean(true);

    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query('INSERT INTO `skills` SET ?', req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.updateSkill = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    req.checkBody('name', 'Skill name must be a string between 0 and 64 characters').isString().max(64);
    req.checkBody('priority', 'Priority must be an integrer').isInt().min(1);

    req.sanitize('name').Clean(true);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('UPDATE `skills` SET ? WHERE `id` = ' + req.params.id, req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

/*exports.updateprioritySkill = function (req, res) {
    req.checkParams('id', 'id parameter must be an integrer.').isInt().min(1);
    req.checkBody('priority', 'Priority must be an int').isInt().min(1);
*/
exports.deleteSkill = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("DELETE FROM `skills` WHERE `id` = ?",
        [req.params.id],
        function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.deleteUserSkill = function(req, res) {
    req.checkParams('id', 'id must be and interger.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
	pool.query('DELETE FROM user_skills WHERE user_id = ? && skill_id = ?', [req.user.id, req.params.id],
		   function(err, result) {
		       if (err) throw err;
		       res.send({success: true});
		   });
    }
};

exports.addSkillsToUser = function(req, res) {
    req.checkBody('skill_id', 'id must be and interger.').isInt().min(1);
    req.checkBody('skill_name', 'name must be a string').isString().min(1);
    var errors = req.validationErrors(true);
    
    req.body.user_id = req.user.id;
    if (errors) return res.status(400).send(errors);
    else {
	pool.query('SELECT * FROM user_skills WHERE user_id = ? && skill_id = ?', [req.user.id, req.body.skill_id],
		   function(err, result) {
		       if (err) throw err;
		       if (!result[0]) {
			   pool.query('INSERT INTO user_skills SET ?', req.body,
				      function(err, result) {
					  if (err) throw err;
					  res.send({success: true});
				      });
		       }
		   });
    }
};














