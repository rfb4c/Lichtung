import { useState, useEffect, useCallback } from 'react';
import styles from './App.module.css';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import FeedItem from './components/FeedItem';
import ProfilePage from './components/ProfilePage';
import UserProfilePage from './components/UserProfilePage';
import AuthModal from './components/AuthModal';
import ToastContainer from './components/ToastContainer';
import { supabase } from './lib/supabase';
import { Report, Topic, AppData } from './types';
import { TopicRow, ReportRow, mapTopic, mapReport } from './lib/mappers';
import { matchAllReports } from './lib/matchers';
import staticData from './data/app-data.json';
import { isSupabaseConfigured } from './lib/config';

export type PageView = 'feed' | 'profile' | 'user-profile';

function App() {
  const fallback = staticData as AppData;
  // Apply topic matching to static reports on initial load
  const matchedReports = matchAllReports(fallback.reports as Report[], fallback.topics);

  const [currentPage, setCurrentPage] = useState<PageView>('feed');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null);
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

  const handleNavigate = useCallback((page: PageView) => {
    setCurrentPage(page);
    // Clear focused report when navigating to feed normally
    if (page === 'feed') {
      setFocusedReportId(null);
    }
  }, []);

  const handleUserClick = useCallback((userId: string) => {
    setCurrentUserId(userId);
    setCurrentPage('user-profile');
  }, []);

  const handleNavigateToReport = useCallback((reportId: string) => {
    setFocusedReportId(reportId);
    setCurrentPage('feed');
  }, []);

  const handleBackToAllReports = useCallback(() => {
    setFocusedReportId(null);
  }, []);

  const renderMainContent = () => {
    if (currentPage === 'profile') {
      return (
        <ProfilePage
          onBack={() => setCurrentPage('feed')}
          onNavigateToReport={handleNavigateToReport}
        />
      );
    }

    if (currentPage === 'user-profile' && currentUserId) {
      return (
        <UserProfilePage
          userId={currentUserId}
          onNavigateBack={() => setCurrentPage('feed')}
          onNavigateToReport={handleNavigateToReport}
        />
      );
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

    // Filter reports if focusing on one
    const displayReports = focusedReportId
      ? reports.filter((r) => r.id === focusedReportId)
      : reports;

    return (
      <>
        <header className={styles.feedHeader}>
          {focusedReportId ? (
            <button
              className={styles.backToFeed}
              onClick={handleBackToAllReports}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Back to all reports</span>
            </button>
          ) : (
            <>
              <div className={styles.tabActive}>为你推荐</div>
              <div className={styles.tab}>正在关注</div>
            </>
          )}
        </header>
        <div className={styles.feed}>
          {displayReports.map((report: Report) => (
            <div key={report.id} id={`report-${report.id}`}>
              <FeedItem
                report={report}
                topic={report.topicId ? getTopicById(report.topicId) : undefined}
                commentCount={commentCounts[report.id]}
                onCommentCountChange={handleCommentCountChange}
                onUserClick={handleUserClick}
                initialViewMode={focusedReportId === report.id ? 'comments' : 'closed'}
              />
            </div>
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
      <ToastContainer />
    </div>
  );
}

export default App;
