import { handler } from '../src/handlers/listProfiles';

describe('listProfiles handler', () => {
  it('returns mock profiles', async () => {
    const response = await handler({} as never);
    if (typeof response === 'string') {
      throw new Error('Expected structured API Gateway response');
    }
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body ?? '{}');
    expect(body.profiles).toHaveLength(3);
  });
});
