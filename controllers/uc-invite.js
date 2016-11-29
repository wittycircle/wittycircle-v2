/**** UC INVITE ****/

/* BABSON UNIVERSITY INVITATION MAILS */
function inviteMailToUc(university, number, category, callback) {
	pool.query('SELECT first_name, last_name, description, profile_picture FROM profiles WHERE id = 8',
		function(err, result) {
			if (err) throw err;

			pool.query('SELECT id, first_name, email FROM invite_university WHERE university = ? AND send_date IS NULL LIMIT ?', [university, number],
				function(err, list) {
					if (err) throw err;
					if (list[0]) {
						function recursive(index) {
							if (list[index]) {
								/* FROM PROFILE SETTING */
								var ffname = result[0].first_name + " " + result[0].last_name;

								/* SET INFO UNIVERSITY */

								if (category)
									var uc 	= category; 
								else
									var uc 	= university + " University";
								var ucC 	= university + " community";
								var urlUc 	= "https://www.wittycircle.com/welcome/" + university; 

								/* HELPER SETTING */
								var helper = require('sendgrid').mail;
								var from_email = new helper.Email('campuses@wittycircle.info', 'Jay Ho via Wittycircle');
								var to_email = new helper.Email('friends@wittycircle.com');
								var subject = 'Wittycircle is now open to the ' + ucC;
								var category = new helper.Category(uc);
								var content = new helper.Content(
									'text/html', 'Hello, Mail');
								var mail = new helper.Mail(from_email, subject, to_email, content);

								mail.addCategory(category);
								mail.personalizations[0].addSubstitution(
									new helper.Substitution('-tname-', list[index].first_name));
								mail.personalizations[0].addSubstitution(
									new helper.Substitution('-fname-', result[0].first_name));
								mail.personalizations[0].addSubstitution(
									new helper.Substitution('-ffname-', ffname));
								mail.personalizations[0].addSubstitution(
									new helper.Substitution('-fdesc-', result[0].description));
								mail.personalizations[0].addSubstitution(
									new helper.Substitution('-fpicture-', result[0].profile_picture));
								mail.personalizations[0].addSubstitution(
									new helper.Substitution('-ucName-', university));
								mail.personalizations[0].addSubstitution(
									new helper.Substitution('-ucUrl-', urlUc));

								mail.setTemplateId('9ed77865-aba3-401f-b1c8-2aa4ce7934ee');

								/* API CREDENTIAL */
								var sg = require('sendgrid')('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');
								var request = sg.emptyRequest({
									method: 'POST',
									path: '/v3/mail/send',
									body: mail.toJSON(),
								});

								/* SEND MAIL */
								sg.API(request, function(error, response) {
									if (response.statusCode === 202) {
									    return ;
										pool.query('UPDATE invite_university SET send_date = NOW() WHERE id = ?', list[index].id,
											function(err, done) {
												return recursive(index + 1);
											});
									} else {
									    return ;
									    console.log(error);
									    return recursive(index + 1);
									}
								});
							} else {
								return callback(true);
							}
						};
						recursive(0);
					} else
						return callback(false);
				});

	});
};

exports.getUniversityList = function(req, res) {
	pool.query('SELECT university, creation_date, send_date FROM invite_university GROUP BY university ORDER BY creation_date ASC',
		function(err, result) {
			if (err) throw err;
			else {
				function recursive(index) {
					if (result[index]) {
						pool.query('SELECT count(*) as number FROM invite_university WHERE university = ? AND send_date is null', result[index].university,
							function(err, result2) {
								if (err) throw err;
								result[index].rest = result2[0].number;
								return recursive(index + 1);
							});
					} else
						return res.status(200).send({success: true, data: result});
				};
				recursive(0);
			}
		});
};

exports.addUniversityMailList = function(req, res) {
	if (req.body.university_name && req.body.university_mail_list[0]) {
		var ucName = req.body.university_name;
		var ucList = req.body.university_mail_list; 
		var object = {};

		function recursive(index) {
			if(ucList[index]) {
				if (ucList[index].email) {
					object.first_name  	= ucList[index].first_name;
					object.email 		= ucList[index].email;
					object.university 	= ucName; 
					pool.query('INSERT INTO invite_university SET ?', object,
						function(err, result) {
							return recursive(index + 1);
						});
				} else
					return recursive(index + 1);
			} else 
				return res.status(200).send({success: true});
		};
		recursive(0);
	} else
		return res.status(404).send("ERROR!");
};

exports.sendUcCampaignMail = function(req, res) {
	if (req.body.uc && req.body.number && req.body.students) {
		var number = parseInt(req.body.number);
		pool.query('UPDATE invite_university SET number_students = ? WHERE university = ?', [req.body.students, req.body.uc],
			function(err, update) {
				if (err) throw err;
				inviteMailToUc(req.body.uc, number, req.body.category, function(done) {
					if (done) {
						pool.query('SELECT university, creation_date, send_date FROM invite_university GROUP BY university ORDER BY creation_date ASC',
							function(err, data) {
								if (err) throw err;
								else
									return res.status(200).send({success: true, data: data});
							});
					} else
						return res.status(400).send("FORBIDDEN !")
				});
			});
	} else
		return res.status(404).send("ERROR !");
};

exports.getUcStudentsNumber = function(req, res) {
	pool.query('SELECT * FROM invite_university WHERE university = ?', req.params.university, 
		function(err, check) {
			if (err) throw err;
			if (check[0]) {
				// if (check[0].number_students)
				// 	var new_number = check[0].number_students + 3;
				// else 
				// 	var new_number = 3;
				pool.query('UPDATE invite_university SET number_students = number_students + 2 WHERE university = ?', req.params.university,
					function(err, update) {
						if (err) throw err;
						pool.query('SELECT number_students FROM invite_university WHERE university = ? GROUP BY university', req.params.university,
							function(err, result) {
								if (err) throw err;
								if (!result[0])
									return res.status(200).send({success: false});
								else
									return res.status(200).send({success: true, students: result[0].number_students});
							});
					});
			} else
				return res.status(200).send({success: false});
		});
};
