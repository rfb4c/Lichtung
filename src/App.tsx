import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import FeedItem from './components/FeedItem';
import ProfilePage from './components/ProfilePage';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';
import { Report, Topic, AppData } from './types';
import { TopicRow, ReportRow, mapTopic, mapReport } from './lib/mappers';
import { matchAllReports } from './lib/matchers';
import staticData from './data/app-data.json';
import { isSupabaseConfigured } from './lib/config';

export type PageView = 'feed' | 'profile';

function App() {
  const fallback = staticData as AppData;
  // Apply topic matching to static reports on initial load
  const matchedReports = matchAllReports(fallback.reports as Report[], fallback.topics);

  const [currentPage, setCurrentPage] = useState<PageView>('feed');
  const [topics, setTopics] = useState<Topic[]>(isSupabaseConfigured ? [] : fallback.topics);
  const [reports, setReports] = useState<Report[]>(isSupabaseConfigured ? [] : matchedReports);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, _setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function fetchData() {
      const [topicsRes, reportsRes] = await Promise.all([
        supabase.from('topics').select('*'),
        supabase.from('reports').select('*'),
      ]);

      // If tables don't exist or error occurs, fallback to static JSON
      if (topicsRes.error || reportsRes.error) {
        console.warn('Supabase tables not found, using static JSON data:', {
          topicsError: topicsRes.error?.message,
          reportsError: reportsRes.error?.message
        });
        const matchedReports = matchAllReports(fallback.reports as Report[], fallback.topics);
        setTopics(fallback.topics);
        setReports(matchedReports);
        setLoading(false);
        return;
      }

      const fetchedTopics = (topicsRes.data as TopicRow[]).map(mapTopic);
      const fetchedReports = (reportsRes.data as ReportRow[]).map(mapReport);

      // Apply automatic topic matching algorithm
      // Match reports to topics/subtopics based on keyword matching
      const matchedReports = matchAllReports(fetchedReports, fetchedTopics);

      // Fallback to static JSON when tables are empty
      if (fetchedTopics.length === 0 && fetchedReports.length === 0) {
        const staticMatched = matchAllReports(fallback.reports as Report[], fallback.topics);
        setTopics(fallback.topics);
        setReports(staticMatched);
      } else {
        setTopics(fetchedTopics);
        setReports(matchedReports);
      }
      setLoading(false);

      // Fetch comment counts
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

  const getTopicById = (topicId: string): Topic | undefined =>
    topics.find((t) => t.id === topicId);

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
              topic={report.topicId ? getTopicById(report.topicId) : undefined}
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
