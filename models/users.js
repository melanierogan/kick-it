const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UsersSchema = new mongoose.Schema({
	_id: Schema.Types.ObjectId,
	userName: {
		type: String,
		required: true,
	},
	spotifyId: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('Users', UsersSchema);
