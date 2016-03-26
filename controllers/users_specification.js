exports.getUserExtendedInformations = function(req, res){
};

exports.getUserProfile = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `profiles` WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` = ?)',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getUserSkills = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `skills` WHERE `id` IN (SELECT `skill_id` FROM `user_skills` WHERE `user_id` = ?)',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getUserFollowers = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `profiles` WHERE `id` IN (SELECT `profile_id` FROM `users` WHERE `id` IN (SELECT `follow_user_id` FROM `user_followers` WHERE `user_id` = ?))',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getUserProjects = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `projects` WHERE `creator_user_id` = ?',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getUserMessages = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `messages` WHERE `from_user_id` = ? OR `to_user_id` = ?',
        [req.params.id, req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getUserPortfolios = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `user_portfolios` WHERE `user_id` = ?',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getUserInterests = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `interests` WHERE `id` IN (SELECT `interest_id` FROM `user_interests` WHERE `user_id` = ?)',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.getUserExperiences = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM `user_experiences` WHERE `user_id` = ?',
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};
