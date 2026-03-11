'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { ArchiveEntry } from '@/lib/types';
import { CATEGORIES } from '@/lib/design-system';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface MapViewProps {
  entries: ArchiveEntry[];
  onEntryClick: (slug: string) => void;
  onOpenFloating?: (slug: string) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

const categoryColorMap: Record<string, string> = {};
CATEGORIES.forEach((c) => {
  categoryColorMap[c.name] = c.color;
});

function entriesToGeoJSON(entries: ArchiveEntry[]) {
  return {
    type: 'FeatureCollection' as const,
    features: entries
      .filter((e) => e.coordinates)
      .map((e) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: e.coordinates as [number, number],
        },
        properties: {
          id: e.id,
          slug: e.slug,
          title: e.title,
          year: e.year,
          category: e.category,
          location: e.location || '',
          status: e.status,
          description: e.description,
        },
      })),
  };
}

function tintMapLayers(m: mapboxgl.Map) {
  const layers = m.getStyle().layers || [];
  for (const layer of layers) {
    const id = layer.id;
    const type = layer.type;
    try {
      // Only override water — ocean dark blue, rest light
      if (id.includes('water')) {
        if (type === 'fill') {
          m.setPaintProperty(id, 'fill-color', [
            'match', ['get', 'class'],
            'ocean', '#2c5f8a',
            'sea', '#2c5f8a',
            '#c4d8e8',
          ]);
        } else if (type === 'line') {
          m.setPaintProperty(id, 'line-color', '#a0bdd4');
        }
      }
    } catch {
      // skip unsupported
    }
  }
}

