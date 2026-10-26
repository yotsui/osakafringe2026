import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBbox,
  buildOverpassQuery,
  parseOverpassData,
  fetchGeoDataFromCartoMvt,
  generateIllustratorSvg,
  DEFAULT_LAYERS,
} from '../src/lib/svgMapGenerator.ts';

test('SVG Map Generator: Overpass query & layer separation', async (t) => {
  const bbox = calculateBbox(34.70705, 135.49737, 0.5, 1.0);

  await t.test('buildOverpassQuery omits heavy recursive relation water lookup', () => {
    const q = buildOverpassQuery(bbox);
    assert.ok(q.includes('way["natural"="water"]'));
    assert.ok(!q.includes('relation["natural"="water"]'));
    assert.ok(q.includes('[timeout:15]'));
  });

  await t.test('generateIllustratorSvg separates Layer 07 (JR/Private Rail) and Layer 08 (Osaka Metro)', () => {
    const emptyGeo = parseOverpassData({ elements: [] });

    // Only Layer 08 enabled -> only Osaka Metro lines should appear, not JR/Keihan/Hankyu
    const metroOnlySvg = generateIllustratorSvg(
      {
        centerLat: 34.70705,
        centerLng: 135.49737,
        radiusKm: 1.0,
        paperSizeId: 'square',
        stylePresetId: 'minimal-gray',
        layers: {
          ...DEFAULT_LAYERS,
          railways: false,
          metroLines: true,
        },
        venues: [],
      },
      emptyGeo
    );

    assert.ok(metroOnlySvg.includes('id="08_地下鉄路線"'));
    assert.ok(!metroOnlySvg.includes('id="07_鉄道線路"'));
    assert.ok(!metroOnlySvg.includes('data-name="JR大阪環状線"'));
    assert.ok(metroOnlySvg.includes('御堂筋線'));

    // Layer 07 enabled with empty GeoData -> falls back to local JR/private rail lines
    const railFallbackSvg = generateIllustratorSvg(
      {
        centerLat: 34.70705,
        centerLng: 135.49737,
        radiusKm: 1.0,
        paperSizeId: 'square',
        stylePresetId: 'minimal-gray',
        layers: {
          ...DEFAULT_LAYERS,
          railways: true,
          metroLines: false,
        },
        venues: [],
      },
      emptyGeo
    );

    assert.ok(railFallbackSvg.includes('id="07_鉄道線路"'));
    assert.ok(!railFallbackSvg.includes('id="08_地下鉄路線"'));
  });
});

test('SVG Map Generator: fetchGeoDataFromCartoMvt populates all layers for Osaka Umeda', async () => {
  const lat = 34.70705;
  const lng = 135.49737;
  const radiusKm = 0.5;
  const bbox = calculateBbox(lat, lng, radiusKm, 1.0);

  const geoData = await fetchGeoDataFromCartoMvt(bbox, radiusKm);

  assert.ok(geoData.waterPolygons.length > 0, 'Expected waterPolygons > 0');
  assert.ok(geoData.greeneryPolygons.length > 0, 'Expected greeneryPolygons > 0');
  assert.ok(geoData.buildingPolygons.length > 0, 'Expected buildingPolygons > 0');
  assert.ok(geoData.roadsMajor.length > 0, 'Expected roadsMajor > 0');
  assert.ok(geoData.roadsMinor.length > 0, 'Expected roadsMinor > 0');
  assert.ok(geoData.railways.length > 0, 'Expected railways > 0');

  const svg = generateIllustratorSvg(
    {
      centerLat: lat,
      centerLng: lng,
      radiusKm,
      paperSizeId: 'square',
      stylePresetId: 'minimal-gray',
      layers: DEFAULT_LAYERS,
      venues: [
        {
          id: 'v-test',
          name: 'テスト会場',
          area: 'キタ',
          address: '大阪市北区',
          capacity: 100,
          access: '徒歩5分',
          location: { lat, lng },
        },
      ],
    },
    geoData
  );

  assert.ok(svg.includes('id="01_背景"'));
  assert.ok(svg.includes('id="02_水域_河川"'));
  assert.ok(svg.includes('id="03_公園_緑地"'));
  assert.ok(svg.includes('id="04_建物"'));
  assert.ok(svg.includes('id="05_一般道路"'));
  assert.ok(svg.includes('id="06_主要道路"'));
  assert.ok(svg.includes('id="07_鉄道線路"'));
  assert.ok(svg.includes('id="08_地下鉄路線"'));
  assert.ok(svg.includes('id="09_駅_駅名"'));
  assert.ok(svg.includes('id="10_会場ピン_名称"'));
  assert.ok(svg.includes('id="12_縮尺_方角_情報"'));
});
