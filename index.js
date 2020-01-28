const express = require('express');
const app = express();

app.get('/__gtg', function(req, res) {
	res.status(200).json({ name: 'bum' });
});

const server = app.listen(app.get('port'), () => {
	const port = server.address().port;
	console.log('Magic happens on port ' + port);
});

module.exports = app;
