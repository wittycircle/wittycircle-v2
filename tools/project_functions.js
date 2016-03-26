/*** PROJECT FUNCTIONS TOOL ***/

function getUsersInProject(id_list, callback) {
    if (id_list[0]) {
        var username_list = [];
        function recursive(index) {
	    if (id_list[index]) {
                pool.query('SELECT first_name, last_name FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', id_list[index].user_id,
                           function(err, data) {
                               if (err) throw err;
			       username_list.push(data[0]);
			       recursive(index + 1);
                           });
	    } else
                callback(username_list);
        };
        recursive(0);
    } else
        callback(false);
};

exports.sortProjectCard = function(data, callback) {
    if (data[0]) {
        var newProjectCards = [];
        function recursive(index) {
	    if (data[index]) {
                pool.query('SELECT profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', data[index].creator_user_id,
                           function(err, result) {
			       if (err) throw err;
			       pool.query('SELECT user_id FROM project_users WHERE project_id = ?', data[index].id,
                                          function(err, list_user_id) {
					      if (err) throw err;
					      getUsersInProject(list_user_id, function(username_list) {
                                                  data[index].pic       = result[0].profile_picture_icon;
                                                  data[index].usersIn   = username_list;
                                                  newProjectCards.push(data[index]);
                                                  recursive(index + 1);
					      });
                                          });
                           });
	    } else
                callback(newProjectCards);
        };
        recursive(0);
    } else
        callback(false);
};
