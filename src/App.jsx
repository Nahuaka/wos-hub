import { Navigate, Route, Routes } from 'react-router-dom';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import Sidebar from './components/sidebar/Sidebar';
import AccountLayout from './pages/AccountLayout';
import OverviewPage from './pages/OverviewPage';
import RallyLeadPage from './pages/RallyLeadPage';
import HeroesPage from './pages/HeroesPage';
import EventHistoryPage from './pages/EventHistoryPage';
import PlayersPage from './pages/PlayersPage';
import EventManagementPage from './pages/EventManagementPage';
import EventDetailPage from './pages/EventDetailPage';
import SettingsPage from './pages/SettingsPage';

function AppShell() {
  const { loading, error, accounts } = useAppData();

  if (loading) {
    return (
      <div style={{ padding: 60, color: 'var(--text-dim)' }}>Loading WOS Hub&hellip;</div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 60, color: 'var(--red)' }}>
        Failed to load data from Supabase: {error.message}
        <br />
        Check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file and that
        the schema in supabase/schema.sql has been run against your project.
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div style={{ padding: 60, color: 'var(--text-dim)' }}>
        No accounts found. Run supabase/seed.sql, or use "Add Alt" once at least one account
        exists.
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="main">
        <Routes>
          <Route path="/" element={<Navigate to="/overview" replace />} />

          <Route element={<AccountLayout />}>
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/rally-lead" element={<RallyLeadPage />} />
            <Route path="/heroes" element={<HeroesPage />} />
            <Route path="/event-history" element={<EventHistoryPage />} />
          </Route>

          <Route path="/admin/players" element={<PlayersPage />} />
          <Route path="/admin/events" element={<EventManagementPage />} />
          <Route path="/admin/events/:eventId" element={<EventDetailPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />

          {/* Standalone route for event links opened from the sidebar, kept
              outside /admin so the admin nav never lights up for them. */}
          <Route path="/events/:eventId" element={<EventDetailPage />} />

          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}
