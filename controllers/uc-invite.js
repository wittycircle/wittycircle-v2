/**** UC INVITE ****/

/* BABSON UNIVERSITY INVITATION MAILS */
function inviteMailToUc(university, callback) {
	pool.query('SELECT first_name, last_name, description, profile_picture FROM profiles WHERE id = 1864',
		function(err, result) {
			if (err) throw err;

			pool.query('SELECT first_name, email FROM invite_university WHERE university = ?', university,
				function(err, list) {
					if (err) throw err;
					if (list[0]) {
						function recursive(index) {
							if (list[index]) {
								/* FROM PROFILE SETTING */
								var ffname = result[0].first_name + " " + result[0].last_name;

								/* SET INFO UNIVERSITY */
								var uc 		= university + " University";
								var ucC 	= university + " community";
								var urlUc 	= "https://www.wittycircle.com/welcome/" + university; 
								
								/* HELPER SETTING */
								var helper = require('sendgrid').mail;
								var from_email = new helper.Email('campuses@wittycircle.info', 'Sarah Nichols via Wittycircle');
								var to_email = new helper.Email(list[index].email);
								var subject = 'Wittycircle is now open for the ' + ucC;
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
									new helper.Substitution('-ucName-', urlUc));

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
										return recursive(index + 1);
									} else {
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
			else
				return res.status(200).send({success: true, data: result});
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
	if (req.body.uc) {
		inviteMailToUc(req.body.uc, function(done) {
			if (done) {
				pool.query('UPDATE invite_university SET send_date = NOW() WHERE university = ?', req.body.uc,
					function(err, result) {
						if (err) throw err
						pool.query('SELECT university, creation_date, send_date FROM invite_university GROUP BY university ORDER BY creation_date ASC',
							function(err, data) {
								if (err) throw err;
								else
									return res.status(200).send({success: true, data: data});
							});
					});
			} else
				return res.status(400).send("FORBIDDEN !")
		});
	} else
		return res.status(404).send("ERROR !");
};
