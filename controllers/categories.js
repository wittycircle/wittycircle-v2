exports.getCategories = function(req, res){
    pool.query("SELECT * FROM `categories`",
        function (err, results, fields) {
            if(err){
                throw err;
            }
        res.send(results);
    });
};

exports.getCategory = function(req, res){
    req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `categories` WHERE `id` = ?",
        [req.params.id],
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.searchCategories = function(req, res){
    req.checkParams('search', 'Error Message').isString().max(128);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM `categories` WHERE `name` LIKE '%" + req.params.search + "%'",
        function (err, results, fields) {
            if(err){
                throw err;
            }
            res.send(results);
        });
    }
};

exports.createCategory = function(req, res){
    var session = checkSession(req);
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
        pool.query('INSERT INTO `categories` SET ?', req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.updateCategory = function(req, res){
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
        pool.query('UPDATE `categories` SET ? WHERE `id` = ' + req.params.id, req.body, function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};

exports.deleteCategory = function(req, res){
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
        pool.query("DELETE FROM `categories` WHERE `id` = ?",
        [req.params.id],
        function(err, result) {
            if (err){
                throw err;
            }
            res.send(result);
        });
    }
};
