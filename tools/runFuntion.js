/*** CHANGE TABLE ***/

function moveFeedbacks() {
	pool.query('SELECT id, user_id, project_id, title, description, date_added, badge FROM project_feedbacks',
		function(err, result) {
			if (err) throw err;
			function recursive(index) {
				if (result[index]) {
					var object1 = {
						user_id 		: result[index].user_id,
						project_id 		: result[index].project_id,
						title 			: result[index].title,
						message 		: result[index].description,
						creation_date 	: result[index].date_added
					};
					pool.query('INSERT INTO project_discussion SET ?', object1,
						function(err, result2) {
							if (err) throw err;
							if (result2.insertId) {
								pool.query('SELECT id, feedback_id, user_id, description, created_at FROM feedback_replies WHERE feedback_id = ?', result[index].id,
									function(err, result3) {
										if (err) throw err;
										function recursive2(index2) {
											if (result3[index2]) {
												var object2 = {
													user_id 				: result3[index2].user_id,
													project_discussion_id 	: result2.insertId,
													message 				: result3[index2].description,
													creation_date 			: result3[index2].created_at
												};
												pool.query('INSERT INTO project_discussion_replies SET ?', object2,
													function(err, done) {
														if (err) throw err;
														return recursive2(index2 + 1);
													});
											} else
												return recursive(index + 1);
										};
										return recursive2(0);
									});
							} else
								return recursive(index + 1);
						});
				} else {
					console.log("DONE!");
					return ;
				}
			};
			recursive(0);
		});
};

function moveAsk() {
	pool.query('SELECT id, user_id, project_id, title, message, created_at FROM project_asks',
		function(err, result) {
			if (err) throw err;
			function recursive(index) {
				if (result[index]) {
					var object1 = {
						user_id 		: result[index].user_id,
						project_id 		: result[index].project_id,
						title 			: result[index].title,
						message 		: result[index].message,
						creation_date 	: result[index].created_at
					};
					pool.query('INSERT INTO project_discussion SET ?', object1,
						function(err, result2) {
							if (err) throw err;
							if (result2.insertId) {
								pool.query('SELECT id, ask_id, user_id, description, created_at FROM ask_replies WHERE ask_id = ?', result[index].id,
									function(err, result3) {
										if (err) throw err;
										function recursive2(index2) {
											if (result3[index2]) {
												var object2 = {
													user_id 				: result3[index2].user_id,
													project_discussion_id 	: result2.insertId,
													message 				: result3[index2].description,
													creation_date 			: result3[index2].created_at
												};
												pool.query('INSERT INTO project_discussion_replies SET ?', object2,
													function(err, done) {
														if (err) throw err;
														return recursive2(index2 + 1);
													});
											} else
												return recursive(index + 1);
										};
										return recursive2(0);
									});
							} else
								return recursive(index + 1);
						});
				} else {
					console.log("DONE!");
					return ;
				}

			};
			recursive(0);
		});
};

// moveFeedbacks();
// moveAsk();
