import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { sortAlgorithm, sortCalibrated, type FeedMode } from './lib/feedSorter';
import { staticCommentCounts } from './lib/commentCounts';
import staticData from './data/app-data.json';
import { isSupabaseConfigured } from './lib/config';

export type PageView = 'feed' | 'profile' | 'user-profile';

function App() {
  const fallback = staticData as AppData;
  const fallbackReports = fallback.reports as Report[];

  const [currentPage, setCurrentPage] = useState<PageView>('feed');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [focusedReportId, setFocusedReportId] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>(isSupabaseConfigured ? [] : fallback.topics);
  const [reports, setReports] = useState<Report[]>(isSupabaseConfigured ? [] : fallbackReports);
  const [feedMode, setFeedMode] = useState<FeedMode>('algorithm');
  // 以静态计数为基线：数据库里没有评论的报道，评论区会回落到 mockComments，
  // 计数必须跟着回落，否则用户发一条评论后徽标会从 3 掉到 1。
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(staticCommentCounts);
  const [loading, setLoading] = useState(isSupabaseConfigured);

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
        setTopics(fallback.topics);
        setReports(fallbackReports);
        setLoading(false);
        return;
      }

      const fetchedTopics = (topicsRes.data as TopicRow[]).map(mapTopic);
      const fetchedReports = (reportsRes.data as ReportRow[]).map(mapReport);

      // Fallback to static JSON when tables are empty
      if (fetchedTopics.length === 0 && fetchedReports.length === 0) {
        setTopics(fallback.topics);
        setReports(fallbackReports);
      } else {
        setTopics(fetchedTopics);
        setReports(fetchedReports);
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
        setCommentCounts({ ...staticCommentCounts, ...counts });
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

  const sortedReports = useMemo(
    () => feedMode === 'algorithm' ? sortAlgorithm(reports) : sortCalibrated(reports),
    [reports, feedMode]
  );

  const getTopicById = (topicId: string): Topic | undefined =>
    topics.find((t) => t.id === topicId);

  const handleNavigate = useCallback((page: PageView) => {
    setCurrentPage(page);
    // Clear focused report and topic filter when navigating to feed (Home)
    if (page === 'feed') {
      setFocusedReportId(null);
      setTopicFilter('');
    }
  }, []);

  const handleTopicFilter = useCallback((query: string) => {
    setTopicFilter(query);
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

    // Filter reports: focused report > topic filter > all (applied to sorted list)
    let displayReports = focusedReportId
      ? sortedReports.filter((r) => r.id === focusedReportId)
      : sortedReports;

    if (!focusedReportId && topicFilter) {
      const lowerQuery = topicFilter.toLowerCase();
      const matchedTopicIds = topics
        .filter((t) => t.name.toLowerCase().includes(lowerQuery))
        .map((t) => t.id);
      displayReports = displayReports.filter(
        (r) => r.topicId && matchedTopicIds.includes(r.topicId)
      );
    }

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
              <div className={styles.tabActive}>For You</div>
              <div className={styles.tab}>Following</div>
            </>
          )}
        </header>
        {!focusedReportId && (
          <div className={styles.feedModeBar}>
            <span className={styles.feedModeLabel}>
              Feed: {feedMode === 'algorithm' ? 'Algorithm' : 'Calibrated'}
            </span>
            <button
              className={styles.feedModeButton}
              onClick={() => setFeedMode(m => m === 'algorithm' ? 'calibrated' : 'algorithm')}
            >
              ↔ {feedMode === 'algorithm' ? 'Calibrated Feed' : 'Algorithm Feed'}
            </button>
          </div>
        )}
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

      <RightSidebar onTopicFilter={handleTopicFilter} />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}

export default App;
