require('dotenv').config({ silent: true });
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', '.html');
app.set('views', __dirname + '/views');
app.set('port', process.env.PORT);

const handlebarsInstance = exphbs.create({
	extname: '.html',
	defaultLayout: 'main',
});

app.engine('html', handlebarsInstance.engine);

app.get('/__gtg', function(req, res) {
	res.status(200).json({ name: 'bum' });
});

app.get('/', function(req, res) {
	res.render('index');
});

const server = app.listen(app.get('port'), () => {
	const port = server.address().port;
	console.log('Magic happens on port ' + port);
});

module.exports = app;
