/*** REQUIRE TOOL ***/
var tf = require('../tools/project_functions');


exports.getNumberProjectFollowed = function (req, res) {
    req.checkParams('username', 'username must be a string').isString().max(128);

    var errors= req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT id, follow_project_id FROM project_followers WHERE user_id = (SELECT id FROM users WHERE username = ?)',
        [req.params.username],
        function (err, rows) {
            if (err) {
                console.log(new Date());
                throw err;
            } else {
                var array = [];
                function recursive (index) {
                    if (rows[index]) {
                        pool.query('SELECT public_id, title, picture_card, location_city, location_state, location_country FROM projects WHERE id = ?', rows[index].follow_project_id,
                            function(err, result) {
                                if (err) throw err;
                                else {
                                    if (result[0]) {
                                        array.push(result[0]);
                                    }
                                    recursive(index + 1);
                                }
                            });
                    } else {
                        return res.send({success: true, list: array});
                    }
                }
                recursive(0);
            }
        })
    }
}

/***** Follow user *****/
function getNotifUserFollowList(data, callback) {
    var list = [];
    var follow = data;
    for(var n = 0; n < follow.length; n++) {
        var d = follow[n].creation_date;
        list.push({
            creation_date   : d,
            timestamp       : d.getTime(),
            name        : follow[n].user_username,
            user_notif_id   : follow[n].user_id,
            type        : "u_follow"
        });
    }
    callback(list);
};

exports.getFollowList = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be authenticated'});
    } else {
        pool.query('SELECT * FROM user_followers WHERE follow_user_id = ?', [req.user.id],
        function (err, data) {
            if (err) throw err;
            getNotifUserFollowList(data, function(newData) {
                callback(newData);
            });
        });
    }
};

/***** Follow project *****/
function getNotifProjectFollowList(data, callback) {
    var list = [];
    var projectFollow = data;
    for (var n = 0; n < projectFollow.length; n++) {
        var d = projectFollow[n].creation_date;
        list.push({
            creation_date   : d,
            timestamp       : d.getTime(),
            name        : projectFollow[n].user_name,
            user_notif_id   : projectFollow[n].user_id,
            project_title   : projectFollow[n].follow_project_title,
            project_id      : projectFollow[n].follow_project_id,
            type        : "p_follow"
        });
    }
    callback(list);
};

exports.checkFollowProject = function(req, res) {
    req.checkParams('id', 'id parameter must be an interger.').isInt().min(1);
    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } if (!req.isAuthenticated()) {
        return res.status(400).send({message: 'User need to be logged'});
    } else {
        pool.query("SELECT * FROM project_followers WHERE user_id = ? && follow_project_id = ?", [req.user.id, req.params.id],
        function (err, row) {
            if (!row[0]) res.send({follow: false});
            else res.send({follow: true});
        });
    }
};

exports.getFollowUser = function(req, res) {
    req.checkParams('username', 'username must be a string of characters.').isString().min(1).max(128);
    var errors = req.validationErrors(true);
    if (errors) return res.status(400).send(errors);
    else {
        pool.query('SELECT * FROM user_followers WHERE user_id = ? && follow_user_id IN (SELECT id FROM users WHERE username = ?)', [req.user.id, req.params.username],
        function(err, result) {
            if (err) throw err;
            if (result.length)
                res.send({success: true});
            else
                res.send({success: false});
        });
    }
};

exports.getMyProjectFollowedBy = function(req, res, callback) {
    pool.query("SELECT id FROM projects WHERE creator_user_id = ?", [req.user.id],
    function(err, data) {
        if (err) throw err;
        var projects = [];
        function recursive(index) {
            if (data[index]) {
                pool.query("SELECT * FROM project_followers WHERE follow_project_id = ?", [data[index].id],
                function(err, result) {
                    if (err) throw err;
                    for(var i = 0; i < result.length; i++)
                    projects.push(result[i]);
                    recursive(index + 1);
                });
            } else {
                getNotifProjectFollowList(projects, function(newData) {
                    callback(newData);
                });
            }
        };
        recursive(0);
    });
};

exports.getProjectsFollowedByUsername = function (req, res) {
    req.checkParams('username', 'username must be a string of characters').isString().min(1);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
        pool.query("SELECT * FROM project_followers WHERE user_id IN (SELECT id FROM users WHERE username = ?)", req.params.username,
        function (err, results) {
            if (err) throw err;
            if (results[0]) {
                var listProject = [];
                function recursive(index) {
                    if (results[index]) {
                        pool.query("SELECT * FROM `projects` WHERE `id` = ?", results[index].follow_project_id,
                        function(err, result) {
                            if (err) throw err;
                            listProject.push(result[0]);
                            recursive(index + 1);
                        });
                    } else {
                        if (listProject[0]) {
                            tf.sortProjectCard(listProject, function(data) {
                                if (!data)
                                res.status(400).send('Error');
                                else
                                tf.addUserPictureToProject(data, function (rez) {
                                    if (!rez) {
                                        res.status(400).send('Error');
                                    } else {
                                        res.status(200).send(rez);
                                    }
                                });
                            });
                        }
                    }
                };
                recursive(0);
            } else
            res.send({success: true, data: results});
        });
    }
};

exports.getFollowing = function(req, res) {
    req.checkParams('username', 'username must be a string of characters').isString().min(1);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
        pool.query("SELECT * FROM user_followers WHERE user_id IN (SELECT id FROM users WHERE username = ?)", req.params.username,
        function(err, result) {
            if (err) throw err;
            else {
                var array = [];
                function recursive(index) {
                    if (result[index]) {
                        pool.query("SELECT id, profile_picture_icon, first_name, last_name, location_city, location_state, location_country FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)",
                            result[index].follow_user_id, function(err, list) {
                                if (err) throw err;
                                else {
                                    if (list[0])
                                        array.push(list[0]);
                                    recursive(index + 1);
                                }
                            });
                    } else
                        res.send({success: true, data: array});

                }; recursive(0);
            }
        });
    }
};

