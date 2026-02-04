import { useState, useEffect } from 'react';
import styles from './App.module.css';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import FeedItem from './components/FeedItem';
import { supabase } from './lib/supabase';
import { Report, Event, EventsData, Stance } from './types';
import staticData from './data/events.json';

// Supabase 返回的原始行类型
interface EventRow {
  id: string;
  title: string;
  supportive: number;
  neutral: number;
  opposed: number;
}

interface ReportRow {
  id: string;
  event_id: string;
  title: string;
  summary: string;
  source: string;
  stance: string;
  image_url: string | null;
  published_at: string | null;
}

function mapEvent(row: EventRow): Event {
  return {
    id: row.id,
    title: row.title,
    distribution: {
      supportive: row.supportive,
      neutral: row.neutral,
      opposed: row.opposed,
    },
  };
}

function mapReport(row: ReportRow): Report {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    summary: row.summary,
    source: row.source as Report['source'],
    stance: row.stance as Stance,
    imageUrl: row.image_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
  };
}

const isSupabaseConfigured =
  import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project');

function App() {
  const fallback = staticData as EventsData;
  const [events, setEvents] = useState<Event[]>(isSupabaseConfigured ? [] : fallback.events);
  const [reports, setReports] = useState<Report[]>(isSupabaseConfigured ? [] : (fallback.reports as Report[]));
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
        setError(eventsRes.error?.message || reportsRes.error?.message || '数据加载失败');
        setLoading(false);
        return;
      }

      setEvents((eventsRes.data as EventRow[]).map(mapEvent));
      setReports((reportsRes.data as ReportRow[]).map(mapReport));
      setLoading(false);
    }

    fetchData();
  }, []);

  const getEventById = (eventId: string): Event | undefined =>
    events.find((e) => e.id === eventId);

  if (loading) {
    return (
      <div className={styles.app}>
        <Sidebar />
        <main className={styles.mainColumn}>
          <header className={styles.feedHeader}>
            <div className={styles.tabActive}>为你推荐</div>
            <div className={styles.tab}>正在关注</div>
          </header>
          <div className={styles.feed}>
            <div className={styles.loading}>加载中...</div>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.app}>
        <Sidebar />
        <main className={styles.mainColumn}>
          <header className={styles.feedHeader}>
            <div className={styles.tabActive}>为你推荐</div>
            <div className={styles.tab}>正在关注</div>
          </header>
          <div className={styles.feed}>
            <div className={styles.error}>{error}</div>
          </div>
        </main>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <Sidebar />

      <main className={styles.mainColumn}>
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
            />
          ))}
        </div>
      </main>

      <RightSidebar />
    </div>
  );
}

export default App;
