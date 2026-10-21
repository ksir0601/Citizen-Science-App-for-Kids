import { Route, Routes } from 'react-router-dom';
import { RequireAdmin } from './AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ClassPage from './pages/ClassPage';
import ProjectPage from './pages/ProjectPage';
import NewProjectPage from './pages/NewProjectPage';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                element={
                    <RequireAdmin>
                        <Navbar />
                    </RequireAdmin>
                }
            >
                <Route index element={<HomePage />} />
                <Route path="classes/:classId" element={<ClassPage />} />
                <Route path="classes/:classId/projects/:projectID" element={<ProjectPage />} />
                <Route path="new-project" element={<NewProjectPage />} />
            </Route>
        </Routes>
    );
}

export default App;