exports.getFollowers = function(req, res) {
    req.checkParams('username', 'username must be a string of characters').isString().min(1);
    var errors = req.validationErrors(true);

    if (errors) return res.status(400).send(errors);
    else {
        pool.query("SELECT * FROM user_followers WHERE follow_user_id IN (SELECT id FROM users WHERE username = ?)", req.params.username,
        function(err, result) {
            if (err) throw err;
            else {
                var array = [];
                function recursive(index) {
                    if (result[index]) {
                        pool.query("SELECT id, profile_picture_icon, first_name, last_name, location_city, location_state, location_country FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)",
                            result[index].user_id, function(err, list) {
                                if (err) throw err;
                                else {
                                    if (list[0])
                                        array.push(list[0]);
                                    recursive(index + 1);
                                }
                            });
                    } else
                        res.send({success: true, data: array});

                }; recursive(0);
            }
        });
    }
};


/***** Follow User Followed Project *****/

function getNotifUserFollowProject(data, callback) {
    var list = [];
    var followUserProject = data;
    for (var n = 0; n < followUserProject.length; n++) {
        var d = followUserProject[n].creation_date;
        list.push({
            creation_date   : d,
            timestamp       : d.getTime(),
            name        : followUserProject[n].user_name,
            user_notif_id   : followUserProject[n].user_id,
            project_title   : followUserProject[n].follow_project_title,
            project_id      : followUserProject[n].follow_project_id,
            type        : "p_user_follow"
        });
    }
    callback(list);
};

exports.getUserFollowed = function(req, res) {
    pool.query("SELECT * FROM user_followers WHERE user_id = ? && follow_user_id = ?", [req.user.id, req.params.id],
    function(err, row) {
        if (err) throw err;
        if (row[0])
        res.send({success: true, data: row[0]});
    });
};

exports.getAllUserFollowed = function(req, res) {
    pool.query("SELECT * FROM user_followers WHERE user_id = ?", [req.user.id],
    function(err, result) {
        if (err) throw err;
        res.send({success: true, data: result});
    });
};

exports.getProjectFollowedBy = function(req, res, callback) {
    pool.query('SELECT * FROM user_followers WHERE user_id = ?', [req.user.id],
    function(err, result) {
        if (err) throw err;
        var project_user_follow = [];
        function recursive(index) {
            if (result[index]) {
                pool.query("SELECT * FROM project_followers WHERE user_id = ? && creation_date >= ?", [result[index].follow_user_id, result[index].creation_date],
                function(err, results) {
                    if (err) throw err;
                    for(var i = 0; i < results.length; i++)
                    project_user_follow.push(results[i]);
                    recursive(index + 1);
                });
            } else {
                getNotifUserFollowProject(project_user_follow, function(newData) {
                    return callback(newData);
                });
            }
        };
        recursive(0);
    });
};

/***** Follow User Followed User *****/

function getNotifUserFollowUser(data, callback) {
    var list = [];
    var userFollowUser = data;
    function recursive(index) {
        if (userFollowUser[index]) {
            var d = userFollowUser[index].creation_date;
            pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [userFollowUser[index].follow_user_id],
            function (err, data) {
                if (err) throw err;
                var fName = data[0].first_name + " " + data[0].last_name;
                list.push({
                    creation_date   : d,
                    timestamp   : d.getTime(),
                    name        : userFollowUser[index].user_username,
                    user_notif_id   : userFollowUser[index].user_id,
                    user_followed_id    : userFollowUser[index].follow_user_id,
                    user_f_name : fName,
                    type        : "u_user_follow"
                });
                recursive(index + 1);
            });
        } else
        callback(list);
    };
    recursive(0);
};

exports.getUserFollowBy = function(req, res, callback) {
    pool.query('SELECT * FROM user_followers WHERE user_id = ?', [req.user.id],
    function(err, result) {
        if (err) throw err;
        var user_user_follow = [];
        function recursive(index) {
            if (result[index]) {
                pool.query('SELECT * FROM user_followers WHERE user_id = ? && creation_date >= ?', [result[index].follow_user_id, result[index].creation_date],
                function(err, results) {
                    if (err) throw err;
                    for(var i = 0; i < results.length; i++) {
                        if (results[i].follow_user_id !== req.user.id)
                        user_user_follow.push(results[i]);
                    }
                    recursive(index + 1);
                });
            } else {
                getNotifUserFollowUser(user_user_follow, function(newData) {
                    callback(newData);
                });
            }
        };
        recursive(0);
    });
};

exports.getListFollowedUser = function(req, res) {
    if (req.body.success && req.body.data[0] && req.body.list[0]) {
        var checkFollow = {};
        var count;
        var list    = req.body.list;
        var findList    = req.body.data;
        function recursive(index) {
            if (list[index]) {
                pool.query('SELECT id FROM users WHERE profile_id = ?', list[index].id, function(err, userId) {
                    if (err) throw err;
                    if (userId[0]) {
                        var id = userId[0].id;
                        for (var i = 0; i < findList.length; i++) {
                            if (findList[i].follow_user_id === id) {
                                checkFollow[index] = true;
                                count++;
                                break ;
                            }
                        }
                        if (count === findList.length)
                        res.send(checkFollow);
                        else
                        recursive(index + 1);
                    } else
                    recursive(index + 1);
                });
            } else
            res.send(checkFollow);
        };
        recursive(0);
    } else
    res.send({success: false, msg: "error data!"});
};
