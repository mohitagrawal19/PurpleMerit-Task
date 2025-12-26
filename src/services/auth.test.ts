import { generateTokens, verifyRefreshToken } from '../services/auth';

describe('Auth Service', () => {
  it('should generate valid tokens', () => {
    const { accessToken, refreshToken } = generateTokens('123', 'test@example.com', 'user');
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
  });

  it('should verify refresh token', () => {
    const { refreshToken } = generateTokens('123', 'test@example.com', 'user');
    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.id).toBe('123');
  });
});
