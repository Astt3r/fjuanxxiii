const request = require('supertest');
let server;

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
  process.env.DB_HOST = process.env.DB_HOST || 'localhost';
  process.env.DB_USER = process.env.DB_USER || 'root';
  process.env.DB_NAME = process.env.DB_NAME || 'test_db';
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';
  process.env.DB_PORT = process.env.DB_PORT || '3306';

  server = require('../src/server');
});

afterAll((done) => {
  if (server && server.close) {
    server.close(done);
  } else {
    done();
  }
});

test('GET /api/health should respond with 200', async () => {
  const res = await request(server).get('/api/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toBeDefined();
});
