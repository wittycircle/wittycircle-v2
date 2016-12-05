var googl = require('goo.gl');

googl.setKey('AIzaSyBhEkIv1T3-erlrSEKi3Sk8evEi0FucKO8');
 
googl.getKey();
 
exports.getShortenUrl = function(req, res) {
	googl.shorten(req.body.url)
    .then(function (shortUrl) {
    	console.log(shortUrl);
        return res.status(200).send({success: true, url: shortUrl});
    })
    .catch(function (err) {
        console.error(err.message);
    });
};