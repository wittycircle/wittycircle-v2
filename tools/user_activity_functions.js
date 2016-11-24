
exports.updateUserActivity = function(user_id, callback) {
    if (user_id) {
        pool.query('UPDATE users SET last_activity = NOW() WHERE id = ?', user_id,
            function(err, result) {
                if (err) throw err;
                return callback(true);
            });      
    }
};
