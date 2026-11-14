import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import * as api from '../mock/mockApi.js';
import { useAuth } from '../useAuth';
import './Navbar.css'

// pending decision, may become a stretch goal.
// The navbar lists the teacher's classes. To see the projects, teachers click on
//  a class. Then the navbar displays all the projects for that class.
async function getMyClasses() {
    if (!api.classes) return { data: null, error: { message: 'Classes not found.'} };

    const teacherId = api.teachers[0].id;
    const data = api.classes
        .filter((c) => c.teacher_id === teacherId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({ ...c, projects: api.projects.filter((p) => p.class_id === c.id) }));

    return { data, error: null };
}

function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loaded, setLoaded] = useState({ done: false, classes: [], error: '' });
    const [openClassId, setOpenClassId] = useState(null);

    // Reloads on every page change so a newly created project shows up
    useEffect(() => {
        api.getMyClasses()
            .then(({ data, error }) => setLoaded({ done: true, classes: data || [], error: error?.message || '' }));
    }, [location.pathname]);

    async function handleSignOut() {
        await signOut();
        navigate('/login', { replace: true });
    }

    function toggleClass(classId) {
        setOpenClassId((current) => (current === classId ? null : classId));
    }

    return (
        <>
            <aside className="navbar">
                <h2>Your Classes</h2>
                <NavLink to='/new-project' className='new-project'>Add New Project</NavLink>

                <nav>
                    {!loaded.done && <p>Loading...</p>}
                    {loaded.error && <p role='alert'>{loaded.error}</p>}
                    {loaded.done && !loaded.error && loaded.classes.length === 0 && <p>You don't have any classes yet.</p>}

                    {loaded.classes.map((c) => (
                        <section key={c.id}>
                            <button
                                type="button"
                                className="class-row"
                                aria-expanded={openClassId === c.id}
                                onClick={() => toggleClass(c.id)}>
                                <span>{c.name}</span>
                                <span aria-hidden="true">{openClassId === c.id ? 'v' : '>'}</span>
                            </button>

                            {openClassId === c.id && (
                                c.projects.length === 0
                                    ? <p>No projects yet.</p>
                                    : c.projects.map((p) => (
                                        <NavLink key={p.id} to={`/projects/${p.id}`} className="project">
                                            <span>{p.name}</span>
                                            <span>{p.is_open ? p.join_code : 'Closed'}</span>
                                        </NavLink>
                                    ))
                            )}
                        </section>
                    ))}
                </nav>

                <footer>
                    <span>{user?.email}</span>
                    <button type="button" onClick={handleSignOut}>Sign Out</button>
                </footer>
            </aside>

            <main>
                <Outlet />
            </main>
        </>
    );
}

export default Navbar;
