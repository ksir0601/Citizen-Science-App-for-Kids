import { Route, Routes } from 'react-router-dom';
import { RequireAdmin } from './AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ClassPage from './pages/ClassPage';
import CreateClassPage from './pages/CreateClassPage';
import ProjectPage from './pages/ProjectPage';
import NewProjectPage from './pages/NewProjectPage';
import ResultsPage from './pages/ResultsPage';

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
                <Route path="classes/new" element={<CreateClassPage />} />
                <Route path="classes/:classID" element={<ClassPage />} />
                <Route path="projects/:projectID" element={<ProjectPage />} />
                <Route path="projects/:projectID/results" element={<ResultsPage />} />
                <Route path="new-project" element={<NewProjectPage />} />
            </Route>
        </Routes>
    );
}

export default App;
