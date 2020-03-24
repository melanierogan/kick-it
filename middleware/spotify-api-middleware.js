// Set the credentials when making the request
var spotifyApi = new SpotifyWebApi({
	accessToken: 'njd9wng4d0ycwnn3g4d1jm30yig4d27iom5lg4d3',
});

// Get tracks in a playlist
api
	.getPlaylistTracks('thelinmichael', '3ktAYNcRHpazJ9qecm3ptn', {
		offset: 1,
		limit: 5,
		fields: 'items',
	})
	.then(
		function (data) {
			console.log('The playlist contains these tracks', data.body);
		},
		function (err) {
			console.log('Something went wrong!', err);
		},
	);
