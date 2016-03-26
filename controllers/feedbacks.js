exports.createProjectFeedback = function(req, res){
    req.checkBody('project_id', 'Error Message').isInt();
    req.checkBody('public_id', 'Error Message').isInt();
    //req.checkBody('type', 'Error Message').isString().max(10);
    req.checkBody('creator_img', 'Error Message').isString().max(512);
    req.checkBody('title', 'Error Message').isString().max(512);
    req.checkBody('description', 'Error Message').optional().isString().max(512);
    req.checkBody('badge', 'Error Message').isString().max(128);
    req.checkBody('first_name', 'first_name must be a string').isString().max(128);
    req.checkBody('last_name', 'last_name must be a string').isString().max(128);

    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } if (!req.isAuthenticated()){
	return res.status(404).send({message: 'not connected'});
    } else {
            req.body.user_id = req.user.id;
            pool.query('INSERT INTO `project_feedbacks` SET ?', req.body, function(err, result) {
                if (err){
                    throw err;
                }
                res.send(result);
            });
        }
};

exports.updateProjectFeedback = function(req, res){
    var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    req.checkBody('project_id', 'Error Message').optional().isInt();
    req.checkBody('public_id', 'Error Message').optional().isInt();
    req.checkBody('type', 'Error Message').optional().isString().max(10);
    req.checkBody('title', 'Error Message').optional().isString().max(512);
    req.checkBody('description', 'Error Message').optional().isString().max(512);

    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query('UPDATE `project_feedbacks` SET ? WHERE `id` = ' + req.params.id,
        req.body,
        function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.deleteProjectFeedback = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } if (!req.isAuthenticated()) {
	return res.status(404).send({message: 'You need to be connected'});
    } else {
        pool.query("DELETE FROM `project_feedbacks` WHERE `id` = ?",
        [req.params.id],
        function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
	pool.query("DELETE FROM feedback_replies WHERE feedback_id = ?",
	[req.params.id],
	function(err, result) {
	    if (err) {
		throw err;
	    }
	    res.send(result);
	});
    }
};
