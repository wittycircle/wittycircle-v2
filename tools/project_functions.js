/*** PROJECT FUNCTIONS TOOL ***/

function getUsersInProject(id_list, callback) {
    if (id_list[0]) {
        var username_list = [];
        function recursive(index) {
            if (id_list[index]) {
                pool.query('SELECT first_name, last_name, profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)', id_list[index].user_id,
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
    if (data && data[0]) {
      var newProjectCards = [];

      function recursive(index) {
        if (data[index] && typeof data[index].id !== 'undefined') {
          if (!data[index].picture_card)
            return recursive(index + 1);
          else {
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
                        return recursive(index + 1);
                      });
                    });
            });
          }
        } else {
          if (newProjectCards[0])
            return callback(newProjectCards);
          else
            return callback(false);
        }
      };
      recursive(0);
    } else
        return callback(false);
};


exports.addUserPictureToProject = function (data, callback) {
    if (data[0]) {
        function recursive (index) {
            if (data[index]) {
                pool.query('SELECT profile_picture_icon FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)',
                data[index].creator_user_id,
                function (err, response) {
                    if (err) {
                        console.log(new Date());
                        console.log('error in addUserPictureToProject l58');
                        throw err;
                    }
                    data[index].creator_user_picture = response[0];
                    recursive(index + 1);
                });
            } else {
                callback(data);
            }
        }
        recursive(0);
    } else {
        callback(false);
    }
}

exports.addprofilestoFeedbacks = function (user, data, callback) {
    if (data[0]) {
        function recursive (ind, index) {
            if (data[ind]) {
                if (data[ind].replies && data[ind].replies[index]) {
                    pool.query('SELECT * FROM profiles WHERE id IN (SELECT profile_id FROM users WHERE id = ?)',
                    data[ind].replies[index].user_id,
                    function (err, response) {
                        if (err) {
                            console.log(new Date());
                            console.log('error in addUserPictureToProject l58');
                            throw err;
                        }
                        if (user && data[ind].replies[index].user_id === user.id) {
                            data[ind].replies[index].isOwned = true;
                            delete data[ind].replies[index].user_id;
                            data[ind].replies[index].user_profile = response[0];
                        } else {
                            data[ind].replies[index].isOwned = false;
                            delete data[ind].replies[index].user_id;
                            data[ind].replies[index].user_profile = response[0];
                        }
                        recursive(ind, index + 1);
                    });
                } else {
                    recursive(ind + 1, 0);
                }
            } else {
                callback(data);
            }
        }
        recursive(0, 0);
    } else {
        callback(false);
    }
}
