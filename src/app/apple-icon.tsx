import { ImageResponse } from 'next/og';


// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF0A8C 0%, #D60075 100%)',
          borderRadius: 38,
          color: 'white',
          fontWeight: 900,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Accent Star */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 18,
            color: '#FFF100',
            fontSize: 22,
          }}
        >
          ✦
        </div>
        <div
          style={{
            fontSize: 16,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.92)',
            marginBottom: -2,
            fontWeight: 800,
          }}
        >
          osaka
        </div>
        <div
          style={{
            fontSize: 34,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          fringe
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
