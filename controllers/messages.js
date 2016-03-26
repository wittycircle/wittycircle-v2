

/* Data messages */

function convertDate(date, callback) { // convert default format date to display date's format

    // get day of the week
    var WDay            = date.getDay();

    // get timestamp
    var dateNow         = new Date();
    var dateNowParse    = dateNow.getTime();
    var parseDate       = date.getTime();

    // get second, min, hour and day passed between now and a specific date by getting passed timestamp
    var gPS     = (dateNowParse - parseDate) / 1000;
    var gPMin   = gPS / 60;
    var gPH     = gPMin / 60;
    var gPD     = gPH / 24;

    // get date, month, year
    var gdate   = date.getDate();
    var gmonth  = date.getMonth() + 1;

    // all case
    if (gPS >= 0 && gPS <= 10)          {var d = "Just now"; callback(d);}
    else if (gPS > 10 && gPS <= 60)     {var d = Math.floor(gPS) + " seconds ago"; callback(d);}
    else if (gPMin >= 1 && gPMin < 2)	{var d = Math.floor(gPMin) + " minute ago"; callback(d);}
    else if (gPMin >= 2 && gPMin <= 60) {var d = Math.floor(gPMin) + " minutes ago"; callback(d);}
    else if (gPH >= 1 && gPH <= 2)      {var d = Math.floor(gPH) + "  hour ago"; callback(d);}
    else if (gPH >= 1 && gPH < 24)      {var d = Math.floor(gPH) + "  hours ago"; callback(d);}
    else if (gPH >= 1 && gPH < 24)      {var d = Math.floor(gPH) + "  hours ago"; callback(d);}
    else if (gPD >= 1 && gPD < 2)       {var d = "Yesterday"; callback(d);}
    else if (gPD >= 2 && gPD <= 3)      {var d = Math.floor(gPD) + " days ago"; callback(d);}
    else if (gPD > 3 && gPD <= 7)       {if (WDay == 0) {var d = "Monday"; callback(d);}
                                         if (WDay == 1) {var d = "Tuesday"; callback(d);}
                                         if (WDay == 2) {var d = "Wednesday"; callback(d);}
                                         if (WDay == 3) {var d = "Thursday"; callback(d);}
                                         if (WDay == 4) {var d = "Friday"; callback(d);}
                                         if (WDay == 5) {var d = "Saturday"; callback(d);}
                                         if (WDay == 6) {var d = "Sunday"; callback(d);} }
    else if (gPD > 7 && gPD <= 30)      {var d = gdate + "/" + gmonth; callback(d);}
    else                                {var d = date; callback(d);}
};

function getMessageProfilePicture(id1, id2, callback) {
    if (id1 && id2) {
	pool.query('SELECT profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', id1,
		   function(err, result1) {
		       if (err) throw err;
		       pool.query('SELECT profile_picture FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', id2,
				  function(err, result2) {
				      if (err) throw err;
				      callback({pic1: result1[0].profile_picture, pic2 : result2[0].profile_picture});
				  });
		   });
    } else
	callback('error id');
};

function getUsernameMessage(id1, id2, callback) {
    if (id1 && id2) {
	pool.query('SELECT username, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM users WHERE id IN (?, ?) ORDER BY myorder', [id1, id2, id1, id2],
		   function(err, data) {
		       if (err) throw err;
		       callback(data);
		   });
    } else
	callback('error username');
};

function getDialogue(req, data, callback) {
    var dialogues = [];
    var stock = [];
    var NFDate;
    function recursive(i) {
	if (data[i]) {
	    getMessageProfilePicture(data[i].from_user_id, data[i].to_user_id, function(res) {
		getUsernameMessage(data[i].from_user_id, data[i].to_user_id, function(res1) {
		    var parent = data[i].parent_id;
		    if (stock.indexOf(parent) == -1) {
			convertDate(data[i].creation_date, function(d) { NFDate = d; })
			if (res1[1].username === req.user.username) {
			    var info_last = {
				id                  : data[i].from_user_id,
				to_username         : data[i].from_username,
				last_message        : data[i].message,
				date                : NFDate,
				read                : data[i].m_read,
				sender              : res1[0].username,
				pic			: res.pic1
			    };
			} else {
			    var info_last = {
				id                  : data[i].to_user_id,
				to_username         : data[i].to_username,
				last_message        : data[i].message,
				date                : NFDate,
				read                : data[i].m_read,
				sender              : res1[0].username,
				pic			: res.pic2
			    };
			}
			dialogues.push(info_last);
			stock.push(parent);
		    }
		    if (data[i + 1])
			recursive(i + 1);
		    else
		    callback(dialogues);
		});
	    });
	}
    };
    recursive(0);
};


