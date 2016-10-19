// Encode URL transform sentence within space to one block string.
exports.encodeUrl = function(url, callback) {
	if (!url) {
		callback(false);
	} else {
		url = url.replace(/ /g, '-');
	}
	callback(url);
};