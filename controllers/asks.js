var tf            = require('../tools/project_functions');


// exports.createAsk = function(req, res) {
//     if (!req.isAuthenticated()) {
//         return res.status(404).send({message: 'user need to be authenticated'});
//     } else {
//         req.checkBody('title', 'title need to be a string').isString().max(128);
//         req.checkBody('message', 'message need to be a string').optional().isString().max(1024);
//         req.checkBody('project_id', 'project_id need to be an int').isInt().min(1);
//         req.checkBody('creator_img', 'creator img need to be a string').isString().max(512);
//         req.checkBody('first_name', 'first_name need to be a string').isString().max(128);
//         req.checkBody('last_name', 'last_name need to be a string').isString().max(128);
//         req.checkBody('project_public_id', 'project_public_id need to be an int').isInt().min(1);

//         var errors = req.validationErrors(true);
//         if (errors) {
//             var date = new Date();
//             console.log(date + "\n");
//             console.log("error in creating a ask" + "\n");
//             console.log(errors);
//             console.log("\n");
//             res.status(400).send(errors);
//         } else {
//             req.body.user_id = req.user.id;
//             pool.query("INSERT INTO project_asks SET ?", req.body,
//                 function (err, result) {
//                     if (err) {
//                         throw err;
//                     }
//                     res.send(result)
//                 });
//         }
//     }
// };

/*** Ask Notif ***/
function getNotifProjectAsk(data, req, callback) {
    var list = [];
    var elem;
    if (data[0]) {
        function recursive(index) {
            elem = data[index];
            if (elem) {
                pool.query('SELECT title FROM projects WHERE id = ?', elem.project_id, 
                    function(err, result) {
                        if (err) throw {error: err, title: "getNotifProjectAsk", date: new Date()};
                        else {
                            list.push({
                                date_of_view        : elem.created_at,
                                user_id             : req.user.id,
                                user_notif_id       : elem.user_id,
                                user_notif_username : elem.first_name + ' ' + elem.last_name,
                                project_title       : result[0].title,
                                project_id          : elem.project_id,
                                type_notif          : "p_ask"
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

exports.getProjectAskForCreator = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404);
    } else {
        pool.query('SELECT id FROM projects WHERE creator_user_id = ?', req.user.id,
            function(err, result) {
                if (err) throw err;
                if (result[0]) {
                    var array = [];
                    function recursive(index) {
                        if (result[index]) {
                            pool.query('SELECT * FROM project_asks WHERE project_id = ? && user_id != ?',
                                [result[index].id, req.user.id],
                                function(err, result2) {
                                    if (err) throw err;
                                    if (result2[0]) {
                                        for(var i = 0; i < result2.length; i++)
                                            array.push(result2[i])
                                        return recursive(index + 1);
                                    } else
                                        return recursive(index + 1);
                                });
                        } else {
                            getNotifProjectAsk(array, req, function(newData) {
                                return callback(newData);
                            });
                        }
                    };
                    recursive(0);
                } else
                    callback([]);
            });
    }
};

exports.getProjectAskForInvolvedUsers = function(req, res, callback) {
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
                                pool.query('SELECT * FROM project_asks WHERE project_id = ? && created_at >= ? && user_id != ?',
                                    [result[index].project_id, result[index].creation_date, req.user.id],
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
                                getNotifProjectAsk(array, req, function(newData) {
                                    return callback(newData);
                                });
                            }
                        };
                        recursive(0);
                    } else
                        callback([]);
                }
            });
    }
};

