/*****Socket*****/
var cd = require('./dateConvert');
const mandrill = require('mandrill-api/mandrill');


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

                                                            var subj = result[0].first_name + " " + result[0].last_name + " followed you on Wittycirlce";
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
                                                                    "name": 'kkkkk',
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
                                    socket.broadcast.emit('follow-project-notification', "user follow project");
                                    socket.broadcast.emit('my-follow-users', req.user.id);
                                    //res.send({success: true, msg: "Project followed"});

                                    pool.query("SELECT * FROM users WHERE id = ?",
                                    [id[0].creator_user_id],
                                    function (err, rslt) {
                                        if (err) {
                                            throw err;
                                        } else {
                                            pool.query("SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)",
                                            [id[0].creator_user_id],
                                            function (err, rst) {
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
                                                    var subj = name[0].first_name + " " + name[0].last_name + " followed " + id[0].title + " on Wittycirlce";
                                                    var newd = getNewD(name[0].description, true, 76, ' ...');
                                                    if (name[0].location_country) {
                                                        var loc = name[0].location_city + ', ' + name[0].location_country;
                                                    }
                                                    if (name[0].location_state) {
                                                        var loc = name[0].location_city + ', ' + name[0].location_state;
                                                    }
                                                    var url = "https://www.wittycircle.com/" + rslt[0].username;

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
                                                            "name": 'kkkkk',
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
                                                }
                                            });
                                        }
                                    })

                                });
                            });
                        } else {
                            pool.query("DELETE FROM `project_followers` WHERE `user_id` = ? AND `follow_project_id` = ?", [req.user.id, id[0].id],
                            function(err, results) {
                                if (err) throw err;
                                socket.broadcast.emit('follow-project-notification', "user unfollow project");
                                res.send({success: true, msg: "Project unfollowed"});
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
                    res.send(result);
                });
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
                    var parent = data[0].id + data[1].id;
                    var infoMessage = {
                        from_user_id     : data[0].id,
                        from_username    : result[0].first_name + ' ' + result[0].last_name,
                        to_user_id       : data[1].id,
                        to_username      : result[1].first_name + ' ' + result[1].last_name,
                        parent_id        : parent,
                        message          : message
                    };
                    pool.query('INSERT INTO messages SET ?', infoMessage, function(err, done) {
                        if (err) throw err;
                        infoMessage.from_picture= result[0].profile_picture_icon;
                        infoMessage.date		= new Date();
                        infoMessage.success		= true;
                        callback(infoMessage);
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
                    return;
                } else {
                    pool.query('SELECT * FROM messages where from_user_id = ? and to_user_id = ?', // checking also the relation in the 2 way
                    [info.to_user_id, info.from_user_id],
                    function (err, result) {
                        if (err) {
                            throw err;
                        } else {
                            if (data[0]) {
                                // relation exist already, now i must check the last connect of user
                                return;
                            } else {
                                // send mail because no relations exist
                            }
                        }
                    });
                }
            }
        });
    }

};