exports.createMessage = function(req, res){
    /* Form Validation */
    req.checkBody('from_user_id', 'Error Message').isInt();
    req.checkBody('to_user_id', 'Error Message').isInt();
    req.checkBody('parent_id', 'Error Message').optional().isInt();
    req.checkBody('message', 'Error Message').isString().max(512);

    var errors = req.validationErrors(true);
    if (errors) {
        return res.status(400).send(errors);
    } else {
	pool.query('SELECT username, profile_id, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM users WHERE id IN (?, ?) ORDER BY myorder',
		   [req.body.from_user_id, req.body.to_user_id, req.body.from_user_id, req.body.to_user_id],
		   function (err, data) {
		       if (err) throw err;
		       pool.query('SELECT first_name, last_name, CASE id WHEN ? then 1 WHEN ? then 2 END AS myorder FROM profiles WHERE id in (?, ?) ORDER BY myorder',
				  [data[0].profile_id, data[1].profile_id, data[0].profile_id, data[1].profile_id], 
				  function(err, result) {
				      if (err) throw err;
				      req.body.parent_id	= req.body.from_user_id + req.body.to_user_id;
				      req.body.from_username	= result[0].first_name + ' ' + result[0].last_name;
				      req.body.to_username	= result[1].first_name + ' ' + result[1].last_name;
//				      req.body.m_read		= 1;
				      pool.query('INSERT INTO `messages` SET ?', req.body, function(err, result) {
					  if (err) throw err;
					  if(typeof connectedUsers[req.body.to_user_id] !== 'undefined'){
					      connectedUsers[req.body.to_user_id].emit('message', {message: req.body.message});
					  }
					  res.send({success: true});
				      });
				  });
		   });
    }
};

exports.getAllConversation = function(req, res) {
    pool.query('SELECT * FROM messages WHERE from_user_id = ? || to_user_id = ? ORDER BY creation_date DESC', [req.user.id, req.user.id],  
	       function(err, data) {
		   	if (err) throw err;
			   	if (data[0]) {
				   getDialogue(req, data, function(result) {
				       res.send({success: true, topic: result});
				   });
				} else
					res.send({success: false});
	       	});
};

exports.updateConversation = function(req, res) {
    pool.query('UPDATE messages SET m_read = 1 WHERE from_user_id = ? && to_user_id = ?', [req.body.id, req.user.id], function(err, result) {
        if (err) throw err;
        res.send({success: true});
    });
};

exports.getSpecificConversation =  function(req, res) { // get all messages of a specific client by his id
    pool.query('SELECT * FROM messages WHERE from_user_id = ? && to_user_id = ? || from_user_id = ? && to_user_id = ? ORDER BY creation_date ASC', 
    	[req.params.id, req.user.id, req.user.id, req.params.id], 
    		function(err, data) {
                   if (err) throw err;
                   pool.query('SELECT first_name, last_name, profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', req.params.id,  function(err, profile) {
                       if (err) throw err;
                       		pool.query('SELECT profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', req.user.id, function(err, picture) {		   					
                       			if (err) throw err;
                       			pool.query('SELECT username FROM users WHERE id = ?', req.params.id, function(err, username) {
                       				if (err) throw err;
									var name = {
										first_name	: profile[0].first_name,
										last_name 	: profile[0].last_name,
										username 	: username[0].username
									};
									var profile_picture = {
										my_picture	: picture[0].profile_picture_icon,
										user_picture: profile[0].profile_picture_icon,
									};
									res.send({success: true, messages: data, name: name, picture: profile_picture});
								});
							});
                   });
               });
};

exports.deleteConversation = function(req, res) {
    if (req.body[0].from_user_id) {
	var id;
	id = (req.user.id === req.body[0].from_user_id) ? req.body[0].from_user_id : req.body[0].to_user_id;
	pool.query('DELETE FROM messages WHERE from_user_id = ? && parent_id = ?', [id, req.body[0].parent_id],
		   function(err, result) {
				  if (err) throw err;
				  res.send({success: true});
			      });
    }
};
