import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import FeedItem from './components/FeedItem';
import ProfilePage from './components/ProfilePage';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';
import { Report, Event, EventsData } from './types';
import { EventRow, ReportRow, mapEvent, mapReport } from './lib/mappers';
import staticData from './data/events.json';
import { isSupabaseConfigured } from './lib/config';

export type PageView = 'feed' | 'profile';

function App() {
  const fallback = staticData as EventsData;
  const [currentPage, setCurrentPage] = useState<PageView>('feed');
  const [events, setEvents] = useState<Event[]>(isSupabaseConfigured ? [] : fallback.events);
  const [reports, setReports] = useState<Report[]>(isSupabaseConfigured ? [] : (fallback.reports as Report[]));
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function fetchData() {
      const [eventsRes, reportsRes] = await Promise.all([
        supabase.from('events').select('*'),
        supabase.from('reports').select('*'),
      ]);

      if (eventsRes.error || reportsRes.error) {
        setError(eventsRes.error?.message || reportsRes.error?.message || 'Failed to load data');
        setLoading(false);
        return;
      }

      const fetchedEvents = (eventsRes.data as EventRow[]).map(mapEvent);
      const fetchedReports = (reportsRes.data as ReportRow[]).map(mapReport);

      // Supabase 表为空时回退到静态 JSON / fallback to static JSON when tables are empty
      if (fetchedEvents.length === 0 && fetchedReports.length === 0) {
        setEvents(fallback.events);
        setReports(fallback.reports as Report[]);
      } else {
        setEvents(fetchedEvents);
        setReports(fetchedReports);
      }
      setLoading(false);

      // 批量获取评论计数
      const { data: countData } = await supabase
        .from('comments')
        .select('report_id');
      if (countData) {
        const counts: Record<string, number> = {};
        for (const row of countData) {
          counts[row.report_id] = (counts[row.report_id] || 0) + 1;
        }
        setCommentCounts(counts);
      }
    }

    fetchData();
  }, []);

  const handleCommentCountChange = useCallback((reportId: string, delta: number) => {
    setCommentCounts((prev) => ({
      ...prev,
      [reportId]: (prev[reportId] || 0) + delta,
    }));
  }, []);

  const getEventById = (eventId: string): Event | undefined =>
    events.find((e) => e.id === eventId);

  const handleNavigate = useCallback((page: PageView) => setCurrentPage(page), []);

  const renderMainContent = () => {
    if (currentPage === 'profile') {
      return <ProfilePage onBack={() => setCurrentPage('feed')} />;
    }

    if (loading) {
      return (
        <>
          <header className={styles.feedHeader}>
            <div className={styles.tabActive}>For You</div>
            <div className={styles.tab}>Following</div>
          </header>
          <div className={styles.feed}>
            <div className={styles.loading}>Loading...</div>
          </div>
        </>
      );
    }

    if (error) {
      return (
        <>
          <header className={styles.feedHeader}>
            <div className={styles.tabActive}>For You</div>
            <div className={styles.tab}>Following</div>
          </header>
          <div className={styles.feed}>
            <div className={styles.error}>{error}</div>
          </div>
        </>
      );
    }

    return (
      <>
        <header className={styles.feedHeader}>
          <div className={styles.tabActive}>为你推荐</div>
          <div className={styles.tab}>正在关注</div>
        </header>
        <div className={styles.feed}>
          {reports.map((report: Report) => (
            <FeedItem
              key={report.id}
              report={report}
              event={getEventById(report.eventId)}
              commentCount={commentCounts[report.id]}
              onCommentCountChange={handleCommentCountChange}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className={styles.app}>
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className={styles.mainColumn}>
        {renderMainContent()}
      </main>

      <RightSidebar />
      <AuthModal />
    </div>
  );
}

export default App;
