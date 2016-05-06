
exports.updateUserActivity = function(user_id, callback) {
        if (user_id) {
            var time = Date.now();
            pool.query("UPDATE users SET last_activity = ? WHERE id = ?",
            [time, user_id],
            function (err, result) {
                if (err) {
                    throw err;
                } else {
                    callback(true);
                }
            });
    }
};
