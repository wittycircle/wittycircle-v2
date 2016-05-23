
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
                    if (result[0]) {
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

function getNotifProjectReplyHelp(array, req, callback) {
    var list = [];
    var elem;
    if (array[0]) {
        function recursive(index) {
            elem = array[index];
            if (elem) {
                pool.query('SELECT title FROM projects WHERE id = ?', elem.project_id, 
                    function(err, result) {
                        if (err) throw err;
                        else {
                            list.push({
                                date_of_view        : elem.created_at,
                                user_id             : req.user.id,
                                user_notif_id       : elem.user_id,
                                user_notif_username : elem.creator_first_name + ' ' + elem.creator_last_name,
                                project_title       : result[0].title,
                                project_id          : elem.project_id,
                                type_notif          : "p_reply_help"
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

function removeSameElementInArray(array, callback) {
    if (array[0]) {
        var newArray = [];
        function recursive(index) {
            if (array[index]) {
                if (!newArray[0]) {
                    newArray.push(array[index]);
                    recursive(index + 1);
                }
                else {
                    function recursive2(index2) {
                        if (newArray[index2]) {
                            if (newArray[index2].feedback_id === array[index].feedback_id)
                                recursive(index + 1);
                            else
                                recursive2(index2 + 1)
                        } else {
                            newArray.push(array[index]);
                            recursive(index + 1);
                        }
                    };
                    recursive2(0);
                }
            } else {
                function recursive3(index3) {
                    if (newArray[index3]) {
                        pool.query('SELECT project_id FROM project_feedbacks WHERE id = ?', newArray[index3].feedback_id,
                            function(err, result) {
                                if (err) throw err;
                                if (!result[0])
                                    return recursive3(index3 + 1);
                                else {
                                    newArray[index3].project_id = result[0].project_id;
                                    return recursive3(index3 + 1);
                                }
                            });
                    } else {
                        callback(newArray);
                    }
                };
                recursive3(0);
            }
        };
        recursive(0);
    } else
        callback(newArray);
};

exports.getProjectReplyHelp = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be authenticated'});
    } else {
        pool.query('SELECT * FROM feedback_replies WHERE user_id = ? order by feedback_id, created_at desc', req.user.id,
            function(err, result) {
                if (err) throw err;
                if (result[0]) {
                    removeSameElementInArray(result, function(result2) {
                        if (result2[0]) {
                            var array = [];
                            function recursive(index) {
                                if (result2[index]) {
                                    pool.query('SELECT * FROM feedback_replies WHERE feedback_id = ? && created_at > ? && user_id != ?',
                                        [result2[index].feedback_id, result2[index].created_at, req.user.id],
                                        function(err, result3) {
                                            if (err) throw result3;
                                            if (result3[0]) {
                                                for(var i = 0; i < result3.length; i++) {
                                                    result3[i].project_id = result2[index].project_id;
                                                    array.push(result3[i]);
                                                }
                                                return recursive(index + 1);
                                            } else
                                                return recursive(index + 1);
                                        });
                                } else {
                                    getNotifProjectReplyHelp(array, req, function(newData) {
                                        return callback(newData);
                                    });
                                }
                            };
                            recursive(0);
                        } else
                            callback([]);
                    });
                } else
                    return callback([]);
            });
    }
};

exports.getProjectReplyHelpForInvolvedUser = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404);
    } else {
        pool.query('SELECT * FROM project_users WHERE user_id = ? && n_accept = 1', req.user.id, 
            function(err, result) {
                if (err) throw err;
                else {
                    if (result[0]) {
                        var array = [];
                        function recursive(index) {
                            if (result[index]) {
                                pool.query('SELECT * FROM project_feedbacks WHERE project_id = ? && user_id != ?',
                                    [result[index].project_id, req.user.id],
                                    function(err, result2) {
                                        if (err) throw err;
                                        if (result2[0]) {
                                            function recursive2(index2) {
                                                if (result2[index2]) {
                                                    pool.query('SELECT * FROM feedback_replies WHERE feedback_id = ? && user_id != ?',
                                                        [result2[index2].id, req.user.id],
                                                        function(err, result3) {
                                                            if (err) throw err;
                                                            if (result3[0]) {
                                                                for(var i = 0; i < result3.length; i++) {
                                                                        result3[i].project_id = result2[index2].project_id;
                                                                        array.push(result3[i]);
                                                                }
                                                                return recursive2(index2 + 1);
                                                            } else
                                                                return recursive2(index2 + 1);
                                                        });
                                                } else
                                                    return recursive(index + 1);
                                            };
                                            recursive2(0);
                                        } else
                                            return recursive(index + 1);
                                    });
                            } else {
                                getNotifProjectReplyHelp(array, req, function(newData) {
                                    return callback(newData);
                                });
                            }
                        };
                        recursive(0);
                    } else
                        return callback([]);
                }
            });
    }
};

exports.getProjectReplyHelpForCreator = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be authenticated'});
    } else {
        pool.query('SELECT * FROM project_feedbacks WHERE user_id = ?', req.user.id,
            function(err, result) {
                if (err) throw err;
                if (result[0]) {
                    var array = [];
                    function recursive(index) {
                        if (result[index]) {
                            pool.query('SELECT * FROM feedback_replies WHERE feedback_id = ? && user_id != ?', 
                                [result[index].id, req.user.id],
                                function(err, result2) {
                                    if (err) throw err;
                                    if (result2[0]) {
                                        for(var i = 0; i < result2.length; i++) {
                                            result2[i].project_id = result[index].project_id;
                                            array.push(result2[i]);
                                        }
                                        return recursive(index + 1);
                                    } else
                                        return recursive(index + 1);
                                });
                        } else {
                            getNotifProjectReplyHelp(array, req, function(newData) {
                                return callback(newData);
                            });
                        }
                    };
                    recursive(0);
                } else
                    return callback([]);
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
