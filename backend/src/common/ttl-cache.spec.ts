import { TtlCache } from './ttl-cache';

describe('TtlCache', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a stored value before it expires', () => {
    const cache = new TtlCache<string>(1000);
    cache.set('key', 'value');

    expect(cache.get('key')).toBe('value');
  });

  it('returns undefined for a key that was never set', () => {
    const cache = new TtlCache<string>(1000);

    expect(cache.get('missing')).toBeUndefined();
  });

  it('evicts a value once its TTL has passed', () => {
    const cache = new TtlCache<string>(1000);
    cache.set('key', 'value');

    jest.advanceTimersByTime(1001);

    expect(cache.get('key')).toBeUndefined();
  });
});
