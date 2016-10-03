const mandrill = require('mandrill-api/mandrill');

exports.sendMailUnread = function() {
    pool.query("SELECT * FROM messages where m_send = 0 AND m_read = 0",
    function (err, results) {
        if (err) {
            throw err;
        } else {
            function recursive (index) {
                if (results[index]) {
                    // send mail here
                    pool.query("SELECT email FROM users WHERE id = ?", // first select the mail to send ie: to_user_id
                    results[index].to_user_id,
                    function (err, mail) {
                        if (err) {
                            throw err;
                        } else {
                            pool.query("SELECT * FROM profiles where id IN (SELECT profile_id FROM users WHERE id = ?)", // then select the profiles info of who gonna get it
                            results[index].to_user_id,
                            function (err, response) {
                                if (err) {
                                    throw err;
                                } else {
                                    pool.query("SELECT * FROM profiles where id IN (SELECT profile_id FROM users WHERE id = ?)", // and select the profile info of who write the new message
                                    results[index].from_user_id,
                                    function (err, resp) {
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

                                            var subj = resp[0].first_name + " " + resp[0].last_name + " sent you a message" ;
                                            var newd = getNewD(results[index].message, true, 76, ' ...');
                                            if (resp[0].location_country) {
                                                var loc = resp[0].location_city + ', ' + resp[0].location_country;
                                            }
                                            if (resp[0].location_state) {
                                                var loc = resp[0].location_city + ', ' + resp[0].location_state;
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
                                                        "rcpt": mail[0].email,
                                                        "vars": [
                                                            {
                                                                "name": "fname",
                                                                "content": response[0].first_name
                                                            },
                                                            {
                                                                "name": "ffname",
                                                                "content": resp[0].first_name
                                                            },
                                                            {
                                                                "name": "flname",
                                                                "content": resp[0].last_name
                                                            },
                                                            {
                                                                "name": "fimg",
                                                                "content": resp[0].profile_picture_icon
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
                                                pool.query("UPDATE messages set m_send = 1 WHERE id = ?",
                                                results[index].id,
                                                function (err, rez) {
                                                    if (err) {
                                                        throw err;
                                                    } else {
                                                        recursive(index + 1);
                                                    }
                                                })
                                            }, function(e) {
                                                // Mandrill returns the error as an object with name and message keys
                                                console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
                                                throw e;
                                                // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                            });
                                        }
                                    })
                                }
                            });
                        }
                    });
                } else {
                    return ;
                }
            }
            recursive(0);
        }
    });
};

function sendMailByMandrill(info, callback) {

    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

    var fullname    = info.first_name + " " + info.last_name;
    var subj        = fullname + " invited you to join Wittycircle";
    var desc        = "I just joined Wittycircle, the place where the world meets entrepreneurs. Join me and become part of a vibrant ecosystem.";

    var template_name = "invitation";
    var template_content = [{
        "name": "invitation",
        "content": "content",
    }];

    var message = {
        "html": "<p>HTML content</p>",
        "subject": subj,
        "from_email": "noreply@wittycircle.com",
        "from_name": "Wittycircle",
        "to": info.to_mailList,
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
                "name": "ffname",
                "content": info.first_name
            },
            {
                "name": "flname",
                "content": info.last_name
            },
            {
                "name": "pimg",
                "content": info.profile_picture
            },
            {
                "name": "funame",
                "content": fullname
            },
            {
                "name": "fdesc",
                "content": desc
            },
        ]
    };

    var async = false;
    mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
        return callback({success: true, msg: "Invitation Send"});
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        throw e;
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
};

function getInformationForSendMail(user_id, callback) {
    pool.query("SELECT first_name, last_name, profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", user_id,
        function(err, result) {
            if (err) throw err;
            else 
                return callback(result[0]);
        });
};

exports.sendInvitationMail = function(user_id, mails, callback) {
    getInformationForSendMail(user_id, function(info) {
        var newMailList = [];
        for (var i = 0; i < mails.length; i++) {
            newMailList.push({
                email: mails[i],
                name: info.first_name,
                type: "to"
            })
        }
        info.to_mailList = newMailList;
        sendMailByMandrill(info, function(done) {
            callback(done);
        });
    });
};
