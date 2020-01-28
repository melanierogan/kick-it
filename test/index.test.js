const request = require('supertest');
const app = require('../index');

describe('GET /__gtg', () => {
	it('responds with 200', function() {
		return request(app)
			.get('/__gtg')
			.expect(200);
	});
});
