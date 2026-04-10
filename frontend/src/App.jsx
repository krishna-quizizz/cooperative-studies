import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopicSetup from './pages/TopicSetup';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentPanel from './pages/StudentPanel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TopicSetup />} />
        <Route path="/teacher/session/:sessionId" element={<TeacherDashboard />} />
        <Route path="/student/session/:sessionId" element={<StudentPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
