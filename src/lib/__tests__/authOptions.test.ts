import { authOptions } from '../authOptions';

describe('authOptions', () => {
  it('should have GoogleProvider and CredentialsProvider configured', () => {
    const providers = authOptions.providers;
    expect(providers).toBeDefined();
    expect(providers?.length).toBeGreaterThanOrEqual(2);

    const googleProvider = providers?.find(p => p.id === 'google');
    expect(googleProvider).toBeDefined();

    const credentialsProvider = providers?.find(p => p.id === 'credentials');
    expect(credentialsProvider).toBeDefined();
  });

  it('should have session strategy set to jwt', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
  });

  it('should have signIn callback defined', () => {
    expect(authOptions.callbacks?.signIn).toBeDefined();
  });

  it('should have jwt callback defined', () => {
    expect(authOptions.callbacks?.jwt).toBeDefined();
  });

  it('should have session callback defined', () => {
    expect(authOptions.callbacks?.session).toBeDefined();
  });

  it('should have signIn page set', () => {
    expect(authOptions.pages?.signIn).toBe('/session/new');
  });
});
