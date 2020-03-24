const fetch = require('node-fetch');

const getEngineeringCompetencies = async (req, res) => {
	try {
		const response = await fetch('url', {
			method: 'GET',
		});

		if (response.status === 404) {
			console.log('error 404');
			throw new Error('unauthorised');
		}

		if (response.status >= 500) {
			console.log('error 500');
			throw new Error('internal error');
		}

		if (response.status === 200) {
			const json = await response.json();
			const debug = JSON.stringify(json);
			console.log(json);
		}
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error);
	}
};
