require('dotenv').config({ silent: true });
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const app = express();

const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

passport.use(
	new SpotifyStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.CLIENT_URL,
		},
		function(accessToken, refreshToken, expires_in, profile, done) {
			// User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
			// 	return done(err, user);
			// });
			console.log(profile, 'what????');
			return done(null, profile);
		},
	),
);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

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
	res.render('index', { title: 'kick-it login' });
});

app.get('/auth/spotify', passport.authenticate('spotify', { session: false }));

app.get(
	'/auth/spotify/callback',
	passport.authenticate('spotify', { failureRedirect: '/fail' }),
	function(req, res) {
		// Successful authentication, redirect home.
		res.redirect('/');
	},
);

const server = app.listen(app.get('port'), () => {
	const port = server.address().port;
	console.log('Magic happens on port ' + port);
});

module.exports = app;
