import { extractImageUrl } from '../src/lib/microcms.ts';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

describe('extractImageUrl', () => {
  it('should return string directly', () => {
    assert.strictEqual(extractImageUrl('https://example.com/image.jpg'), 'https://example.com/image.jpg');
  });
  
  it('should trim string', () => {
    assert.strictEqual(extractImageUrl('  https://example.com/image.jpg  '), 'https://example.com/image.jpg');
  });

  it('should handle microCMS image object', () => {
    assert.strictEqual(extractImageUrl({ url: 'https://example.com/image.jpg', width: 100, height: 100 }), 'https://example.com/image.jpg');
  });
  
  it('should handle microCMS image object with spaces', () => {
    assert.strictEqual(extractImageUrl({ url: '  https://example.com/image.jpg  ', width: 100, height: 100 }), 'https://example.com/image.jpg');
  });

  it('should return undefined for invalid or empty inputs', () => {
    assert.strictEqual(extractImageUrl(null), undefined);
    assert.strictEqual(extractImageUrl(undefined), undefined);
    assert.strictEqual(extractImageUrl(''), undefined);
    assert.strictEqual(extractImageUrl('   '), undefined);
    assert.strictEqual(extractImageUrl({}), undefined);
    assert.strictEqual(extractImageUrl({ url: '' }), undefined);
    assert.strictEqual(extractImageUrl({ url: '   ' }), undefined);
    assert.strictEqual(extractImageUrl({ url: null }), undefined);
    assert.strictEqual(extractImageUrl({ url: 123 }), undefined);
  });
});
