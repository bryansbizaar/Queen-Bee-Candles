/**
 * Simple App Test - Verify basic setup works
 */

import request from 'supertest';
import app from '../../app.js';

describe('Basic App Setup', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'OK',
      environment: 'test'
    });
  });

  it('should respond to root route', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Welcome to Queen Bee Candles API'
    });
  });
});
