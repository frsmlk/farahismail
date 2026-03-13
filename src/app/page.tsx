import { getAllEntries, getProfile } from '@/lib/db/queries';
import HomeClient from './HomeClient';
import type { Profile, Status } from '@/lib/types';

const defaultProfile: Profile = {
  fullName: 'Farah Ismail',
  headline: '',
  bio: '',
  roles: [],
  email: '',
  website: '',
  instagram: '',
  linkedin: '',
  location: '',
  nationality: '',
  basedIn: '',
};

const defaultStatus: Status = {
  isOnline: false,
  currentActivity: '',
  lastSeen: '',
};

export default async function Home() {
  const [entries, dbProfile] = await Promise.all([
    getAllEntries().catch(() => []),
    getProfile().catch(() => null),
  ]);

  const profile = dbProfile
    ? {
        fullName: dbProfile.fullName,
        headline: dbProfile.headline,
        bio: dbProfile.bio,
        roles: dbProfile.roles,
        email: dbProfile.email,
        website: dbProfile.website,
        instagram: dbProfile.instagram,
        linkedin: dbProfile.linkedin,
        location: dbProfile.location,
        nationality: dbProfile.nationality,
        basedIn: dbProfile.basedIn,
      }
    : defaultProfile;

  const status = dbProfile
    ? {
        isOnline: dbProfile.isOnline,
        currentActivity: dbProfile.currentActivity,
        lastSeen: dbProfile.lastSeen,
      }
    : defaultStatus;

  return (
    <HomeClient
      archiveEntries={entries}
      profile={profile}
      status={status}
    />
  );
}
