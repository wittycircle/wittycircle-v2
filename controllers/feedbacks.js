
function getNotifProjectHelp(data, req, callback) {
    var list = [];
    var elem;
    if (data[0]) {
        function recursive(index) {
            elem = data[index];
            if (elem) {
                pool.query('SELECT title FROM projects WHERE id = ?', elem.project_id, 
                    function(err, result) {
                        if (err) throw err;
                        else {
                            list.push({
                                date_of_view        : elem.date_added,
                                user_id             : req.user.id,
                                user_notif_id       : elem.user_id,
                                user_notif_username : elem.first_name + ' ' + elem.last_name,
                                project_title       : result[0].title,
                                project_id          : elem.project_id,
                                type_notif          : "p_help"
                            });
                            return recursive(index + 1);
                        }
                    });
            } else {
                return callback(list);
            }
        };
        return recursive(0);
    } else
        return callback(list);

};

exports.getProjectHelp = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404);
    } else {
        pool.query('SELECT * FROM project_followers WHERE user_id = ?', req.user.id,
            function(err, result) {
                if (err) throw err;
                else {
                    console.log("OOK");
                    if (result[0]) {
                        console.log(result);
                        var array = [];
                        function recursive(index) {
                            if (result[index]) {
                                pool.query('SELECT * FROM project_feedbacks WHERE project_id = ? && date_added >= ? && user_id != ?',
                                    [result[index].follow_project_id, result[index].creation_date, req.user.id],
                                    function(err, result2) {
                                        if (err) throw err;
                                        if (result2[0]) {
                                            for(var i = 0; i < result2.length; i++) {
                                                array.push(result2[i])
                                            }
                                            return recursive(index + 1);
                                        } else
                                            return recursive(index + 1);
                                    });
                            } else {
                                getNotifProjectHelp(array, req, function(newData) {
                                    callback(newData);
                                });
                            }
                        };
                        recursive(0);
                    } else
                        callback([])
                }
            });
    }
};

// exports.createProjectFeedback = function(req, res){
//     req.checkBody('project_id', 'Error Message').isInt();
//     req.checkBody('public_id', 'Error Message').isInt();
//     //req.checkBody('type', 'Error Message').isString().max(10);
//     req.checkBody('creator_img', 'Error Message').isString().max(512);
//     req.checkBody('title', 'Error Message').isString().max(512);
//     req.checkBody('description', 'Error Message').optional().isString().max(512);
//     req.checkBody('badge', 'Error Message').isString().max(128);
//     req.checkBody('first_name', 'first_name must be a string').isString().max(128);
//     req.checkBody('last_name', 'last_name must be a string').isString().max(128);

//     var errors = req.validationErrors(true);
//     if (errors) {
// 	return res.status(400).send(errors);
//     } if (!req.isAuthenticated()){
// 	return res.status(404).send({message: 'not connected'});
//     } else {
//             req.body.user_id = req.user.id;
//             pool.query('INSERT INTO `project_feedbacks` SET ?', req.body, function(err, result) {
//                 if (err){
//                     throw err;
//                 }
//                 res.send(result);
//             });
//         }
// };

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
	});
    }
};
