import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GuardianProvider } from './context/GuardianContext';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { ForensicReportsPage } from './pages/ForensicReportsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <GuardianProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<OverviewPage />} />
            <Route path="incidents" element={<IncidentHistoryPage />} />
            <Route path="incidents/:incidentId" element={<IncidentDetailPage />} />
            <Route path="guardian/:token" element={<IncidentDetailPage />} />
            <Route path="evidence" element={<EvidenceVaultPage />} />
            <Route path="reports" element={<ForensicReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </GuardianProvider>
  );
}

export default App;
