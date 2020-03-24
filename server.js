const mongo = require('./lib/mongo');
const port = process.env.PORT || 3000;
const app = require('./app');

mongo
	.client()
	.then(() => {
		return app.listen(port, () => {
			console.log('app listening on port:', port, '\n');
		});
	})
	.catch(error => {
		throw new Error(error);
	});
