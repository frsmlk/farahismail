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
    serif: "'Aguzzo', Georgia, serif",
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
  | 'Urban Planning'
  | 'Interior Design'
  | 'Art Direction'
  | 'Modelling'
  | 'Artworks'
  | 'Hospitality'
  | 'Set Design'
  | 'Furniture'
  | 'Landscape';

export const CATEGORIES: { name: CategoryName; color: string }[] = [
  { name: 'Residential', color: '#1a3a5c' },
  { name: 'Urban Planning', color: '#3a5a7c' },
  { name: 'Interior Design', color: '#4a6a8c' },
  { name: 'Art Direction', color: '#5a7a9c' },
  { name: 'Modelling', color: '#6a8aac' },
  { name: 'Artworks', color: '#7a9abc' },
  { name: 'Hospitality', color: '#2c6e6a' },
  { name: 'Set Design', color: '#5c4a7c' },
  { name: 'Furniture', color: '#7c5a3a' },
  { name: 'Landscape', color: '#3a7c4a' },
];
