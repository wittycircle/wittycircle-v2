exports.getProjectFollowers = function(req, res) {
    req.checkParams('project_id', 'error message').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
	    return res.status(400).send(errors);
    } else {
	    pool.query("SELECT * FROM project_followers WHERE follow_project_id = ?",
	    req.params.project_id,
            function (err, result) {
                if (err) {
		            throw err;
                }
                return res.send(result);
	});
    }
}


exports.getProjectFollowersByPublicId = function(req, res) {
    req.checkParams('public_id', 'public_id must be an int representing the project').isInt().min(1);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM project_followers WHERE public_id = ?",
        req.params.public_id,
        function (err, result) {
            if (err) {
                console.log(new Date());
                console.log("error in 'getProjectFollowersByPublicId'");
                throw err;
            }
            return res.send(result);
        });
    }
}
