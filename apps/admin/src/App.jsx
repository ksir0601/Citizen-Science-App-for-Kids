import { useCallback } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { RequireAdmin } from './auth';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ClassPage from './pages/ClassPage';
import ProjectPage from './pages/ProjectPage';
import NewProjectPage from './pages/NewProjectPage';

function App() {
    return (
        <main>
            <Routes>
                <Route path="/login" element={<LoginPage/>} />
                
                <Route element={
                    <RequireAdmin>
                        <NavBar/>
                    </RequireAdmin>
                }>
                
                <Route index element={<HomePage/>} />
                <Route path="classes/:classId" element={<ClassPage/>} />
                <Route path="clases/:classId/projects/:projectID" element={<ProjectPage/>} />
                <Route path="/new-project" element={<NewProjectPage/>} />
                </Route>
            </Routes>
        </main>
    );
}

export default App;
