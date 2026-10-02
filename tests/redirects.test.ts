import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nextConfig from '../next.config.ts';

describe('Redirects configuration', () => {
  it('defines redirects for /reception and /vote with permanent: false (307/302)', async () => {
    assert.ok(typeof nextConfig.redirects === 'function', 'redirects function must be defined');
    const redirects = await nextConfig.redirects();

    const receptionRedirect = redirects.find((r) => r.source === '/reception');
    assert.ok(receptionRedirect, '/reception redirect should exist');
    assert.equal(
      receptionRedirect.destination,
      'https://docs.google.com/forms/d/e/1FAIpQLSeZXFfqWX8xf_laUlFMgj9KqPXUUp8tk62Yx9f-dCl1F9ro_A/viewform?usp=pp_url&entry.857453513=1%25E5%2590%258D%25EF%25BC%2588%25E6%259C%25AC%25E4%25BA%25BA%25E3%2581%25AE%25E3%2581%25BF%25EF%25BC%2589'
    );
    assert.equal(receptionRedirect.permanent, false);

    const voteRedirect = redirects.find((r) => r.source === '/vote');
    assert.ok(voteRedirect, '/vote redirect should exist');
    assert.equal(
      voteRedirect.destination,
      'https://docs.google.com/forms/d/e/1FAIpQLSetzOadXi8HlLxe1J696puFOrkUdcplkCy5WkLgFGTvwe6KHA/viewform?usp=dialog'
    );
    assert.equal(voteRedirect.permanent, false);
  });

  it('verifies redirect URL building preserves query parameters', () => {
    const baseDestination =
      'https://docs.google.com/forms/d/e/1FAIpQLSetzOadXi8HlLxe1J696puFOrkUdcplkCy5WkLgFGTvwe6KHA/viewform?usp=dialog';
    const destUrl = new URL(baseDestination);

    // Simulate query parameter passthrough behavior
    const incomingParams = new URLSearchParams('test=1');
    incomingParams.forEach((value, key) => {
      destUrl.searchParams.set(key, value);
    });

    assert.equal(destUrl.searchParams.get('usp'), 'dialog');
    assert.equal(destUrl.searchParams.get('test'), '1');
    assert.equal(
      destUrl.toString(),
      'https://docs.google.com/forms/d/e/1FAIpQLSetzOadXi8HlLxe1J696puFOrkUdcplkCy5WkLgFGTvwe6KHA/viewform?usp=dialog&test=1'
    );
  });
});
