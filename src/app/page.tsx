import { getAllEntries, getProfile } from '@/lib/db/queries';
import { archiveEntries as seedEntries, profile as seedProfile, status as seedStatus } from '@/lib/seed-data';
import HomeClient from './HomeClient';

export default async function Home() {
  // Fetch from DB, fall back to seed data if empty
  const [dbEntries, dbProfile] = await Promise.all([
    getAllEntries().catch(() => []),
    getProfile().catch(() => null),
  ]);

  const archiveEntries = dbEntries.length > 0 ? dbEntries : seedEntries;

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
    : seedProfile;

  const status = dbProfile
    ? {
        isOnline: dbProfile.isOnline,
        currentActivity: dbProfile.currentActivity,
        lastSeen: dbProfile.lastSeen,
      }
    : seedStatus;

  return (
    <HomeClient
      archiveEntries={archiveEntries}
      profile={profile}
      status={status}
    />
  );
}
