const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const client = () => {
	return mongoose.connect(
		process.env.MONGODB_URI || 'mongodb://localhost:27017/kick-it', {
			useNewUrlParser: true,
			retryWrites: false,
			useUnifiedTopology: true,
		},
	);
};

module.exports = {
	client,
	mongoose,
};
