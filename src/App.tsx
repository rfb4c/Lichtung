import styles from './App.module.css';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import FeedItem from './components/FeedItem';
import eventsData from './data/events.json';
import { Report, Event, EventsData } from './types';

const data = eventsData as EventsData;

function getEventById(eventId: string): Event | undefined {
  return data.events.find((e) => e.id === eventId);
}

function App() {
  return (
    <div className={styles.app}>
      <Sidebar />

      <main className={styles.mainColumn}>
        <header className={styles.feedHeader}>
          <div className={styles.tabActive}>为你推荐</div>
          <div className={styles.tab}>正在关注</div>
        </header>

        <div className={styles.feed}>
          {data.reports.map((report: Report) => (
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
