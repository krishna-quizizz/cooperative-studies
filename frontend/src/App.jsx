import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopicSetup from './pages/TopicSetup';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentPanel from './pages/StudentPanel';
import { SessionProvider } from './context/SessionContext';

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<TopicSetup />} />
              <Route path="/teacher/session/:sessionId" element={<TeacherDashboard />} />
              <Route path="/student/session/:sessionId" element={<StudentPanel />} />
              <Route path="/student/session/:sessionId/table/:tableId" element={<StudentPanel />} />
            </Routes>
          </main>
        </div>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
