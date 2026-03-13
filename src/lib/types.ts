export type EntryType = 'project' | 'job' | 'education' | 'milestone';

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

export interface Profile {
  fullName: string;
  headline: string;
  bio: string;
  roles: string[];
  email: string;
  website: string;
  instagram: string;
  linkedin: string;
  location: string;
  nationality: string;
  basedIn: string;
}

export interface ArchiveEntry {
  id: number;
  title: string;
  slug: string;
  year: number;
  endYear?: number;
  entryType: EntryType;
  category: CategoryName;
  typology?: string;
  organization?: string;
  role?: string;
  location?: string;
  duration?: string;
  description: string;
  notes?: string;
  client?: string;
  collaborators?: string[];
  tools?: string[];
  tags: string[];
  status: 'complete' | 'ongoing' | 'paused';
  coordinates?: [number, number]; // [lng, lat]
  updates?: TimelineUpdate[];
  thumbnailUrl?: string;
  media?: MediaItem[];
}

export interface TimelineUpdate {
  date: string; // ISO date string
  text: string;
  type: 'note' | 'milestone' | 'photo' | 'thought';
}

export interface MediaItem {
  id: number;
  url: string;
  caption?: string;
  mediaType: 'sketch' | 'photo' | 'render' | 'document' | 'audio';
  sortOrder: number;
}

export interface Status {
  isOnline: boolean;
  currentActivity: string;
  lastSeen: string;
}

export type SortField = 'year' | 'title' | 'category';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  categories: CategoryName[];
  searchQuery: string;
  yearFrom: number | null;
  yearTo: number | null;
  sortField: SortField;
  sortDirection: SortDirection;
}
