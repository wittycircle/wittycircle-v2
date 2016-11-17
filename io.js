/*****Socket*****/
var cd          = require('./dateConvert');
var tf          = require('./tools/project_functions');
var np          = require('./tools/notification_permission');
const mandrill  = require('mandrill-api/mandrill');


function getNewD(value, wordwise, max, tail, callback) {
    if (!value) return callback('');
    if (!max) return callback(value);
    if (value.length <= max) return callback(value);
    
    value = value.substr(0, max);
    if (wordwise) {
        var lastspace = value.lastIndexOf(' ');
        if (lastspace != -1) {
            value = value.substr(0, lastspace);
            callback(value + (tail || ' ...'));
        }
    }
}

module.exports = function(app, io, ensureAuth) {
    var users = {};

    if (!ensureAuth)
    return res.status(404).send('Must to be login');

    io.on('connection', function(socket) {
        if (!io.connected) io.connected = true;
        socket.on('disconnect', function(data) {
            //if (!socket.nickname) return ;
            delete users[socket.nickname]; // delete user in the online users' list when the user is disconnect
            socket.broadcast.emit('userOnline', users);
        });

        /*** Register Users ***/
        socket.on('register', function(username){ // save all users connected on socket
            if (username in users) { // check if user is already exist
                socket.broadcast.emit('userOnline', users); // Get Users Online
            } else {
                socket.nickname = username;
                users[socket.nickname] = socket.id;
                updateNicknames();
            }
        });

        updateNicknames = function() { // show all online users and update it
            var nicknames = JSON.stringify(users);
            socket.emit('userOnline', users);
            socket.broadcast.emit('userOnline', users);
        };

        /*** View Notification ***/
        socket.on('view-notification', function(view_user) {
            if (view_user) {
                pool.query('SELECT id, CASE username WHEN ? THEN 1 WHEN ? THEN 2 END AS myorder FROM users WHERE username IN (?, ?) ORDER BY myorder',
                [view_user.viewer, view_user.viewed, view_user.viewer, view_user.viewed],
                function(err, data) {
                    if (err) throw err;
                    if (data[0] && data[1]) {
                        pool.query('SELECT * FROM views WHERE user_id = ? && user_viewed_id = ?',
                        [data[1].id, data[0].id], function(err, rows) {
                            if (err) throw err;
                            if (!rows.length) {
                                pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', [data[0].id], function(err, name) {
                                    pool.query('INSERT INTO views SET ?', {
                                        user_id               : data[1].id,
                                        user_viewed_id        : data[0].id,
                                        user_viewed_username  : name[0].first_name + " " + name[0].last_name,
                                    }, function(err, result){
                                        if (err) throw err;
                                        socket.broadcast.emit('view-notification', "get notif");
                                    });
                                });
                            } else {
                                pool.query('UPDATE views SET view = view + ? WHERE user_id = ? && user_viewed_id = ?',
                                [1, data[0].id, data[1].id],
                                function(err, result) {
                                    if (err) throw err;
                                });
                            }
                        });
                    }
                });
            }
        });

        /*** Follow User Notification ***/
        app.post('/follow/user/:username', function(req, res){
            req.checkParams('username', 'id parameter must be an integer.').isString().min(1);
            var errors = req.validationErrors(true);
            if (errors) {
                return res.status(400).send(errors);
            } else {
                pool.query("SELECT id, email FROM users WHERE username = ?", req.params.username, function(err, data) {
                    if (data[0]) {
                        if (data[0].id !== req.user.id) {
                            pool.query('SELECT * FROM user_followers WHERE user_id = ? && follow_user_id = ?', [req.user.id, data[0].id],
                            function(err, rows) {
                                if (err) throw err;
                                if (!rows.length) {
                                    pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", [req.user.id],
                                    function(err, result) {
                                        if (err) throw err;
                                        var name = result[0].first_name + " " + result[0].last_name;
                                        pool.query("INSERT INTO `user_followers` (`user_id`, `user_username`, `follow_user_id`) VALUES (?, ?, ?)",
                                        [req.user.id, name, data[0].id],
                                        function (err, results, fields) {
                                            if(err) throw err;
                                            socket.broadcast.emit('follow-notification', "get notif");
                                            socket.broadcast.emit('my-follow-users', req.user.id);

                                            //here send the mail
                                            np.sortEmailNotificationPermission('user_follow', [{user_id: data[0].id}], function(pArray) {
                                                if (!pArray)
                                                    return res.status(200).send({success: true, message: "User followed"});
						if (data[0].email.indexOf('witty.com') >= 0)
						    return res.status(200).send({success: true, message: "User followed"});
                                                pool.query("SELECT username FROM users WHERE id = ?",
                                                [req.user.id],
                                                function (err, rslt) {
                                                    if (err) {
                                                        console.log(new Date());
                                                        throw err;
                                                    } else {
                                                        pool.query("SELECT * FROM profiles WHERE id = (select profile_id from users where id = ?)",
                                                        data[0].id,
                                                        function (err, rst) {
                                                            if (err) {
                                                                console.log(new Date());
                                                                throw err;
                                                            } else {
                                                                // send mail here
                                                                function getNewD(value, wordwise, max, tail) {
                                                                    if (!value) return '';

                                                                    max = parseInt(max, 10);
                                                                    if (!max) return value;
                                                                    if (value.length <= max) return value;

                                                                    value = value.substr(0, max);
                                                                    if (wordwise) {
                                                                        var lastspace = value.lastIndexOf(' ');
                                                                        if (lastspace != -1) {
                                                                            value = value.substr(0, lastspace);
                                                                        }
                                                                    }

                                                                    return value + (tail || ' ...');
                                                                }

                                                                var subj = result[0].first_name + " " + result[0].last_name + " followed you on Wittycircle";
                                                                var newd = getNewD(result[0].description, true, 76, ' ...');
                                                                if (result[0].location_country) {
                                                                    var loc = result[0].location_city + ', ' + result[0].location_country;
                                                                }
                                                                if (result[0].location_state) {
                                                                    var loc = result[0].location_city + ', ' + result[0].location_state;
                                                                }
                                                                var url = "https://www.wittycircle.com/" + rslt[0].username;

                                                                var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                                                var template_name = "user-follow";
                                                                var template_content = [{
                                                                    "name": "user-follow",
                                                                    "content": "content",
                                                                }];

                                                                var message = {
                                                                    "html": "<p>HTML content</p>",
                                                                    "subject": subj,
                                                                    "from_email": "noreply@wittycircle.com",
                                                                    "from_name": "Wittycircle",
                                                                    "to": [{
                                                                        "email": data[0].email,
                                                                        "name": 'Recipient',
                                                                        "type": "to"
                                                                    }],
                                                                    "headers": {
                                                                        "Reply-To": "noreply@wittycircle.com"
                                                                    },
                                                                    "important": false,
                                                                    "inline_css": null,
                                                                    "preserve_recipients": null,
                                                                    "view_content_link": null,
                                                                    "tracking_domain": null,
                                                                    "signing_domain": null,
                                                                    "return_path_domain": null,
                                                                    "merge": true,
                                                                    "merge_language": "mailchimp",
                                                                    "global_merge_vars": [{
                                                                        "name": "merge1",
                                                                        "content": "merge1 content"
                                                                    }],
                                                                    "merge_vars": [
                                                                        {
                                                                            "rcpt": data[0].email,
                                                                            "vars": [
                                                                                {
                                                                                    "name": "fname",
                                                                                    "content": rst[0].first_name
                                                                                },
                                                                                {
                                                                                    "name": "ffname",
                                                                                    "content": result[0].first_name
                                                                                },
                                                                                {
                                                                                    "name": "flname",
                                                                                    "content": result[0].last_name
                                                                                },
                                                                                {
                                                                                    "name": "fimg",
                                                                                    "content": result[0].profile_picture_icon
                                                                                },
                                                                                {
                                                                                    "name": "fdesc",
                                                                                    "content": newd
                                                                                },
                                                                                {
                                                                                    "name": "floc",
                                                                                    "content": loc
                                                                                },
                                                                                {
                                                                                    "name": "furl",
                                                                                    "content": url
                                                                                },
                                                                            ]
                                                                        }
                                                                    ]
                                                                };

                                                                var async = false;
                                                                mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
                                                                    return res.send({success: true, msg: "User followed"});
                                                                }, function(e) {
                                                                    // Mandrill returns the error as an object with name and message keys
                                                                    console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                                    throw e;
                                                                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                                                });
                                                            }
                                                        });
                                                }
                                                });
                                            });
                                        });
                                    });
                                } else {
                                    pool.query("DELETE FROM user_followers WHERE user_id = ? && follow_user_id = ?",
                                    [req.user.id, data[0].id], function(err, result) {
                                        if (err) throw err;
                                        res.send({success: true, msg: "User unfollowed"});
                                        socket.broadcast.emit('follow-notification', "get notif");
                                    });
                                }
                            });
                        } else
                        res.send({success: false, object: "you can not follow yourself"});
                    } else
                    res.send({success: false, object: "user not found"});
                });
            }
        });

        /*** Follow Project Notification ***/
        function getIndexPosition(public_id, callback) {
            pool.query('SELECT * FROM `projects` WHERE project_visibility = 1 AND picture_card != "" ORDER BY view DESC',
                function (err, results, fields) {
                    if (err) throw err;
                    tf.sortProjectCard(results, function(data) {
                        if (!data)
                            return callback(false);
                        else {
                            var intPub = parseInt(public_id);
                            function recursive(index) {
                                if (data[index]) {
                                    if (data[index].public_id === intPub) {
                                        return callback(index);
                                    }
                                    else
                                        recursive(index + 1);
                                } else
                                    return callback(false);
                            };
                            recursive(0);
                        }
                    });
                });
        };

        app.put('/follow/project/:id', function(req, res){            
            req.checkParams('id', 'id parameter must be an integer.').isInt().min(1);

            var errors = req.validationErrors(true);
            if (errors) {
                return res.status(400).send(errors);
            } if (!req.isAuthenticated()) {
                return res.status(400).send({message: 'User need to be logged'});
            } else {
                pool.query("SELECT id, title, creator_user_id FROM projects WHERE public_id = ?", [req.params.id], function (err, id) {
                    if (err) throw err;
                    pool.query("SELECT * FROM project_followers WHERE user_id = ? && follow_project_id = ?", [req.user.id, id[0].id],
                    function(err, row) {
                        if (err) throw err;
                        if (!row[0]) {
                            pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", [req.user.id],
                            function(err, name) {
                                if (err) throw err;
                                var fullName = name[0].first_name + " " + name[0].last_name;
                                pool.query("INSERT INTO `project_followers` (`user_id`, `follow_project_id`, user_name, follow_project_title, follow_project_public_id) VALUES (?, ?, ?, ?, ?)",
                                [req.user.id, id[0].id, fullName, id[0].title, req.params.id,],
                                function (err, results, fields) {
                                    if(err) throw err;
                                    //res.send({success: true, msg: "Project followed"});

                                np.sortEmailNotificationPermission('follow_project', [{user_id: id[0].creator_user_id}], function(pArray) {
                                    if (!pArray)
                                        return res.status(200).send({success: true, msg: "Project followed"});
                                    pool.query("SELECT * FROM users WHERE id = ?",
                                    [id[0].creator_user_id],
                                    function (err, rslt) {
                                        if (err) {
                                            throw err;
                                        } else {
					    if (rslt[0].email.indexOf('witty.com') >= 0)
						return res.status(200).send({success: true,message: "Project followed"});
                                            pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)",
                                            [id[0].creator_user_id],
                                            function (err, rst) {
                                                if (err) {
                                                    throw err;
                                                } else {
                                                    pool.query("SELECT * FROM users WHERE id = ?",
                                                    [req.user.id],
                                                    function (err, rez) {
                                                        if (err) {
                                                            throw err;
                                                        } else {
                                                            pool.query('SELECT count(*) FROM project_followers WHERE follow_project_public_id = ?', req.params.id,
                                                                function(err, done) {
                                                                    if (err) throw err;
                                                                    pool.query('UPDATE projects SET vote = ? WHERE public_id = ?', [done[0]['count(*)'], req.params.id],
                                                                        function(err, done2) {
                                                                            if (err) throw err;
                                                                            setTimeout(function() {
                                                                                socket.broadcast.emit('follow-project-notification', "user follow project");
                                                                                socket.broadcast.emit('my-follow-users', req.user.id);
                                                                            }, 1000);
                                                                            if (req.body.index >= 0) {
                                                                                setTimeout(function() {
                                                                                    socket.broadcast.emit('project-vote', {index: req.body.index, user_id: req.user.id});
                                                                                }, 2000);
                                                                            }
                                                                            // else {
                                                                            //     getIndexPosition(req.params.id, function(newIndex) {
                                                                            //         socket.broadcast.emit('project-vote', {index: newIndex, user_id: req.user.id})
                                                                            //     })
                                                                            // }
                                        function getNewD(value, wordwise, max, tail) {
                                        if (!value) return '';
                                        if (!max) return value;
                                        if (value.length <= max) return value;
                                        value = value.substr(0, max);
                                        if (wordwise) {
                                            var lastspace = value.lastIndexOf(' ');
                                            if (lastspace != -1) {
                                            value = value.substr(0, lastspace);
                                            }
                                        }
                                        return value + (tail || ' ...');
                                        }
                                        var subj = name[0].first_name + " " + name[0].last_name + " upvoted " + id[0].title + " on Wittycircle";
                                        var newd = getNewD(name[0].description, true, 76, ' ...');
                                        if (name[0].location_country) {
                                        var loc = name[0].location_city + ', ' + name[0].location_country;
                                        }
                                        if (name[0].location_state) {
                                        var loc = name[0].location_city + ', ' + name[0].location_state;
                                        }
                                        var url = "https://www.wittycircle.com/" + rez[0].username;
                                        
                                        var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');
                                        
                                        var template_name = "follow-project";
                                        var template_content = [{
                                        "name": "follow-project",
                                        "content": "content",
                                        }];
                                        
                                        var message = {
                                        "html": "<p>HTML content</p>",
                                        "subject": subj,
                                        "from_email": "noreply@wittycircle.com",
                                        "from_name": "Wittycircle",
                                        "to": [{
                                            "email": rslt[0].email,
                                            "name": 'Recipient',
                                            "type": "to"
                                        }],
                                        "headers": {
                                            "Reply-To": "noreply@wittycircle.com"
                                        },
                                        "important": false,
                                        "inline_css": null,
                                        "preserve_recipients": null,
                                        "view_content_link": null,
                                        "tracking_domain": null,
                                        "signing_domain": null,
                                        "return_path_domain": null,
                                        "merge": true,
                                        "merge_language": "mailchimp",
                                        "global_merge_vars": [{
                                            "name": "merge1",
                                            "content": "merge1 content"
                                        }],
                                        "merge_vars": [
                                            {
                                            "rcpt": rslt[0].email,
                                            "vars": [
                                                {
                                                "name": "fname",
                                                "content": rst[0].first_name
                                                },
                                                {
                                                "name": "ffname",
                                                "content": name[0].first_name
                                                },
                                                {
                                                "name": "flname",
                                                "content": name[0].last_name
                                                },
                                                {
                                                "name": "fimg",
                                                "content": name[0].profile_picture_icon
                                                },
                                                {
                                                "name": "fdesc",
                                                "content": newd
                                                },
                                                {
                                                "name": "floc",
                                                "content": loc
                                                },
                                                {
                                                "name": "furl",
                                                "content": url
                                                },
                                                {
                                                "name": "ftitle",
                                                "content": id[0].title
                                                }
                                            ]
                                            }
                                        ]
                                        };
                                        
                                        var async = false;
                                        mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
                                        return res.send({success: true, msg: "Project followed"});
                                        }, function(e) {
                                        // Mandrill returns the error as an object with name and message keys
                                        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                        throw e;
                                        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                        });
                                                                        });
                                });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        });
                                    })

                                });
                            });
                        } else {
                            pool.query("DELETE FROM `project_followers` WHERE `user_id` = ? AND `follow_project_id` = ?", [req.user.id, id[0].id],
                            function(err, results) {
                                if (err) throw err;
                                pool.query('SELECT count(*) FROM project_followers WHERE follow_project_public_id = ?', req.params.id,
                                    function(err, finish) {
                                        if (err) throw err;
                                        pool.query('UPDATE projects SET vote = ? WHERE public_id = ?', [finish[0]['count(*)'], req.params.id],
                                            function(err, finish2) {
                                                if (err) throw err; 
                                                    setTimeout(function() {
                                                        socket.broadcast.emit('follow-project-notification', "user unfollow project");
                                                    }, 1000);
                                                if (req.body.index >= 0) {
                                                    setTimeout(function() {
                                                        socket.broadcast.emit('project-vote-del', {index: req.body.index, user_id: req.user.id});
                                                    }, 2000);
                                                }
                                                // else {
                                                //     getIndexPosition(req.params.id, function(newIndex) {
                                                //         socket.broadcast.emit('project-vote-del', {index: newIndex, user_id: req.user.id})
                                                //     })
                                                // }
                                                return res.send({success: true, msg: "Project unfollowed"});
                                            });
                                    });
                            });
                        }
                    });
                });
            }
        });

        /*** Involve User in Project Notification ***/
        app.post('/project/involve', ensureAuth, function(req, res){
            req.checkBody('project_id', 'Project id must be an integrer').isInt().min(1);
            req.checkBody('user_id', 'User_id must be an integrer').isInt().min(1);
            var errors = req.validationErrors(true);

            if (errors) {
                return res.status(400).send(errors);
            } else {
                req.body.invited_by = req.user.id;
                pool.query("INSERT into project_users set ?",
                req.body,
                function(err, result) {
                    if (err) {
                        console.log(new Date());
                        console.log("Error getting projects in projects.js/involvedUserInProject" + "\n");
                        throw err;
                    }
                    socket.broadcast.emit('involve-notification', 'involve project');
                    return res.send({success: true});
                });
            }
        });


        function sortMailList(list, callback) {
            if (list[0]) {
                var newList = [];

                function recursive(index) {
                    if (list[index]) {
                        if (!newList[0]) {
                            newList.push(list[index].user_id);
                            return recursive(index + 1);
                        }
                        else {
                            if (newList.indexOf(list[index].user_id) < 0)
                                newList.push(list[index].user_id);
                            return recursive(index + 1);
                        }
                    } else
                        callback(newList);
                };
                recursive(0);
            } else
                return ;
        }

        /*** Ask Project Notification ***/
        function getFollowersEmail(array, callback){
            var mailList = []; 
            sortMailList(array, function(newArray) {
                function recursive(index) {
                    if (newArray[index]) {
                        pool.query('SELECT email FROM users WHERE id = ?', newArray[index],
                            function(err, result) {
                                if (err) throw err;
                                mailList.push({
                                    email: result[0].email,
                                    name: "Recipient",
                                    type: "to"
                                });
                                recursive(index + 1);
                            });
                    } else
                        callback(mailList);
                };
                recursive(0);
            });
        };

        function getAllUserId(id, project_id, callback) {
            pool.query('SELECT user_id FROM project_followers WHERE follow_project_id = ? AND user_id != ?', [project_id, id],
                function(err, result) {
                    if (err) throw err;
                    else {
                        pool.query('SELECT creator_user_id FROM projects WHERE id = ? AND creator_user_id != ?', [project_id, id],
                            function(err, result2) {
                                if (err) throw err;
                                var object = [{
                                    user_id: result2[0].creator_user_id,
                                }];
                                pool.query('SELECT user_id FROM project_users WHERE project_id = ? AND user_id != ? AND n_accept = 1', [project_id, id], 
                                    function(err, result3) {
                                        if (err) throw err;
                                        else {
                                            var newArray = result.concat(object, result3);
                                            callback(newArray);
                                        }
                                    });
                            });
                    }
                });                
        };

        app.post('/asks', function(req, res) {
            if (!req.isAuthenticated()) {
                return res.status(404).send({message: 'user need to be authenticated'});
            } else {
                req.checkBody('title', 'title need to be a string').isString().max(128);
                req.checkBody('message', 'message need to be a string').optional().isString().max(4096);
                req.checkBody('project_id', 'project_id need to be an int').isInt().min(1);
                req.checkBody('creator_img', 'creator img need to be a string').isString().max(512);
                req.checkBody('first_name', 'first_name need to be a string').isString().max(128);
                req.checkBody('last_name', 'last_name need to be a string').isString().max(128);
                req.checkBody('project_public_id', 'project_public_id need to be an int').isInt().min(1);

                var errors = req.validationErrors(true);
                if (errors) res.status(400).send(errors);
                else {
                    req.body.user_id = req.user.id;
                    var url = req.body.url;
                    delete req.body.url;
                    pool.query("INSERT INTO project_asks SET ?", req.body,
                        function(err, result) {
                            if (err) throw err;
                            socket.broadcast.emit('ask-project-notification', 'hello world!');
                            res.send({success: true, msg: "Project followed"});

                            pool.query('SELECT title FROM projects WHERE id = ?', req.body.project_id,
                                function(err, result2) {
                                    if (err) throw err;
                                    else {
                                        getAllUserId(req.user.id, req.body.project_id, function(newArray) {
                                            if (!newArray[0]) return ;
                                            else {
                                                np.sortEmailNotificationPermission('ask_project', newArray, function(pArray) {
                                                    if (!pArray)
                                                        return ;
                                                    getFollowersEmail(pArray, function(mailList) {
                                                        if (!mailList[0]) return ;
                                                        getNewD(req.body.message, true, 76, ' ...', function(newMessage) {
                                                            var subj = req.body.first_name + " " + req.body.last_name + " asked a question about " + result2[0].title;
                                                            var ptitle = req.body.title,
                                                                finame = req.body.first_name + " " + req.body.last_name,
                                                                picture = req.body.creator_img;

                                                            var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                                            var template_name = "ask-project";
                                                            var template_content = [{
                                                                "name": "ask-project",
                                                                "content": "content",
                                                            }];

                                                            var message = {
                                                                "html": "<p>HTML content</p>",
                                                                "subject": subj,
                                                                "from_email": "noreply@wittycircle.com",
                                                                "from_name": "Wittycircle",
                                                                "to": mailList,
                                                                "headers": {
                                                                    "Reply-To": "noreply@wittycircle.com"
                                                                },
                                                                "important": false,
                                                                "inline_css": null,
                                                                "preserve_recipients": null,
                                                                "view_content_link": null,
                                                                "tracking_domain": null,
                                                                "signing_domain": null,
                                                                "return_path_domain": null,
                                                                "merge": true,
                                                                "merge_language": "mailchimp",
                                                                "global_merge_vars": [{
                                                                    "name": "merge1",
                                                                    "content": "merge1 content"
                                                                }],
                                                                "global_merge_vars": [
                                                                        {
                                                                            "name": "fname",
                                                                            "content": finame,
                                                                        },
                                                                        {
                                                                            "name": "fmtitle",
                                                                            "content": ptitle,
                                                                        },
                                                                        {
                                                                            "name": "fdesc",
                                                                            "content": newMessage,
                                                                        },
                                                                        {
                                                                            "name": "fimg",
                                                                            "content": picture,
                                                                        },
                                                                        {
                                                                            "name": "furl",
                                                                            "content": url
                                                                        },
                                                                        {
                                                                            "name": "fproject",
                                                                            "content": result2[0].title
                                                                        }                                                                    
                                                                ]
                                                            };

                                                            mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result) {
                                                            }, function(e) {
                                                                // Mandrill returns the error as an object with name and message keys
                                                                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                                throw e;
                                                                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                                            });
                                                        });
                                                    });
                                                });
                                            }
                                        });
                                    }
                                });                            
                        });
                }
            }
        });

        /*** Replies Ask Project Notification ***/
        function getAllAskReplyUserId(ask_id, id, callback) {
            pool.query('SELECT user_id FROM ask_replies WHERE ask_id = ? AND user_id != ?', [ask_id, id],
                function(err, result) {
                    if (err) throw err;
                    pool.query('SELECT user_id FROM project_asks WHERE id = ? AND user_id != ?', [ask_id, id],
                        function(err, result2) {
                            if (err) throw err;
                            var array = result.concat(result2);
                            callback(array);
                        });
                }); 
        };

        app.post('/ask_reply/add', function(req, res) {
            if (!req.isAuthenticated()) {
                return res.status(404).send({message: 'user need to be logged in to add an ask reply'});
            } else {
                req.checkBody('ask_id', 'ask_id need to be an int').isInt();
                req.checkBody('description', 'description is a long string plz').isString();
                req.checkBody('creator_picture', 'creator picture is a string containing an url').isString();
                req.checkBody('creator_first_name', 'creator_first_name must be a string').isString();
                req.checkBody('creator_last_name', 'creator_last_name must be a string').isString();

                var errors = req.validationErrors(true);
                if (errors) {
                    return res.status(400).send(errors);
                } else {
                    req.body.user_id = req.user.id;
                    var url = req.body.url;
                    delete req.body.url;
                    pool.query("INSERT INTO ask_replies SET ?", req.body,
                    function (err, result) {
                        if (err) {
                            throw err;
                        }
                        socket.broadcast.emit('ask-project-notification', 'hello world!');
                        res.send({success: true});

                        pool.query('SELECT title FROM projects WHERE id IN (SELECT project_id FROM project_asks WHERE id = ?)', req.body.ask_id,
                            function(err, result2) {
                                if (err) throw err;
                                getAllAskReplyUserId(req.body.ask_id, req.user.id, function(newArray) {
                                    if (!newArray[0]) return ;
                                    else {
                                        np.sortEmailNotificationPermission('reply_project', newArray, function(pArray) {
                                            if (!pArray)
                                                return ;
                                            getFollowersEmail(pArray, function(mailList) {
                                                if (!mailList[0]) return ;
                                                getNewD(req.body.description, true, 76, ' ...', function(newMessage) {
                                                    var subj = req.body.creator_first_name + " " + req.body.creator_last_name + " commented on " + result2[0].title + " question";
                                                    var finame = req.body.creator_first_name + " " + req.body.creator_last_name,
                                                        picture = req.body.creator_picture;

                                                    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                                    var template_name = "reply-project";
                                                    var template_content = [{
                                                        "name": "reply-project",
                                                        "content": "content",
                                                    }];

                                                    var message = {
                                                        "html": "<p>HTML content</p>",
                                                        "subject": subj,
                                                        "from_email": "noreply@wittycircle.com",
                                                        "from_name": "Wittycircle",
                                                        "to": mailList,
                                                        "headers": {
                                                            "Reply-To": "noreply@wittycircle.com"
                                                        },
                                                        "important": false,
                                                        "inline_css": null,
                                                        "preserve_recipients": null,
                                                        "view_content_link": null,
                                                        "tracking_domain": null,
                                                        "signing_domain": null,
                                                        "return_path_domain": null,
                                                        "merge": true,
                                                        "merge_language": "mailchimp",
                                                        "global_merge_vars": [{
                                                            "name": "merge1",
                                                            "content": "merge1 content"
                                                        }],
                                                        "global_merge_vars": [
                                                                {
                                                                    "name": "fname",
                                                                    "content": finame,
                                                                },
                                                                {
                                                                    "name": "fdesc",
                                                                    "content": newMessage,
                                                                },
                                                                {
                                                                    "name": "fimg",
                                                                    "content": picture,
                                                                },
                                                                {
                                                                    "name": "furl",
                                                                    "content": url
                                                                },
                                                                {
                                                                    "name": "fproject",
                                                                    "content": result2[0].title
                                                                }                                                                    
                                                        ]
                                                    };

                                                    mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result) {
                                                    }, function(e) {
                                                        // Mandrill returns the error as an object with name and message keys
                                                        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                        throw e;
                                                        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                                    });
                                                });
                                            });
                                        });
                                    }
                                });
                        });
                    });
                }
            }
        });

        /*** Feedback Project Notification ***/
        app.post('/feedbacks', function(req, res) {
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
                    var url = req.body.url;
                    delete req.body.url;
                    pool.query('INSERT INTO `project_feedbacks` SET ?', req.body, function(err, result) {
                        if (err){
                            throw err;
                        }
                        socket.broadcast.emit('ask-project-notification', 'hello world!');
                        res.send({success: true});

                        pool.query('SELECT title FROM projects WHERE id = ?', req.body.project_id,
                            function(err, result2) {
                                if (err) throw err;
                                else {
                                    pool.query('SELECT user_id FROM project_followers WHERE follow_project_id = ? AND user_id != ?', [req.body.project_id, req.user.id],
                                        function(err, result3) {
                                            if (err) throw err;
                                            if (!result3[0]) return ;
                                            else {
                                                np.sortEmailNotificationPermission('feedback', result3, function(newArray) {
                                                    if (!newArray)
                                                        return ;
                                                    getFollowersEmail(newArray, function(mailList) {
                                                        getNewD(req.body.description, true, 76, ' ...', function(newMessage) {
                                                            var subj = req.body.first_name + " " + req.body.last_name + " asked a question about " + result2[0].title;
                                                            var ptitle = req.body.title,
                                                                finame = req.body.first_name + " " + req.body.last_name,
                                                                picture = req.body.creator_img;

                                                            var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                                            var template_name = "ask-project";
                                                            var template_content = [{
                                                                "name": "ask-project",
                                                                "content": "content",
                                                            }];

                                                            var message = {
                                                                "html": "<p>HTML content</p>",
                                                                "subject": subj,
                                                                "from_email": "noreply@wittycircle.com",
                                                                "from_name": "Wittycircle",
                                                                "to": mailList,
                                                                "headers": {
                                                                    "Reply-To": "noreply@wittycircle.com"
                                                                },
                                                                "important": false,
                                                                "inline_css": null,
                                                                "preserve_recipients": null,
                                                                "view_content_link": null,
                                                                "tracking_domain": null,
                                                                "signing_domain": null,
                                                                "return_path_domain": null,
                                                                "merge": true,
                                                                "merge_language": "mailchimp",
                                                                "global_merge_vars": [{
                                                                    "name": "merge1",
                                                                    "content": "merge1 content"
                                                                }],
                                                                "global_merge_vars": [
                                                                        {
                                                                            "name": "fname",
                                                                            "content": finame,
                                                                        },
                                                                        {
                                                                            "name": "fmtitle",
                                                                            "content": ptitle,
                                                                        },
                                                                        {
                                                                            "name": "fdesc",
                                                                            "content": newMessage,
                                                                        },
                                                                        {
                                                                            "name": "fimg",
                                                                            "content": picture,
                                                                        },
                                                                        {
                                                                            "name": "furl",
                                                                            "content": url
                                                                        },
                                                                        {
                                                                            "name": "fproject",
                                                                            "content": result2[0].title
                                                                        }                                                                    
                                                                ]
                                                            };

                                                            mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result) {
                                                            }, function(e) {
                                                                // Mandrill returns the error as an object with name and message keys
                                                                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                                throw e;
                                                                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                                            });
                                                        });
                                                    });
                                                });
                                            }
                                        });
                                }
                            });
                    });
                }
        });

        /*** Replies Feedback Project Notification ***/
        function getAllHelpReplyUserId(feedback_id, id, callback) {
            pool.query('SELECT user_id FROM feedback_replies WHERE feedback_id = ? AND user_id != ?', [feedback_id, id],
                function(err, result) {
                    if (err) throw err;
                    pool.query('SELECT user_id FROM project_feedbacks WHERE id = ? AND user_id != ?', [feedback_id, id],
                        function(err, result2) {
                            if (err) throw err;
                            var array = result.concat(result2);
                            callback(array);
                        });
                }); 
        };

        app.post('/feedback_replies', function(req, res) {
            if (!req.isAuthenticated()) {
            return res.status(404).send({message: 'User must be logged in to post a reply'});
            } else {
            req.checkBody('feedback_id', 'Must be an integrer').isInt();
            req.checkBody('description', 'Must be a string text').isString().max(1024);
            req.checkBody('creator_picture', 'Must be an url for picture').isString().max(512);
            req.checkBody('creator_first_name', 'Must be a string').isString().max(128);
            req.checkBody('creator_last_name', 'Must be a string').isString().max(128);

            var errors = req.validationErrors(true);
            if (errors) {
                return res.status(400).send(errors);
            } else {
                req.body.user_id = req.user.id;
                var url = req.body.url;
                delete req.body.url;
                pool.query('INSERT INTO feedback_replies SET ?',
                req.body,
                function (err, result) {
                if (err) {
                    throw err;
                }
                    socket.broadcast.emit('ask-project-notification', 'hello world!');
                    res.send({success: true});
                
                    pool.query('SELECT title FROM projects WHERE id IN (SELECT project_id FROM project_feedbacks WHERE id = ?)', req.body.feedback_id,
                            function(err, result2) {
                                if (err) throw err;
                                getAllHelpReplyUserId(req.body.feedback_id, req.user.id, function(newArray) {
                                    if (!newArray[0]) return ;
                                    else {
                                        np.sortEmailNotificationPermission('reply_project', newArray, function(pArray) {
                                            if (!pArray)
                                                return ;
                                            getFollowersEmail(pArray, function(mailList) {
                                                if (!mailList[0]) return ;
                                                getNewD(req.body.description, true, 76, ' ...', function(newMessage) {
                                                    var subj = req.body.creator_first_name + " " + req.body.creator_last_name + " commented on " + result2[0].title + " question";
                                                    var finame = req.body.creator_first_name + " " + req.body.creator_last_name,
                                                        picture = req.body.creator_picture;

                                                    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                                    var template_name = "reply-project";
                                                    var template_content = [{
                                                        "name": "reply-project",
                                                        "content": "content",
                                                    }];

                                                    var message = {
                                                        "html": "<p>HTML content</p>",
                                                        "subject": subj,
                                                        "from_email": "noreply@wittycircle.com",
                                                        "from_name": "Wittycircle",
                                                        "to": mailList,
                                                        "headers": {
                                                            "Reply-To": "noreply@wittycircle.com"
                                                        },
                                                        "important": false,
                                                        "inline_css": null,
                                                        "preserve_recipients": null,
                                                        "view_content_link": null,
                                                        "tracking_domain": null,
                                                        "signing_domain": null,
                                                        "return_path_domain": null,
                                                        "merge": true,
                                                        "merge_language": "mailchimp",
                                                        "global_merge_vars": [{
                                                            "name": "merge1",
                                                            "content": "merge1 content"
                                                        }],
                                                        "global_merge_vars": [
                                                                {
                                                                    "name": "fname",
                                                                    "content": finame,
                                                                },
                                                                {
                                                                    "name": "fdesc",
                                                                    "content": newMessage,
                                                                },
                                                                {
                                                                    "name": "fimg",
                                                                    "content": picture,
                                                                },
                                                                {
                                                                    "name": "furl",
                                                                    "content": url
                                                                },
                                                                {
                                                                    "name": "fproject",
                                                                    "content": result2[0].title
                                                                }                                                                    
                                                        ]
                                                    };

                                                    mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result) {
                                                    }, function(e) {
                                                        // Mandrill returns the error as an object with name and message keys
                                                        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                        throw e;
                                                        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                                    });
                                                });
                                            });
                                        });
                                    }
                                });
                            });
                });
            }
            }
        });

        /*** Send Private Message ***/
        socket.on('private message',  function (data) { // private message between users
            var msg = data.msg.trim(); // clear all whitespace of the end and the begining
            if (msg.substring(0, 9) === '/private '){ // check private
                msg = msg.substr(9);
                var username = data.adresser; // get username of destination
                // msg = msg.substring(msg.indexOf(' ') + 1);
                var names = {
                    senderName          : data.sender,
                    addresserName       : data.adresser,
                }
                if (username in users) { // check if username is in the list of online user
                    saveMessage(names, msg, function(infoMessage){
                        cd.convertDate(infoMessage.date, function(newDate) {
                            infoMessage.date = newDate;
                            socket.emit("send online", infoMessage); // display message to current user
                            socket.broadcast.to(users[username]).emit("send online", infoMessage); // send message to the id corresponding to the username
                            socket.broadcast.emit('notification', "notif");
                        });
                    });
                } else { // when user is offline, save message to the database
                    saveMessage(names, msg, function(infoMessage) {
                        cd.convertDate(infoMessage.date, function(newDate) {
                            infoMessage.date = newDate;
                            socket.emit('send offline', infoMessage);
                            //socket.broadcast.emit("send offline", infoMessage); // display message
                            socket.broadcast.emit('notification', "notif");
                        });
                    });
                }
            };
        });
    });

    function saveMessage (names, message, callback) { // save message into the database
        pool.query('SELECT id, profile_id, CASE username WHEN ? then 1 WHEN ? then 2 END AS myorder FROM users WHERE username IN (?, ?) ORDER BY myorder',
        [names.senderName, names.addresserName, names.senderName, names.addresserName],
        function(err, data) {
            if (err) throw err;
            if (data[0] && data[1]) {
                pool.query('SELECT first_name, last_name, profile_picture_icon, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM profiles WHERE id in (?, ?) ORDER BY myorder',
                [data[0].profile_id, data[1].profile_id, data[0].profile_id, data[1].profile_id],
                function(err, result) {
                    if (err) throw err;

                    var parent = data[0].id + data[1].id;
                    var infoMessage = {
                        from_user_id     : data[0].id,
                        from_username    : result[0].first_name + ' ' + result[0].last_name,
                        to_user_id       : data[1].id,
                        to_username      : result[1].first_name + ' ' + result[1].last_name,
                        parent_id        : parent,
                        message          : message
                    };
                    checkFirstMessage(infoMessage, function (response) {
                        if (response & response === true) {
                            infoMessage.m_send = 1;
                        } else {
                            infoMessage.m_send = 0;
                        }
                        pool.query('INSERT INTO messages SET ?', infoMessage, function(err, done) {
                            if (err) throw err;
                            //checkFirstMessage(infoMessage, done.insertId);
                            infoMessage.from_picture= result[0].profile_picture_icon;
                            infoMessage.date        = new Date();
                            infoMessage.success     = true;
                            callback(infoMessage);
                        });
                    });
                });
            }
        });
    }

    function checkFirstMessage (info, callback) {
        pool.query('SELECT * FROM messages where from_user_id = ? and to_user_id = ?', //checking if messages has already been sent between the 2 users
        [info.from_user_id, info.to_user_id],
        function (err, data) {
            if (err) {
                throw err;
            } else {
                if (data[0]) {
                    // relation exist already, now i must check the last connect of user
                    callback(false);
                } else {
                    pool.query('SELECT * FROM messages where from_user_id = ? and to_user_id = ?', // checking also the relation in the 2 way
                    [info.to_user_id, info.from_user_id],
                    function (err, result) {
                        if (err) {
                            throw err;
                        } else {
                            if (data[0]) {
                                // relation exist already, now i must check the last connect of user
                                return callback(false);
                            } else {
                                        console.log("OKKLDJFKLJSDKLFJKSD")

                                // send mail because no relations exist
                                np.sortEmailNotificationPermission('new_message', [{user_id: info.to_user_id}], function(check) {
                                    if (!check)
                                        return callback(true);
                                    pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users where id = ?)",
                                    [info.from_user_id],
                                    function (err, rslt) {
                                        if (err) {
                                            throw err;
                                        } else {
                                            pool.query("SELECT * FROM users WHERE id = ?",
                                            [info.to_user_id],
                                            function (err, mail) {
                                                if (err) {
                                                    throw err;
                                                } else {
						    if (mail[0].email.indexOf('witty.com') >= 0)
							return callback(true);
                                                    pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users where id = ?)",
                                                    [info.to_user_id],
                                                    function (err, response) {
                                                        if (err) {
                                                            throw err;
                                                        } else {
                                                            
                                                            function getNewD(value, wordwise, max, tail) {
                                                                if (!value) return '';
                                                                if (!max) return value;
                                                                if (value.length <= max) return value;
                                                                value = value.substr(0, max);
                                                                if (wordwise) {
                                                                    var lastspace = value.lastIndexOf(' ');
                                                                    if (lastspace != -1) {
                                                                        value = value.substr(0, lastspace);
                                                                    }
                                                                }
                                                                return value + (tail || ' ...');
                                                            }

                                                            var subj = rslt[0].first_name + " " + rslt[0].last_name + " sent you a message" ;
                                                            var newd = getNewD(info.message, true, 76, ' ...');
                                                            if (rslt[0].location_country) {
                                                                var loc = rslt[0].location_city + ', ' + rslt[0].location_country;
                                                            }
                                                            if (rslt[0].location_state) {
                                                                var loc = rslt[0].location_city + ', ' + rslt[0].location_state;
                                                            }

                                                            var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                                            var template_name = "new-message";
                                                            var template_content = [{
                                                                "name": "new-message",
                                                                "content": "content",
                                                            }];

                                                            var message = {
                                                                "html": "<p>HTML content</p>",
                                                                "subject": subj,
                                                                "from_email": "noreply@wittycircle.com",
                                                                "from_name": "Wittycircle",
                                                                "to": [{
                                                                    "email": mail[0].email,
                                                                    "name": 'Recipient',
                                                                    "type": "to"
                                                                }],
                                                                "headers": {
                                                                    "Reply-To": "noreply@wittycircle.com"
                                                                },
                                                                "important": false,
                                                                "inline_css": null,
                                                                "preserve_recipients": null,
                                                                "view_content_link": null,
                                                                "tracking_domain": null,
                                                                "signing_domain": null,
                                                                "return_path_domain": null,
                                                                "merge": true,
                                                                "merge_language": "mailchimp",
                                                                "global_merge_vars": [{
                                                                    "name": "merge1",
                                                                    "content": "merge1 content"
                                                                }],
                                                                "merge_vars": [
                                                                    {
                                                                        "rcpt": mail[0].email,
                                                                        "vars": [
                                                                            {
                                                                                "name": "fname",
                                                                                "content": response[0].first_name
                                                                            },
                                                                            {
                                                                                "name": "ffname",
                                                                                "content": rslt[0].first_name
                                                                            },
                                                                            {
                                                                                "name": "flname",
                                                                                "content": rslt[0].last_name
                                                                            },
                                                                            {
                                                                                "name": "fimg",
                                                                                "content": rslt[0].profile_picture_icon
                                                                            },
                                                                            {
                                                                                "name": "fdesc",
                                                                                "content": newd
                                                                            },
                                                                            {
                                                                                "name": "floc",
                                                                                "content": loc
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            };

                                                            var async = false;
                                                            mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
                                                                return callback(true);
                                                            }, function(e) {
                                                                // Mandrill returns the error as an object with name and message keys
                                                                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                                throw e;
                                                                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
            }
        });
    }

};