export default function MapView({ entries, onEntryClick, onOpenFloating }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const [selectedEntry, setSelectedEntry] = useState<ArchiveEntry | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [pinned, setPinned] = useState(false); // pinned = clicked from sidebar
  const popupHovered = useRef(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listItemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const geoEntries = useMemo(
    () => entries.filter((e) => e.coordinates),
    [entries]
  );
  const geojson = useMemo(() => entriesToGeoJSON(entries), [entries]);

  // Scroll sidebar to selected entry
  useEffect(() => {
    if (selectedEntry) {
      const el = listItemRefs.current.get(selectedEntry.id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedEntry]);

  // Update popup position on map move
  useEffect(() => {
    const m = mapRef.current;
    if (!m || !selectedEntry?.coordinates) {
      setPopupPos(null);
      return;
    }
    const update = () => {
      const px = m.project(selectedEntry.coordinates as mapboxgl.LngLatLike);
      setPopupPos({ x: px.x, y: px.y });
    };
    update();
    m.on('move', update);
    return () => {
      m.off('move', update);
    };
  }, [selectedEntry]);

  // Resize map when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(() => mapRef.current?.resize(), 280);
    return () => clearTimeout(timer);
  }, [sidebarOpen]);

  // ─── Initialize map ───
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [101.69, 3.14],
      zoom: 10,
      attributionControl: false,
      maxZoom: 16,
      minZoom: 4,
    });

    m.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'top-right'
    );
    m.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      'bottom-left'
    );
    mapRef.current = m;

    m.on('load', () => {
      tintMapLayers(m);

      // GeoJSON source with clustering
      m.addSource('entries', {
        type: 'geojson',
        data: entriesToGeoJSON(entriesRef.current) as GeoJSON.FeatureCollection,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // ── Cluster bubbles
      m.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'entries',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#2c5f8a',
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            18, // default
            5, 22, // >=5
            10, 28, // >=10
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#132744',
        },
      });

      // ── Cluster count labels
      m.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'entries',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#f5f0e8',
        },
      });

      // ── Category color match expression
      const colorMatch: unknown[] = ['match', ['get', 'category']];
      CATEGORIES.forEach((c) => {
        colorMatch.push(c.name, c.color);
      });
      colorMatch.push('#2c5f8a');

      // ── Unclustered points
      m.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'entries',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': colorMatch as mapboxgl.Expression,
          'circle-radius': [
            'case',
            ['==', ['get', 'status'], 'ongoing'],
            7,
            5,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': [
            'case',
            ['==', ['get', 'status'], 'ongoing'],
            '#132744',
            'rgba(19,39,68,0.5)',
          ],
        },
      });

      // ── Selected ring (hidden initially)
      m.addLayer({
        id: 'selected-ring',
        type: 'circle',
        source: 'entries',
        filter: ['==', ['get', 'id'], -1],
        paint: {
          'circle-radius': 14,
          'circle-color': 'transparent',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#132744',
        },
      });

      // ── Hovered ring (hidden initially)
      m.addLayer({
        id: 'hovered-ring',
        type: 'circle',
        source: 'entries',
        filter: ['==', ['get', 'id'], -1],
        paint: {
          'circle-radius': 11,
          'circle-color': 'transparent',
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(19,39,68,0.4)',
        },
      });

      // ── Cursors
      m.on('mouseenter', 'clusters', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'clusters', () => {
        m.getCanvas().style.cursor = '';
      });
      m.on('mouseenter', 'unclustered-point', () => {
        m.getCanvas().style.cursor = 'pointer';
      });
      m.on('mouseleave', 'unclustered-point', () => {
        m.getCanvas().style.cursor = '';
      });

      // ── Hover on unclustered points → show popup
      m.on('mousemove', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature?.properties) return;
        const entryId = Number(feature.properties.id);
        const entry = entriesRef.current.find((en) => en.id === entryId);
        if (entry) {
          setSelectedEntry(entry);
        }
      });

      m.on('mouseleave', 'unclustered-point', () => {
        // Delay dismiss so user can hover onto the popup card
        dismissTimer.current = setTimeout(() => {
          if (!popupHovered.current) {
            setSelectedEntry(null);
            setPinned(false);
          }
        }, 200);
      });

      // ── Click handler — clusters expand, empty space deselects
      m.on('click', (e) => {
        // Check clusters first
        const clusterFeatures = m.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });
        if (clusterFeatures.length > 0) {
          const clusterId = clusterFeatures[0].properties?.cluster_id;
          if (clusterId != null) {
            const source = m.getSource('entries') as mapboxgl.GeoJSONSource;
            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err || zoom == null) return;
              const coords = (clusterFeatures[0].geometry as GeoJSON.Point)
                .coordinates as [number, number];
              m.flyTo({ center: coords, zoom: zoom + 0.5, duration: 600 });
            });
          }
          return;
        }

        // Click on empty space — deselect
        setSelectedEntry(null);
        setPinned(false);
      });

      // ── Fit bounds on initial load
      const geo = entriesRef.current.filter((en) => en.coordinates);
      if (geo.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        geo.forEach((en) =>
          bounds.extend(en.coordinates as [number, number])
        );
        m.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 300, right: 60 },
          maxZoom: 12,
        });
      }

      setMapLoaded(true);
    });

    return () => {
      m.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Update source data when entries change ───
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource(
      'entries'
    ) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojson as unknown as GeoJSON.FeatureCollection);
    }
    // Clear selection if entry no longer in filtered list
    if (selectedEntry && !entries.find((e) => e.id === selectedEntry.id)) {
      setSelectedEntry(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geojson, mapLoaded]);

  // ─── Update selected ring filter ───
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    try {
      mapRef.current.setFilter('selected-ring', [
        '==',
        ['get', 'id'],
        selectedEntry?.id ?? -1,
      ]);
    } catch {
      // layer not ready
    }
  }, [selectedEntry, mapLoaded]);

  // ─── Update hovered ring filter ───
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    try {
      mapRef.current.setFilter('hovered-ring', [
        '==',
        ['get', 'id'],
        hoveredId ?? -1,
      ]);
    } catch {
      // layer not ready
    }
  }, [hoveredId, mapLoaded]);

  // ─── Sidebar handlers ───
  const handleSidebarSelect = useCallback((entry: ArchiveEntry) => {
    setSelectedEntry(entry);
    setPinned(true);
    if (entry.coordinates && mapRef.current) {
      mapRef.current.flyTo({
        center: entry.coordinates as [number, number],
        zoom: Math.max(mapRef.current.getZoom(), 13),
        duration: 600,
      });
    }
  }, []);

  const handleSidebarHover = useCallback((id: number | null) => {
    setHoveredId(id);
  }, []);

  // ─── No token fallback ───
  if (!MAPBOX_TOKEN) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--color-primary-blue)',
          opacity: 0.5,
          padding: '48px',
          textAlign: 'center',
        }}
      >
        NEXT_PUBLIC_MAPBOX_TOKEN not set. Add it to .env.local to enable map
        view.
      </div>
    );
  }

  // Popup vertical flip check
  const flipBelow = popupPos ? popupPos.y < 220 : false;

  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        position: 'relative',
      }}
    >
      {/* ─── SIDEBAR ─── */}
      <div
        className="map-sidebar"
        style={{
          width: sidebarOpen ? '240px' : '0px',
          overflow: 'hidden',
          transition: 'width 0.25s ease',
          borderRight: sidebarOpen
            ? '1px solid var(--color-gridline-heavy)'
            : 'none',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          backgroundColor: 'var(--color-cell-bg)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '10px 12px',
            borderBottom: '1px solid var(--color-gridline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              opacity: 0.6,
              whiteSpace: 'nowrap',
            }}
          >
            ENTRIES ({geoEntries.length})
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              all: 'unset',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              color: 'var(--color-primary-blue)',
              opacity: 0.5,
            }}
          >
            <ChevronLeft size={12} />
          </button>
        </div>

        {/* Entry list */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {geoEntries.map((entry) => {
            const isSelected = selectedEntry?.id === entry.id;
            const isHovered = hoveredId === entry.id;
            const catColor =
              categoryColorMap[entry.category] || '#2c5f8a';
            return (
              <button
                key={entry.id}
                ref={(el) => {
                  if (el) listItemRefs.current.set(entry.id, el);
                }}
                onClick={() => handleSidebarSelect(entry)}
                onMouseEnter={() => handleSidebarHover(entry.id)}
                onMouseLeave={() => handleSidebarHover(null)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '8px',
                  padding: '8px 12px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderBottom: '1px solid var(--color-gridline)',
                  borderLeft: isSelected
                    ? '3px solid var(--color-primary-blue)'
                    : '3px solid transparent',
                  backgroundColor: isSelected
                    ? 'var(--color-cell-active)'
                    : isHovered
                      ? 'var(--color-cell-hover)'
                      : 'transparent',
                  transition: 'background-color 0.1s ease',
                }}
              >
                {/* Category dot */}
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: catColor,
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--color-primary-blue)',
                      opacity: 0.5,
                      letterSpacing: '0.06em',
                      marginBottom: '1px',
                    }}
                  >
                    {entry.year}
                    {entry.status === 'ongoing' ? ' · ONGOING' : ''}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--color-dark-blue)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.title}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--color-primary-blue)',
                      opacity: 0.4,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginTop: '1px',
                    }}
                  >
                    {entry.category}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar expand toggle (when collapsed) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '48px',
            backgroundColor: 'rgba(250, 247, 242, 0.95)',
            borderRight: '1px solid var(--color-gridline-heavy)',
            borderTop: '1px solid var(--color-gridline-heavy)',
            borderBottom: '1px solid var(--color-gridline-heavy)',
            color: 'var(--color-primary-blue)',
            padding: 0,
          }}
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* ─── MAP ─── */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <div
          ref={mapContainer}
          style={{ width: '100%', height: '100%' }}
        />

        {/* ── Popup card ── */}
        {selectedEntry && popupPos && (
          <div
            className="map-popup"
            onMouseEnter={() => {
              popupHovered.current = true;
              if (dismissTimer.current) clearTimeout(dismissTimer.current);
            }}
            onMouseLeave={() => {
              popupHovered.current = false;
              if (!pinned) {
                setSelectedEntry(null);
              }
            }}
            style={{
              position: 'absolute',
              left: Math.max(150, popupPos.x),
              top: popupPos.y,
              transform: flipBelow
                ? 'translate(-50%, 20px)'
                : 'translate(-50%, calc(-100% - 20px))',
              zIndex: 30,
              width: '280px',
              backgroundColor: 'rgba(250, 247, 242, 0.97)',
              border: '1px solid var(--color-gridline-heavy)',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'auto',
            }}
          >
            {/* Pointer triangle */}
            <div
              style={{
                position: 'absolute',
                ...(flipBelow
                  ? { top: '-7px' }
                  : { bottom: '-7px' }),
                left: '50%',
                transform: `translateX(-50%) rotate(${flipBelow ? '225deg' : '45deg'})`,
                width: '12px',
                height: '12px',
                backgroundColor: 'rgba(250, 247, 242, 0.97)',
                borderRight: '1px solid var(--color-gridline-heavy)',
                borderBottom: '1px solid var(--color-gridline-heavy)',
              }}
            />

            <div style={{ padding: '12px 14px' }}>
              {/* Category + Year badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    backgroundColor:
                      categoryColorMap[selectedEntry.category] ||
                      '#2c5f8a',
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-primary-blue)',
                    opacity: 0.6,
                  }}
                >
                  {selectedEntry.year} &middot; {selectedEntry.category}
                  {selectedEntry.status === 'ongoing' && (
                    <span
                      style={{ color: '#22c55e', marginLeft: '4px' }}
                    >
                      &middot; ONGOING
                    </span>
                  )}
                </span>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-dark-blue)',
                  marginBottom: '4px',
                  fontFamily: 'var(--font-serif)',
                  lineHeight: 1.3,
                }}
              >
                {selectedEntry.title}
              </div>

              {/* Location */}
              {selectedEntry.location && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    color: 'var(--color-primary-blue)',
                    opacity: 0.5,
                    marginBottom: '6px',
                  }}
                >
                  <MapPin size={9} />
                  {selectedEntry.location}
                </div>
              )}

              {/* Description snippet */}
              <div
                style={{
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: 'var(--color-dark-blue)',
                  opacity: 0.7,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: '8px',
                }}
              >
                {selectedEntry.description}
              </div>

              {/* Tags */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '3px',
                  marginBottom: '10px',
                }}
              >
                {selectedEntry.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '9px',
                      letterSpacing: '0.04em',
                      padding: '2px 5px',
                      border: '1px solid var(--color-gridline)',
                      color: 'var(--color-primary-blue)',
                      opacity: 0.6,
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {selectedEntry.tags.length > 4 && (
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '2px 5px',
                      color: 'var(--color-primary-blue)',
                      opacity: 0.4,
                    }}
                  >
                    +{selectedEntry.tags.length - 4}
                  </span>
                )}
              </div>

              {/* View Detail button */}
              <button
                onClick={() => {
                  const handler = onOpenFloating || onEntryClick;
                  handler(selectedEntry.slug);
                  setSelectedEntry(null);
                }}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '7px',
                  backgroundColor: 'var(--color-primary-blue)',
                  color: '#f5f0e8',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  transition: 'background-color 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#132744';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'var(--color-primary-blue)';
                }}
              >
                VIEW DETAIL
                <ArrowRight size={10} />
              </button>
            </div>
          </div>
        )}

        {/* ── Legend ── */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            backgroundColor: 'rgba(250, 247, 242, 0.95)',
            border: '1px solid var(--color-gridline-heavy)',
            padding: '10px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.06em',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div
            style={{
              textTransform: 'uppercase',
              color: 'var(--color-primary-blue)',
              opacity: 0.5,
              marginBottom: '2px',
            }}
          >
            CATEGORIES
          </div>
          {CATEGORIES.map((cat) => (
            <div
              key={cat.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: cat.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: 'var(--color-dark-blue)',
                  textTransform: 'uppercase',
                }}
              >
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
