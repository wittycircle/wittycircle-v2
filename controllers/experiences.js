function sortUserExperiencePart1(part1, callback) {
    var timestamp,
        timestamp2,
        temp = {};

    function recursive(index) {
        if (part1[index] && part1[index + 1]) {
            timestamp = new Date(part1[index].date_from).getTime();
            timestamp2  = new Date(part1[index + 1].date_from).getTime();

            if (timestamp < timestamp2) {
                temp = part1[index];
                part1[index] = part1[index + 1];
                part1[index + 1] = temp;
                return recursive(0);
            }
            if (part1[index + 2])
                return recursive(index + 1);
            else
                return callback(part1);

        } else
            callback(part1);
    };
    return recursive(0);
};

function sortUserExperiencePart2(part2, callback) {
    var timestamp,
        timestamp2,
        temp = {};

    function recursive(index) {
        if (part2[index] && part2[index + 1]) {
            timestamp = new Date(part2[index].date_to).getTime();
            timestamp2  = new Date(part2[index + 1].date_to).getTime();

            if (timestamp < timestamp2) {
                temp = part2[index];
                part2[index] = part2[index + 1];
                part2[index + 1] = temp;
                return recursive(0);
            }
            if (part2[index + 2])
                return recursive(index + 1);
            else
                return callback(part2);

        } else
            callback(part2);
    };
    return recursive(0);
};

function partUserExperience(list, callback) {
    var part1 = [],
        part2 = [];

    function recursive(index) {
        if (list[index]) {
            if (list[index].date_to === "Present")
                part1.push(list[index]);
            else
                part2.push(list[index]);
            return recursive(index + 1);
        } else
            callback(part1, part2);
    };
    recursive(0);
};

function sortUserExperience(list, callback) {
    if (list[0]) {
        var newList = [];
        partUserExperience(list, function(part1, part2) {
            sortUserExperiencePart1(part1, function(newPart1) {
                sortUserExperiencePart2(part2, function(newPart2) {
                    if (newPart1 && newPart2)
                        newList = newPart1.concat(newPart2);
                    else
                        newList = newPart1 || newPart2;
                    return callback(newList);
                });
            });
        });
    } else
        return callback(false);
};

exports.getUserExperiences = function(req, res) {
    pool.query('SELECT * FROM user_experiences WHERE user_id = ?', req.user.id,
        function(err, result) {
        if (err) throw err;
            if (result[0]) {
                sortUserExperience(result, function(newList) {
                    return res.status(200).send({success: true, data: newList});
                }); 
            } else
                return res.status(200).send({success: false});  
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
                       if (result[0]) {
                           sortUserExperience(result, function(newList) {
                                return res.send({success: true, data: newList});
                           });
                        } else
                            return res.send({success: false});
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
	if (!req.isAuthenticated())
	    return res.status(400);
	else {
	    pool.query("SELECT user_id FROM user_experiences WHERE id = ?", req.params.id,
		       function(err, check) {
			   if (err) throw err;
               if (!check[0])
                return res.status(404).send("UNAUTHORIZED");
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
    }
};