exports.getProjectAsk = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be authenticated'});
    } else {
        pool.query('SELECT * FROM project_followers WHERE user_id = ?', req.user.id,
            function(err, result) {
                if (err) throw error;
                if (result[0]) {
                    var array = [];
                    function recursive(index) {
                        if (result[index]) {
                            pool.query("SELECT * FROM project_asks WHERE project_public_id = ? && created_at >= ? && user_id != ?", 
                                [result[index].follow_project_public_id, result[index].creation_date, req.user.id],
                                    function(err, result2) {
                                        if (err) throw {error: err, date: new Date()};
                                        if (result2[0]) {
                                            for(var i = 0; i < result2.length; i++) {
                                                array.push(result2[i]);
                                            }
                                            return recursive(index + 1);
                                        } else
                                            return recursive(index + 1);
                                    });
                        } else {
                            getNotifProjectAsk(array, req, function(newData) {
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

/*** Reply to Ask ***/
function getNotifProjectReplyAsk(array, req, callback) {
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
                                type_notif          : "p_reply_ask"
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
                            if (newArray[index2].ask_id === array[index].ask_id)
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
                        pool.query('SELECT project_id FROM project_asks WHERE id = ?', newArray[index3].ask_id,
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

exports.getProjectReplyAskForCommentUsers = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be authenticated'});
    } else {
        pool.query('SELECT * FROM ask_replies WHERE user_id = ? order by ask_id, created_at desc', req.user.id,
            function(err, result) {
                if (err) throw err;
                if (result[0]) {
                    removeSameElementInArray(result, function(result2) {
                        if (result2[0]) {
                            var array = [];
                            function recursive(index) {
                                if (result2[index]) {
                                    pool.query('SELECT * FROM ask_replies WHERE ask_id = ? && created_at > ? && user_id != ?',
                                        [result2[index].ask_id, result2[index].created_at, req.user.id],
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
                                    getNotifProjectReplyAsk(array, req, function(newData) {
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

exports.getProjectReplyAskForCreator = function(req, res, callback) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be authenticated'});
    } else {
        pool.query('SELECT * FROM project_asks WHERE user_id = ?', req.user.id,
            function(err, result) {
                if (err) throw err;
                if (result[0]) {
                    var array = [];
                    function recursive(index) {
                        if (result[index]) {
                            pool.query('SELECT * FROM ask_replies WHERE ask_id = ? && user_id != ?', 
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
                            getNotifProjectReplyAsk(array, req, function(newData) {
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

exports.deleteAsk = function(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be authenticated'});
    } else {
        req.checkParams('ask_id', 'ask_id need to be an int').isInt();

        var errors = req.validationErrors(true);
        if (errors) {
            res.status(400).send(errors);
        } else {
            pool.query("SELECT user_id from project_ask where id = ?",
            req.params.id,
            function (err, result) {
                if (err) {
                    throw err;
                }
                if (result[0].user_id == req.user.id) {
                    pool.query("DELETE FROM project_ask where id = ?",
                    req.params.id,
                    function(error, response) {
                        if (error) {
                            throw error;
                        }
                        res.send(response);
                    });
                }
                else {
                    res.status(404).send({message: 'you havent the acces to delete this ask'});
                }
            });
        }
    }
};

exports.getAsksofProject = function(req, res) {
    req.checkParams('project_id', 'project_id must be an integrer');

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query("SELECT * FROM project_asks WHERE project_id = ?",
        req.params.project_id,
        function(err, result) {
            if (err) {
                throw err;
            }
            res.send(result);
        });
    }
};

exports.getAsksofProjectByPublicId = function (req, res) {
    req.checkParams('project_public_id', 'project_id must be an integrer');

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM project_asks WHERE project_public_id = ?',
        req.params.project_public_id,
        function (err, results) {
            if (err) {
                throw err;
            } else {
                function recursive (index) {
                    if (results[index]) {
                        pool.query('SELECT * FROM `ask_replies` WHERE `ask_id` = ?',
                        results[index].id,
                        function (err, response) {
                          if (err) {
                            console.log(new Date());
                            throw err;
                          }
                          results[index].replies = response;
                          recursive(index + 1);
                        });
                    } else {
                        tf.addprofilestoFeedbacks(req.user, results, function(rez) {
                            if (!rez) {
                                return res.send(results);
                            } else {
                                return res.send(rez);
                            }
                        })
                    }
                }
                recursive(0);
            }
        });
    }
};

// exports.addAskReply = function(req, res) {
//     if (!req.isAuthenticated()) {
//         return res.status(404).send({message: 'user need to be logged in to add an ask reply'});
//     } else {
//         req.checkBody('ask_id', 'ask_id need to be an int').isInt().min(1);
//         req.checkBody('description', 'description is a long string plz').isString().max(1024);
//         req.checkBody('creator_picture', 'creator picture is a string containing an url').isString().max(512);
//         req.checkBody('creator_first_name', 'creator_first_name must be a string').isString().max(128);
//         req.checkBody('creator_last_name', 'creator_last_name must be a string').isString().max(128);

//         var errors = req.validationErrors(true);
//         if (errors) {
//             return res.status(400).send(errors);
//         } else {
//             req.body.user_id = req.user.id;
//             pool.query("INSERT INTO ask_replies SET ?", req.body,
//             function (err, result) {
//                 if (err) {
//                     throw err;
//                 }
//                 res.send(result);
//             });
//         }
//     }
// };

exports.getAskReplies = function(req, res) {
    req.checkParams('ask_id', 'ask_id must be an integrer').isInt();

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
        pool.query('SELECT * FROM ask_replies WHERE ask_id = ?',
        [req.params.ask_id],
        function (err, results) {
            if (err) {
                throw err
            }
            res.send(results);
        });
    }
};

exports.deleteAskReplies = function(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: 'user need to be logged in'});
    } else {
        req.checkParams('id', 'id must be an integrer').isInt();

        var errors = req.validationErrors(true);
        if (errors) {
            return res.status(400).send(errors);
        } else {
            pool.query('DELETE FROM ask_replies where id = ?',
            [req.params.id],
            function (err, response) {
                if (err) {
                    throw err;
                }
                res.send(response);
            });
        }
    }
};
