
exports.updateUserActivity = function(user_id, callback) {
        if (user_id) {
            var time = new Date();
            var t = time.getTime();
            var tf = t / 1000;
            pool.query("UPDATE users SET last_activity = ? WHERE id = ?",
            [tf, user_id],
            function (err, result) {
                if (err) {
                    throw err;
                } else {
                    callback(true);
                }
            });
    }
};
