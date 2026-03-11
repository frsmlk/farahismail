export const tokens = {
  colors: {
    primaryBlue: '#2c5f8a',
    darkBlue: '#132744',
    midBlue: '#1e3a5f',
    lightBlue: '#4a8ab5',
    lighterBlue: '#7bb3d4',
    faintBlue: '#a8d4ef',
    ghostBlue: '#d4eaf5',
    background: '#f5f0e8',
    cellBg: '#faf7f2',
    cellHover: '#eee9df',
    cellActive: '#e3ddd1',
    gridLine: 'rgba(44, 95, 138, 0.2)',
    gridLineHeavy: 'rgba(44, 95, 138, 0.4)',
    gridBorder: '#1e3a5f',
  },
  fonts: {
    mono: "'IBM Plex Mono', monospace",
    serif: "'Playfair Display', Georgia, serif",
  },
  sizes: {
    cellHeight: '40px',
    cellPadding: '8px 12px',
    headerHeight: '56px',
    tabHeight: '36px',
    rowNumberWidth: '48px',
  },
} as const;

export type CategoryName =
  | 'Residential'
  | 'Commercial'
  | 'Urban Planning'
  | 'Fashion Photography'
  | 'Art Direction'
  | 'Modelling'
  | 'Artworks';

export const CATEGORIES: { name: CategoryName; color: string }[] = [
  { name: 'Residential', color: '#1a3a5c' },
  { name: 'Commercial', color: '#2a4a6c' },
  { name: 'Urban Planning', color: '#3a5a7c' },
  { name: 'Fashion Photography', color: '#4a6a8c' },
  { name: 'Art Direction', color: '#5a7a9c' },
  { name: 'Modelling', color: '#6a8aac' },
  { name: 'Artworks', color: '#7a9abc' },
];
