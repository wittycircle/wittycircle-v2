
exports.updateUserActivity = function(callback) {
    if (!req.isAuthenticated()) {
        return res.status(404).send({message: "cant update user activity, not legged in"});
    } else {
        if (req.user.id) {
            var time = new Date().getTime();
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
    }
};
