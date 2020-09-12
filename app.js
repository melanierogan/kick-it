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
const nofavicon = require('express-no-favicons');

passport.use(
	new SpotifyStrategy(
		{
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL:
				process.env.CLIENT_URL || 'http://localhost:3000/auth/spotify/callback',
		},
		function(accessToken, refreshToken, expires_in, profile, done) {
			// User.findOrCreate({ spotifyId: profile.id }, function(err, user) {
			// 	return done(err, user);
			// });
			const { provider, id, username, photos, product } = profile;
			profile.accessToken = accessToken;
			profile.id = id;
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
			useUnifiedTopology: true,
		}),
	}),
);
app.use(nofavicon());
app.use(passport.initialize());
app.use(passport.session());
app.use(
	bodyParser.urlencoded({
		extended: true,
	}),
);

const ignoreFavicon = (req, res, next) => {
	if (req.originalUrl === '/favicon.ico') {
		res.status(204).json({ nope: true });
	} else {
		next();
	}
};

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

app.use(express.static('static'));
app.use(ignoreFavicon);
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

app.get('/test', async function(req, res) {
	const spotifyApi = new SpotifyWebApi({
		accessToken: req.user.accessToken,
		user: req.user,
	});

	// Get tracks in a playlist
	// const getPlaylists = await spotifyApi.getUserPlaylists(req.user.id);

	const getSpecificPlaylist = await spotifyApi.getPlaylist(
		req.session.playlistID || '1DVLNQ0AoUnf7CkzMXTmLZ',
	);
	console.log(req.session.playlistID, 'why wont you');
	const getCurrentTrack = await spotifyApi.getMyCurrentPlaybackState({});
	console.log(getSpecificPlaylist.body.tracks.items, 'what we got?');
	res.render('index.html', {
		user: req.user,
		playlistID: getSpecificPlaylist.body.uri,
		// turnary or otherwise if image show it if not default image
		playlistsName: getSpecificPlaylist.body.name,
		playlistsImage: getSpecificPlaylist.body.images[0]
			? getSpecificPlaylist.body.images[0].url
			: 'https://via.placeholder.com/550',
		playlist: getSpecificPlaylist.body.tracks.items,
		// currentTrack: getCurrentTrack.body.item.name,
	});
});

app.get('/kicking-it', async function(req, res) {
	const spotifyApi = new SpotifyWebApi({
		accessToken: req.user.accessToken,
		user: req.user,
	});

	// Get tracks in a playlist
	// const getPlaylists = await spotifyApi.getUserPlaylists(req.user.id);

	const getSpecificPlaylist = await spotifyApi.getPlaylist(
		req.session.playlistID || '1DVLNQ0AoUnf7CkzMXTmLZ',
	);
	console.log(req.session.playlistID, 'why wont you');
	const getCurrentTrack = await spotifyApi.getMyCurrentPlaybackState({});
	console.log(getSpecificPlaylist.body.tracks.items, 'what we got?');
	res.render('index.html', {
		user: req.user,
		playlistID: getSpecificPlaylist.body.uri,
		// turnary or otherwise if image show it if not default image
		playlistsName: getSpecificPlaylist.body.name,
		playlistsImage: getSpecificPlaylist.body.images[0]
			? getSpecificPlaylist.body.images[0].url
			: 'https://via.placeholder.com/550',
		playlist: getSpecificPlaylist.body.tracks.items,
		// currentTrack: getCurrentTrack.body.item.name,
	});
});

app.post('/create-playlist', async function(req, res) {
	const spotifyApi = new SpotifyWebApi({
		accessToken: req.user.accessToken,
		user: req.user.id,
	});
	const playlistName = req.body.playlistname;
	// if we have an id we use it otherwise a default
	console.log(playlistName, 'sdfsdfsdfsdfsdfsdfsdf');
	// the user cannot be hardcoded really but i need to pass this value through correctly as it is coming up as undefined
	spotifyApi.createPlaylist('roganmc', playlistName, { public: true }).then(
		function(data) {
			console.log(data.body.id, 'test a thing');
			console.log('Created playlist!');
			const playlistID = data.body.id;
			req.session.playlistID = playlistID;
			console.log(playlistID, 'that is a thing ok');
			res.redirect('/kicking-it');
		},
		function(err) {
			console.log('Something went wrong with creating a playlist', err);
		},
	);
});

app.get('/search', async function(req, res) {
	const spotifyApi = new SpotifyWebApi({
		accessToken: req.user.accessToken,
		user: req.user,
	});
	let result = false;
	const searchQuery = req.query['search-query'];
	// Search for a track!
	// why you no give me more results
	spotifyApi.searchTracks(`track:${searchQuery}`, { limit: 1 }).then(
		function(data) {
			const name = data.body.tracks.items[0].name;
			const id = data.body.tracks.items[0].uri;
			const { images, artists } = data.body.tracks.items[0].album;
			let result = true;
			res.render('index', {
				name,
				id,
				images,
				artists,
				result,
				user: req.user,
			});
		},
		function(err) {
			console.error(err);
		},
	);
});

app.get('/add-track', async function(req, res) {
	const spotifyApi = new SpotifyWebApi({
		accessToken: req.user.accessToken,
		user: req.user,
	});

	console.log(req.body, 'what now');
	const trackId = req.query.trackid;
	console.log(trackId, 'this is a track id');
	console.log(req.session.playlistID, 'this is a playlist');
	const tryThat = `'spotify:track:${trackId}'`;
	console.log(tryThat, 'what what what');
	await spotifyApi.addTracksToPlaylist(req.session.playlistID, [trackId]).then(
		function(data) {
			console.log('Added tracks to playlist!');
		},
		function(err) {
			console.log('Something went wrong when adding track to playlist!', err);
		},
	);
	res.redirect('/kicking-it');
});

// things to do
// make multiple results come back in the view for search results
// make default image appear for playlist if it doesn't have an image
// move or change how create playlist appears as the first view
// get play button to play current playlist

// work on host vs party goer view
// host can 'start part' and create a playlist, party goers can search and add tracks
// party goers can vote up or down a certain number of times
// host can delete songs or reorder at any point
// host can disable adding songs at any point
// host can disable voting at any point

// leader board would show whose songs are getting those most votes
// leader board shows what is a popular song

// power-ups can be enabled
// kick it means you get to move any song to top of the queue

app.get(
	'/auth/spotify',
	passport.authenticate('spotify', {
		scope: [
			'streaming',
			'user-modify-playback-state',
			'user-read-email',
			'user-read-private',
			'user-read-playback-state',
			'playlist-modify-public',
			'playlist-modify-private',
			'playlist-read-private',
			'playlist-read-collaborative',
			'app-remote-control',
		],
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
