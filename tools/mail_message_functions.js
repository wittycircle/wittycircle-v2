const mandrill  = require('mandrill-api/mandrill');
var uf          = require('./useful_function');
var _       = require('underscore');


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
                                                    "name": 'recipient',
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

function getInformationForSendMail(user_id, callback) {
    pool.query("SELECT first_name, last_name, profile_picture, location_city, location_state, location_country FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)", user_id,
        function(err, result) {
            if (err) throw err;
            else 
                return callback(result[0]);
        });
};

function getInformationForSendMailToTeam(user_id, callback) {
    pool.query("SELECT title, location_city, location_state, location_country, picture_card, public_id FROM projects WHERE creator_user_id = ?", user_id,
        function(err, result) {
            if (err) throw err;
            if (result[0]) {
                var lastIndex = result.length - 1;
                uf.encodeUrl(result[lastIndex].title, function(newTitle) {
                    result[lastIndex].urlTitle = newTitle;
                    return callback(result[lastIndex]);
                });
            } else
                return callback(false);
        });
};

// INVITATION PEOPLE MANDRILL TEMPLATE
/* This function send invitation email to friends */
function sendMailByMandrill(info, callback) {

    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

    var fullname    = info.first_name + " " + info.last_name;
    var subj        = fullname + " invited you to join Wittycircle";
    
    if (info.location_state)
        var desc    = info.location_city + ", " + info.location_state;
    else
        var desc    = info.location_city + ", " + info.location_country;

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

// VALIDATION NETWORK VERIFY TEMPLATE
/* This function send email to verify project network */

function sendMailToValidateNetwork(info, callback) {

    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

    var fullname    = info.creator_first_name + " " + info.creator_last_name;
    var subj        = fullname + " needs you to verify " + info.title + " is part of the " + info.network + " network";
    var link        = "https://www.wittycircle.com/validation/network/" + info.token;
    var network     = info.network.replace(/ +/g, "");
    var emails      = [];

    if (info.network === "The Refiners") {
        emails = [{
            email: 'pierre@theref.co',
            name: info.creator_first_name,
            type: "to"
        }, {
            email: 'carlos@theref.co',
            name: info.creator_first_name,
            type: "to"
        }]
    } else if (info.network === "Techstars") {
        emails = [{
            email: 'brad.feld@techstars.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'Joel.Alcaraz@techstars.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'Chris.Chang@techstars.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'Karina.Costa@techstars.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'John.Hill@techstars.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'Erin.Ford@techstars.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'Mark.Solon@techstars.com',
            name: info.creator_first_name,
            type: "to"
        }]
    } else if (info.network === "500 Startups") {
        emails = [{
            email: 'bedy@500.co',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'jess@500.co',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'christine@500.co',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'jonathan@500.co',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'bailey@500.co',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'mat@500.co',
            name: info.creator_first_name,
            type: "to"
        }] 
    } else if (info.network === "Y Combinator") {
        emails = [{
            email: 'Steven@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'sharon@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'erica@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'sam@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'adora@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'kat@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'craig@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        },
        {
            email: 'tim@ycombinator.com',
            name: info.creator_first_name,
            type: "to"
        }]
    }

    var template_name = "validation-network";
    var template_content = [{
        "name": "validation-network",
        "content": "content",
    }];

    var message = {
        "html": "<p>HTML content</p>",
        "subject": subj,
        "from_email": "noreply@wittycircle.com",
        "from_name": "Wittycircle",
        "to": emails,
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
                "name": "pjname",
                "content": info.title
            },
            {
                "name": "funame",
                "content": fullname
            },
            {
                "name": "iname",
                "content": info.network
            },
            {
                "name": "ihname",
                "content": network
            },
            {
                "name": "fimg",
                "content": info.creator_picture
            },
            {
                "name": "link",
                "content": link
            }
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

function sendMailByMandrillToTeam(info, infoProject, callback) {

    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

    var fullname    = info.first_name + " " + info.last_name;
    var subj        = fullname + " invited you to join " + infoProject.title;
    var projectUrl  = "https://www.wittycircle.com/project/" + infoProject.public_id + "/" + infoProject.urlTitle;
    
    if (infoProject.location_state)
        var loc    = infoProject.location_city + ", " + infoProject.location_state;
    else
        var loc    = infoProject.location_city + ", " + infoProject.location_country;

    var template_name = "invite-team";
    var template_content = [{
        "name": "invite-team",
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
                "name": "funame",
                "content": fullname
            },
            {
                "name": "ptitle",
                "content": infoProject.title,
            },
            {
                "name": "pimg",
                "content": infoProject.picture_card,
            },
            {
                "name": "floc",
                "content": loc,
            },
            {
                "name": "purl",
                "content": projectUrl,
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

function sendSuggestionPeopleMailByMandrill(data, project_title, email, first_name, last_name, skill_list, callback) {
    if (data[0]) {
        pool.query('SELECT profile_id, username FROM users WHERE id IN (' + data + ')',
            function(err, result) {
                if (err) throw err;
                else {
                    var arr2 = result.map( function(el) { return el.profile_id; });
                    pool.query('SELECT first_name, last_name, profile_picture, location_city, location_state, location_country FROM profiles WHERE id IN (' + arr2 + ')', 
                        function(err, info2) {
                            if (err) throw err;
                            else {
                                var skills      = skill_list[0];
                                if (skill_list[1] && !skill_list[2]) {
                                    skills      = skills + " and " + skill_list[1]; 
                                } else if (skill_list[2]) {
                                    skills      = skills + ", " + skill_list[1] + " and " + skill_list[2];
                                }

                                var main_name = first_name;
                                var subj = first_name + ", here are some people who could help you with " + project_title;
                                var view_number = data.length;

                                if (info2[0]) {
                                    var locat1 = info2[0].location_state ?
                                    // State existe
                                    info2[0].location_city ? info2[0].location_city + ", " + info2[0].location_state : info2[0].location_state + ", " + info2[0].location_country || ""
                                    // Or not
                                    : info2[0].location_city ? info2[0].location_city + ", " + (info2[0].location_country || "") : info2[0].location_country || "";
                                    var picture1    = info2[0].profile_picture;
                                    var fullName1   = info2[0].first_name + ' ' + info2[0].last_name;
                                    var username1   = result[0].username;
                                }
                                if (info2[1]) {
                                    var locat2 = info2[1].location_state ?
                                    info2[1].location_city ? info2[1].location_city + ", " + info2[1].location_state : info2[1].location_state + ", " + info2[1].location_country || ""
                                    : info2[1].location_city ? info2[1].location_city + ", " + (info2[1].location_country || "") : info2[1].location_country || "";
                                    var picture2    = info2[1].profile_picture;
                                    var fullName2   = info2[1].first_name + ' ' + info2[1].last_name;
                                    var username2   = result[1].username;
                                }
                                if (info2[2]) {
                                    var locat3 = info2[2].location_state ?
                                    info2[2].location_city ? info2[2].location_city + ", " + info2[2].location_state : info2[2].location_state + ", " + info2[2].location_country || ""
                                    : info2[2].location_city ? info2[2].location_city + ", " + (info2[2].location_country || "") : info2[2].location_country || "";
                                    var picture3    = info2[2].profile_picture;
                                    var fullName3   = info2[2].first_name + ' ' + info2[2].last_name;
                                    var username3   = result[2].username;
                                }
                                if (info2[3]) {
                                    var locat4 = info2[3].location_state ?
                                    info2[3].location_city ? info2[3].location_city + ", " + info2[3].location_state : info2[3].location_state + ", " + info2[3].location_country || ""
                                    : info2[3].location_city ? info2[3].location_city + ", " + (info2[3].location_country || "") : info2[3].location_country || "";
                                    var picture4    = info2[3].profile_picture;
                                    var fullName4   = info2[3].first_name + ' ' + info2[3].last_name;
                                    var username4   = result[3].username;
                                }
                                if (info2[4]) { 
                                    var locat5 = info2[4].location_state ?
                                    info2[4].location_city ? info2[4].location_city + ", " + info2[4].location_state : info2[4].location_state + ", " + info2[4].location_country || ""
                                    : info2[4].location_city ? info2[4].location_city + ", " + (info2[4].location_country || "") : info2[4].location_country || "";
                                    var picture5    = info2[4].profile_picture;
                                    var fullName5   = info2[4].first_name + ' ' + info2[4].last_name;
                                    var username5   = result[4].username;
                                }

                                var view_more = view_number - 5;
                                if (view_more > 0)
                                    var more = "and " + view_more + " more";
                                else
                                    var more = null;

                                var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');

                                var template_name = "suggestion-profile";
                                var template_content = [{
                                    "name": "suggestion-profile",
                                    "content": "content",
                                }];

                                var message = {
                                    "html": "<p>HTML content</p>",
                                    "subject": subj,
                                    "from_email": "noreply@wittycircle.com",
                                    "from_name": "Wittycircle",
                                    "to": [{
                                        "email": email,
                                        "name": first_name,
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
                                            "rcpt": email,
                                            "vars": [
                                                {
                                                    "name": "uname",
                                                    "content": main_name
                                                },
                                                {
                                                    "name": "skills",
                                                    "content": skills
                                                },
                                                {
                                                    "name": "pimg1",
                                                    "content": picture1
                                                },
                                                {
                                                    "name": "pname1",
                                                    "content": fullName1
                                                },
                                                {
                                                    "name": "ploc1",
                                                    "content": locat1 || ""
                                                },
                                                {
                                                    "name": "purl1",
                                                    "content": "https://www.wittycircle.com/" + username1
                                                },
                                                {
                                                    "name": "pimg2",
                                                    "content": picture2 || null
                                                },
                                                {
                                                    "name": "pname2",
                                                    "content": fullName2 || null
                                                },
                                                {
                                                    "name": "ploc2",
                                                    "content": locat2 || ""
                                                },
                                                {
                                                    "name": "purl2",
                                                    "content": "https://www.wittycircle.com/" + username2
                                                },
                                                {
                                                    "name": "pimg3",
                                                    "content": picture3 || null
                                                },
                                                {
                                                    "name": "pname3",
                                                    "content": fullName3 || null
                                                },
                                                {
                                                    "name": "ploc3",
                                                    "content": locat3 || ""
                                                },
                                                {
                                                    "name": "purl3",
                                                    "content": "https://www.wittycircle.com/" + username3
                                                },
                                                {
                                                    "name": "pimg4",
                                                    "content": picture4 || null
                                                },
                                                {
                                                    "name": "pname4",
                                                    "content": fullName4 || null
                                                },
                                                {
                                                    "name": "ploc4",
                                                    "content": locat4 || ""
                                                },
                                                {
                                                    "name": "purl4",
                                                    "content": "https://www.wittycircle.com/" + username4
                                                },
                                                {
                                                    "name": "pimg5",
                                                    "content": picture5 || null
                                                },
                                                {
                                                    "name": "pname5",
                                                    "content": fullName5 || null
                                                },
                                                {
                                                    "name": "ploc5",
                                                    "content": locat5 || ""
                                                },
                                                {
                                                    "name": "purl5",
                                                    "content": "https://www.wittycircle.com/" + username5
                                                },
                                                {
                                                    "name": "more",
                                                    "content": more
                                                },
                                            ]
                                        }
                                    ]
                                };

                                mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": false}, function(result_send) {
                                    return callback(true);
                                }, function(e) {
                                    // Mandrill returns the error as an object with name and message keys
                                    return callback(false);
                                    throw e;
                                    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
                                });
                            }
                        });
                }
            });
    } else
        return callback();
};


function sendSuggestionProjectMailByMandrill(email, first_name, last_name, projects, callback) {
    var mandrill_client = new mandrill.Mandrill('XMOg7zwJZIT5Ty-_vrtqgA');
    
    function shortDesc(value, wordwise, max, tail) {
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
    };


    var skills      = projects[0].skill;
    if (projects[1] && !projects[2]) {
        skills      = skills + " and " + projects[1].skill; 
    } else if (projects[2]) {
        skills      = skills + ", " + projects[1].skill + " and " + projects[2].skill;
    }

    var fullname    = first_name + " " + last_name;
    var subj        = first_name + ", some projects need your help in " + skills;

    if (projects[0]) {
        var projectUrl1     = "https://www.wittycircle.com/project/" + projects[0].project_pubId + "/" + projects[0].project_newT;
        var loc1            = projects[0].project_city + ", " + projects[0].project_country;
        var desc1          = shortDesc(projects[0].project_desc, true, 76, ' ...');     
        var title1          = projects[0].project_title;
        var picture1        = projects[0].project_picture;
    }
    if (projects[1]) {
        var projectUrl2     = "https://www.wittycircle.com/project/" + projects[1].project_pubId + "/" + projects[1].project_newT;
        var loc2            = projects[1].project_city + ", " + projects[1].project_country;
        var desc2          = shortDesc(projects[1].project_desc, true, 76, ' ...');
        var title2          = projects[1].project_title;
        var picture2         = projects[1].project_picture;
    }
    if (projects[2]) {
        var projectUrl3     = "https://www.wittycircle.com/project/" + projects[2].project_pubId + "/" + projects[2].project_newT;
        var loc3            = projects[2].project_city + ", " + projects[2].project_country;
        var desc3          = shortDesc(projects[2].project_desc, true, 56, ' ...');
        var title3          = projects[2].project_title;
        var picture3         = projects[2].project_picture;
    }
    
    var template_name = "suggestion-project";
    var template_content = [{
        "name": "suggestion-profile",
        "content": "content",
    }];

     var message = {
        "html": "<p>HTML content</p>",
        "subject": subj,
        "from_email": "noreply@wittycircle.com",
        "from_name": "Wittycircle",
        "to": [{
            "email": email,
            "name": first_name,
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
                "rcpt": email,
                "vars": [
                    {
                        "name": "fname",
                        "content": first_name
                    },
                    {
                        "name": "skills",
                        "content": skills
                    },
                    {
                        "name": "ptitle1",
                        "content": title1
                    },
                    {
                        "name": "pimg1",
                        "content": picture1
                    },
                    {
                        "name": "pdesc1",
                        "content": desc1
                    },
                    {
                        "name": "ploc1",
                        "content": loc1,
                    },
                    {
                        "name": "purl1",
                        "content": projectUrl1 || null
                    },
                    {
                        "name": "ptitle2",
                        "content": title2 || null
                    },
                    {
                        "name": "pimg2",
                        "content": picture2 || null
                    },
                    {
                        "name": "pdesc2",
                        "content": desc2 || null
                    },
                    {
                        "name": "ploc2",
                        "content": loc2 || null
                    },
                    {
                        "name": "purl2",
                        "content": projectUrl2 || null
                    },
                    {
                        "name": "ptitle3",
                        "content": title3 || null
                    },
                    {
                        "name": "pimg3",
                        "content": picture3 || null
                    },
                    {
                        "name": "pdesc3",
                        "content": desc3 || null
                    },
                    {
                        "name": "ploc3",
                        "content": loc3 || null
                    },
                    {
                        "name": "purl3",
                        "content": projectUrl3 || null
                    },
                ]
            }
        ]
    };

    var async = false;
    mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content,"message": message, "async": async}, function(result) {
        return callback(true);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        return callback(false);
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        throw e;
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
};

exports.sendValidateNetwork = function(info, callback) {
    pool.query('SELECT token FROM project_network WHERE id = ?', info.id,
        function(err, result) {
            if (err) throw err;
            else {
                info.token = result[0].token;
                sendMailToValidateNetwork(info, function(res) {
                    if (res.success) {
                        pool.query('UPDATE project_network SET admin_check = 1 WHERE id = ?', info.id,
                            function(err, result2) {
                                if (err) throw err;
                                return callback(true);
                            });
                    }
                });
            }
        });
};

// SEND INVITATION TO FRIENDS

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

// SEND INVITATION TO PROJECT TEAM

exports.sendInvitationMailToTeam = function(user_id, mails, callback) {
    getInformationForSendMail(user_id, function(info) {
        getInformationForSendMailToTeam(user_id, function(infoProject) {
            var newMailList = [];
            for (var i = 0; i < mails.length; i++) {
                newMailList.push({
                    email: mails[i],
                    name: info.first_name,
                    type: "to"
                })
            }
            info.to_mailList = newMailList;
            sendMailByMandrillToTeam(info, infoProject, function(done) {
                callback(done);
            });
        });
    });
};

// SUGGESTION MAIL PEOPLE/PROJECT

exports.sendSuggestionMailForPeople = function(profile_id, first_name, last_name, projects, callback) {
    if (projects[0]) {
        pool.query('SELECT email FROM users WHERE profile_id = ?', profile_id,
            function(err, result) {
                if (err) throw err;
                sendSuggestionProjectMailByMandrill(result[0].email, first_name, last_name, projects, function(check) {
                    if (!check)
                        console.log("Send mail to " + result[0].email + " failed!");
                    else
                        console.log("Send mail to " + result[0].email + " success!");
                    return callback();
                });
            });
    } else
        return callback();
};


exports.sendSuggestionMailForProject = function(user_id, project_id, project_title, list_user_id, skill_list, callback) {
    if (list_user_id[0]) {
        pool.query('SELECT email, profile_id FROM users WHERE id = ?', user_id,
            function(err, result) {
                if (err) throw err;
                if (result[0].email.indexOf('@witty.com') >= 0 || result[0].email.indexOf('@wittycircle.com') >= 0)
                    return callback();
                else {
                    pool.query('SELECT first_name, last_name FROM profiles WHERE id = ?', result[0].profile_id,
                        function(err, result2) {
                            var new_list_user = _.without(list_user_id[0], user_id, 1, 8, 9);
                            sendSuggestionPeopleMailByMandrill(new_list_user, project_title, result[0].email, result2[0].first_name, result2[0].last_name, skill_list, function(check){
                                if (!check)
                                    console.log("Send mail to " + result[0].email + " failed!");
                                else
                                    console.log("Send mail to " + result[0].email + " success!");
                                return callback();
                            });
                        });
                }
            });
    }
};
