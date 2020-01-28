const fetch = require('node-fetch');

const getSpotifySongs = async (req, res) => {
	try {
		const response = await fetch('https://', {
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
			console.log(json);
		}
	} catch (error) {
		console.log(error);
	}
};

module.exports = getSpotifySongs;
