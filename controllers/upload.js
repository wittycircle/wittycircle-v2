var cloudinary = require('cloudinary');
var multer = require('multer');
var fs = require('fs');

// exports.uploadPhoto = function(req, res) {
//     cloudinary.uploader.upload(req.body.url, function(result) {
// 	res.send(result);
//     });
// };

exports.uploadProjectCover = function(req, res) {
    cloudinary.uploader.upload(req.body.url, function(result) {
        res.send(result);
    }, {width: 1920, height: 1080 , crop: "fill", format: "jpg"});
};

exports.uploadProjectCard = function(req, res) {
    cloudinary.uploader.upload(req.body.url, function(result) {
	res.send(result);
    }, {width: 300, height: 300, crop: "fill", format: "jpg"});
};

exports.uploadPhotoIcon = function(req, res) {
    cloudinary.uploader.upload(req.body.url, function(result) {
        res.send(result);
    }, {width: 200, height: 200, crop: "fill", format: "jpg", gravity: "face" });
};

exports.uploadProfileCover = function(req, res) {
    cloudinary.uploader.upload(req.body.url, function(result) {
        res.send(result);
    }, {width: 1920, height: 1080, crop: "fill", format: "jpg"});
};

exports.uploadProfileCard = function(req, res) {
    cloudinary.uploader.upload(req.body.url, function(result) {
        res.send(result);
    }, {width: 200, height: 100, crop: "fill", format: "jpg"});
};

exports.uploadArticlePicture = function(req, res) {
    cloudinary.uploader.upload(req.body.url, function(result) {
        res.send(result);
    }, {width: 600, height: 400, crop: "fill", format: "jpg"});
};

exports.uploadVideoProject = function(req, res) {
    cloudinary.uploader.upload(req.body.url, function(result) {
	   res.send(result);
    }, {
	resource_type: "video" });
};

exports.deleteVideoProject = function(req, res) {
//    req.checkBody('project_id', 'error message').isInt().min(1).max(128);
    req.checkBody('video_id', 'error message').isString().min(1).max(128);
    var errors = req.validationErrors(true);
    if (errors) {
      res.status(400).send(errors);
    } else {
      pool.query("UPDATE projects SET main_video = '' WHERE id = ?",
      [req.body.project_id],
		 function(err, result) {
        if (err) {
          throw err;
        } else {
          cloudinary.uploader.destroy(req.body.video_id, function(result) {
                  res.status(200).send(result) }, {
                      resource_type: "video" });
        }
      });
    }
};


exports.resizePhoto = function(req, res) {
    req.checkParams('width', 'width parameter must be an int').isInt().min(1);
    req.checkParams('height', 'height parameter must be an int').isInt().min(1);
    req.checkParams('crop', 'crop parameter must be a string').isString();
    req.checkParams('public_id', 'public_id is a string').isString();

    var errors = req.validationErrors(true);
    if (errors) {
	return res.status(400).send(errors);
    } else {
	return res.send(cloudinary.url(req.param.public_id, {width: req.param.width, height: req.param.height, crop: req.param.crop}));
    }
};

exports.redactorImage = function(req, res) {

    var body = '';
    req.on('data', function(chunk) {
        body += chunk;
    }).on('end', function() {
         cloudinary.uploader.upload(body, function(result) {
            return res.send({url: result.secure_url});
        }, {width: 800, crop: 'fill', format: 'jpg'});
    });
};
