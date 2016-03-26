
/* VIEW */

function getNotifViewList(data, callback) {
    var list = [];
    var view = data;
    for(var i = 0; i < view.length; i++) {
	var d = view[i].creation_date;
	list.push({
	    creation_date	: d,
	    timestamp		: d.getTime(),
	    read		: view[i].m_read,
	    name		: view[i].user_viewed_username,
	    user_notif_id	: view[i].user_viewed_id,
	    type: "view"
	});
    }
    callback(list);
};

exports.getView = function(req, res, callback) {
    pool.query('SELECT * FROM views WHERE user_id IN (SELECT id FROM users WHERE username = ?)', [req.user.username],
               function(err, data) {
                   if (err) throw err;
		   getNotifViewList(data, function(newData) {
                       callback(newData);
		   });
               });
};
exports.updateView = function(req, res) {
    pool.query('UPDATE views SET m_read = 1 WHERE user_id = ? && user_viewed_id = ?', [req.user.profile_id, req.body.notif_id],
               function(err, result) {
                   if (err) throw err;
                   res.send({success: true});
               });
};
