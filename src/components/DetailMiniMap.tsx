'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface DetailMiniMapProps {
  coordinates: [number, number]; // [lng, lat]
  label?: string;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

export default function DetailMiniMap({ coordinates, label }: DetailMiniMapProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: container.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: coordinates,
      zoom: 13,
      attributionControl: false,
      interactive: false,
    });

    m.on('load', () => {
      // Tint water only
      const layers = m.getStyle().layers || [];
      for (const layer of layers) {
        try {
          if (layer.id.includes('water') && layer.type === 'fill') {
            m.setPaintProperty(layer.id, 'fill-color', [
              'match', ['get', 'class'],
              'ocean', '#2c5f8a',
              'sea', '#2c5f8a',
              '#c4d8e8',
            ]);
          }
        } catch {
          // skip
        }
      }
    });

    // Marker
    const el = document.createElement('div');
    el.style.width = '12px';
    el.style.height = '12px';
    el.style.backgroundColor = '#2c5f8a';
    el.style.border = '2px solid #132744';
    el.style.boxShadow = '0 0 0 3px rgba(44, 95, 138, 0.3)';

    new mapboxgl.Marker({ element: el })
      .setLngLat(coordinates)
      .addTo(m);

    return () => {
      m.remove();
    };
  }, [coordinates]);

  if (!MAPBOX_TOKEN) return null;

  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--color-primary-blue)',
          opacity: 0.5,
          marginTop: '20px',
          marginBottom: '8px',
        }}
      >
        LOCATION
      </div>
      <div
        style={{
          border: '1px solid var(--color-gridline-heavy)',
          height: '160px',
          position: 'relative',
        }}
      >
        <div ref={container} style={{ width: '100%', height: '100%' }} />
        {label && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(250, 247, 242, 0.9)',
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: 'var(--color-dark-blue)',
              letterSpacing: '0.04em',
              borderTop: '1px solid var(--color-gridline)',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
