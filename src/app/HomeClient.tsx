'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import type { TabItem } from '@/components/TabBar';
import type { ViewMode } from '@/components/ArchiveTab';
import Footer from '@/components/Footer';
import GridContainer from '@/components/GridContainer';
import ProfileTab from '@/components/ProfileTab';
import ArchiveTab from '@/components/ArchiveTab';
import DetailTab from '@/components/DetailTab';
import VoiceNotePlayer from '@/components/VoiceNotePlayer';
import type { VoiceNote } from '@/components/VoiceNotePlayer';
import FloatingWindow from '@/components/FloatingWindow';
import type { ArchiveEntry, Profile, Status } from '@/lib/types';
import { useSSE } from '@/lib/useSSE';

type TabId = 'profile' | 'archive' | string;

function parseHash(hash: string): TabId {
  const cleaned = hash.replace(/^#/, '');
  if (!cleaned) return 'profile';
  if (cleaned === 'profile' || cleaned === 'archive') return cleaned;
  if (cleaned.startsWith('detail/')) return cleaned;
  return 'profile';
}

interface HomeClientProps {
  archiveEntries: ArchiveEntry[];
  profile: Profile;
  status: Status;
}

export default function HomeClient({ archiveEntries: initialEntries, profile: initialProfile, status: initialStatus }: HomeClientProps) {
  const [entries, setEntries] = useState<ArchiveEntry[]>(initialEntries);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [status, setStatus] = useState<Status>(initialStatus);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [detailTabs, setDetailTabs] = useState<string[]>([]);
  const [floatingTabs, setFloatingTabs] = useState<string[]>([]);
  const [activeVoiceNote, setActiveVoiceNote] = useState<VoiceNote | null>(null);
  const [archiveViewMode, setArchiveViewMode] = useState<ViewMode>('list');
  const [filterStatus, setFilterStatus] = useState('NO FILTER');

  const refreshData = useCallback(async () => {
    try {
      const [entriesRes, profileRes] = await Promise.all([
        fetch('/api/entries').then((r) => r.json()),
        fetch('/api/profile').then((r) => r.ok ? r.json() : null),
      ]);
      if (entriesRes.entries) setEntries(entriesRes.entries);
      if (profileRes) {
        const { isOnline, currentActivity, lastSeen, ...prof } = profileRes;
        setProfile(prof);
        setStatus({ isOnline: isOnline ?? false, currentActivity: currentActivity ?? '', lastSeen: lastSeen ?? '' });
      }
    } catch {
      // Silently ignore — will retry on next event
    }
  }, []);

  useSSE(useCallback(() => {
    refreshData();
  }, [refreshData]));

  function getSlugLabel(tabId: string): string {
    if (!tabId.startsWith('detail/')) return tabId;
    const slug = tabId.replace('detail/', '');
    const entry = entries.find((e) => e.slug === slug);
    if (entry) return entry.title;
    return slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  const navigateTo = useCallback(
    (tabId: string) => {
      window.location.hash = tabId;
      setActiveTab(tabId);

      if (tabId.startsWith('detail/')) {
        setDetailTabs((prev) => prev.includes(tabId) ? prev : [...prev, tabId]);
      }
    },
    []
  );

  const closeDetailTab = useCallback(
    (tabId: string) => {
      setDetailTabs((prev) => prev.filter((t) => t !== tabId));
      setFloatingTabs((prev) => prev.filter((t) => t !== tabId));
      if (activeTab === tabId) {
        navigateTo('archive');
      }
    },
    [activeTab, navigateTo]
  );

  const detachTab = useCallback(
    (tabId: string) => {
      setFloatingTabs((prev) => prev.includes(tabId) ? prev : [...prev, tabId]);
      if (activeTab === tabId) {
        navigateTo('archive');
      }
    },
    [activeTab, navigateTo]
  );

  const dockTab = useCallback(
    (tabId: string) => {
      setFloatingTabs((prev) => prev.filter((t) => t !== tabId));
      navigateTo(tabId);
    },
    [navigateTo]
  );

  useEffect(() => {
    const handleHashChange = () => {
      const tabId = parseHash(window.location.hash);
      setActiveTab(tabId);
      if (tabId.startsWith('detail/')) {
        setDetailTabs((prev) => prev.includes(tabId) ? prev : [...prev, tabId]);
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dockedDetailTabs = detailTabs.filter((t) => !floatingTabs.includes(t));

  const tabs: TabItem[] = [
    { id: 'profile', label: 'Profile', closable: false },
    { id: 'archive', label: 'Archive', closable: false },
    ...dockedDetailTabs.map((id) => ({
      id,
      label: getSlugLabel(id),
      closable: true,
    })),
  ];

  const rowCount =
    activeTab === 'archive'
      ? entries.length
      : activeTab === 'profile'
        ? 1
        : 1;

  const showDockedDetail =
    activeTab.startsWith('detail/') && !floatingTabs.includes(activeTab);

  return (
    <>
      <Header onNavigate={navigateTo} isOnline={status.isOnline} lastSeen={status.lastSeen} currentActivity={status.currentActivity} archiveEntries={entries} fullName={profile.fullName} roles={profile.roles} />
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={navigateTo}
        onTabClose={closeDetailTab}
        onTabDetach={detachTab}
        archiveViewMode={archiveViewMode}
        onArchiveViewModeChange={setArchiveViewMode}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <GridContainer showRowNumbers={false} rowCount={rowCount}>
          {activeTab === 'profile' && (
            <ProfileTab
              onNavigate={navigateTo}
              profile={profile}
              status={status}
              archiveEntries={entries}
            />
          )}

          {activeTab === 'archive' && (
            <ArchiveTab
              viewMode={archiveViewMode}
              onRowClick={(slug) => navigateTo(`detail/${slug}`)}
              onOpenFloating={(slug) => {
                const tabId = `detail/${slug}`;
                setDetailTabs((prev) => prev.includes(tabId) ? prev : [...prev, tabId]);
                setFloatingTabs((prev) => prev.includes(tabId) ? prev : [...prev, tabId]);
              }}
              onFilterStatusChange={setFilterStatus}
              archiveEntries={entries}
            />
          )}

          {showDockedDetail && (
            <DetailTab
              slug={activeTab.replace('detail/', '')}
              entries={entries}
              onClose={() => closeDetailTab(activeTab)}
              onNavigate={(newSlug) => navigateTo(`detail/${newSlug}`)}
              onPlayVoiceNote={(note) => setActiveVoiceNote(note)}
            />
          )}
        </GridContainer>
      </div>

      <Footer
        activeTab={activeTab}
        rowCount={rowCount}
        filterStatus={activeTab === 'archive' ? filterStatus : undefined}
      />

      {floatingTabs.map((tabId, i) => {
        const slug = tabId.replace('detail/', '');
        return (
          <FloatingWindow
            key={tabId}
            id={tabId}
            title={getSlugLabel(tabId)}
            initialX={120 + i * 30}
            initialY={80 + i * 30}
            onClose={() => closeDetailTab(tabId)}
            onDock={() => dockTab(tabId)}
          >
            <DetailTab
              slug={slug}
              entries={entries}
              onClose={() => closeDetailTab(tabId)}
              onNavigate={(newSlug) => {
                closeDetailTab(tabId);
                navigateTo(`detail/${newSlug}`);
              }}
              onPlayVoiceNote={(note) => setActiveVoiceNote(note)}
              isFloating
            />
          </FloatingWindow>
        );
      })}

      <VoiceNotePlayer note={activeVoiceNote} onClose={() => setActiveVoiceNote(null)} />
    </>
  );
}
