exports.likeUserPortfolio = function(req, res){
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
        pool.query("INSERT INTO `portfolios_likes` SET = ?",
        {user_id: req.body.user_id, portfolio_id: req.body.portfolio_id},
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.dislikeUserPortfolio = function(req, res){
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
        pool.query("DELETE FROM `portfolios_likes` WHERE `user_id` = ? AND `portfolio_id` = ?",
        [req.body.user_id, req.body.portfolio_id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.createUserPortfolio = function(req, res){
    var session = checkSession(req);
    req.checkBody('description', 'Error Message');
    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query('INSERT INTO `user_portfolios` SET ?', req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.updateUserPortfolio = function(req, res){
    var session = checkSession(req);
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    req.checkBody('description', 'Error Message');
    var errors = req.validationErrors(true);
    if (errors || session) {
        if(session){
            return res.status(400).send(session);
        } else {
            return res.status(400).send(errors);
        }
    } else {
        pool.query('UPDATE `user_portfolios` SET ? WHERE `id` = ' + req.params.id, req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.deleteUserPortfolio = function(req, res){
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
        pool.query("DELETE FROM `user_portfolios` WHERE `id` = ?",
        [req.params.id],
        function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};
