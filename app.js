require('dotenv').config({
	silent: true,
});
const express = require('express');
const app = express();
const SpotifyWebApi = require('spotify-web-api-node');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

app.use(express.static('public'));

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
			const { provider, id, username, photos, product } = profile;
			console.log(accessToken, 'this is what an access token looks like');
			console.log(
				provider,
				id,
				username,
				photos,
				product,
				'deconstructed things',
			);
			profile.accessToken = accessToken;
			return done(null, profile);
		},
	),
);

app.use(
	session({
		secret: 'keyboard cat',
		resave: true,
		saveUninitialized: true,
		store: new MongoStore({
			url: process.env.MONGODB_URI || 'mongodb://localhost:27017/kick-it',
		}),
	}),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
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
	res.status(200).json({
		name: 'bum',
	});
});

app.get('/', function(req, res) {
	res.render('hello.html');
});

app.get('/kicking-it', async function(req, res) {
	console.log(req.session, 'a session object');
	// Set the credentials when making the request
	const spotifyApi = new SpotifyWebApi({
		accessToken: req.user.accessToken,
	});

	// Get tracks in a playlist
	const getPlaylists = await spotifyApi.getUserPlaylists(req.user.id);
	// console.log(
	// 	'*** playlists ***',
	// 	getPlaylists.body.items,
	// 	'*** the playlists ***',
	// );
	// console.log(
	// 	'*** images ***',
	// 	getPlaylists.body.items[0].name,
	// 	'*** the playlists ***',
	// );

	res.render('index.html', {
		user: req.user,
		playlistsName: getPlaylists.body.items[0].name,
		playlistsImage: getPlaylists.body.items[0].images[0].url,
	});
});

app.post('things', function(req, res) {
	res.render('index.html', {
		user: req.user,
	});
});

app.get('/search', async function(req, res) {
	const spotifyApi = new SpotifyWebApi({
		accessToken: req.user.accessToken,
	});
	// Search for a track!
	spotifyApi.searchTracks('track:Can I Kick It?', { limit: 1 }).then(
		function(data) {
			// Send the first (only) track object
			res.send(data.body.tracks.items[0]);
		},
		function(err) {
			console.error(err);
		},
	);
});

app.get(
	'/auth/spotify',
	passport.authenticate('spotify', {
		scope: ['streaming', 'user-modify-playback-state', 'user-read-email', 'user-read-private', 'user-read-playback-state'],
		showDialog: true,
	}),
);

app.get(
	'/auth/spotify/callback',
	passport.authenticate('spotify', {
		failureRedirect: '/fail',
	}),
	function(req, res) {
		// Successful authentication, redirect home.

		res.redirect('/kicking-it');
	},
);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

module.exports = app;
