import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppProvider } from './contexts/AppContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { createAppTheme } from './theme';
import { useAppContext } from './contexts/AppContext';
import './i18n';

// Lazy load pages for better performance
const DashboardPage = lazy(() =>
  import('./features/dashboard').then((module) => ({
    default: module.DashboardPage,
  }))
);
const MembersPage = lazy(() =>
  import('./features/members').then((module) => ({
    default: module.MembersPage,
  }))
);
const TeamsPage = lazy(() =>
  import('./features/teams').then((module) => ({
    default: module.TeamsPage,
  }))
);
const StatisticsPage = lazy(() =>
  import('./features/dashboard').then((module) => ({
    default: module.StatisticsPage,
  }))
);

/**
 * Theme wrapper component that accesses context
 */
const ThemedApp: React.FC = () => {
  const { state } = useAppContext();
  const theme = createAppTheme(state.darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </Router>
    </ThemeProvider>
  );
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <ThemedApp />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
