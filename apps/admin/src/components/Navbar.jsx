import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../Supabase';
import { useAuth } from '../useAuth';
import './Navbar.css'

function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loaded, setLoaded] = useState({ done: false, classes: [], error: '' });
    const [collapsed, setcollapsed] = useState({});

    // Assumes supabase has a 'classes' table linked to a 'projects' table, and that the 'projects table is linked to an 'observations' table
    // Assumes RLS is turned on in Supabase
    useEffect(() => {
        supabase
            .from('classes')
            .select('id, name, projects(id, name, observations(count))')
            .order('name')
            .then(({ data, error }) => setLoaded({ done: true, classes: data || [], error: error?.message || '' }));
    }, [location.pathname]);

    async function handleSignOut() {
        await signOut();
        navigate('/login', { replace: true });
    }

    return (
        <>
            <aside className="navbar">
                <h2>Your Classes</h2>
                <NavLink to='/new-project' className='new-project'>Add New project</NavLink>

                <nav>
                    {!loaded.done && <p>Loading...</p>}
                    {loaded.error && <p role='alert'>Couldn't load your classes.</p>}
                    {loaded.done && !loaded.error && loaded.classes.length === 0 && <p>You don't have any classes yet.</p>}
                    
                    {loaded.classes.map((c) => (
                        <section key={c.id}>
                            <div className="class-row">
                                <NavLink to={`/classes/${c.id}`}>{c.name}</NavLink>
                                    <button type="button"
                                     onClick={() => setcollapsed((s) => ({ ...s, [c.id]: !s[c.id] }))} 
                                     aria-label={collapsed[c.id] ? "Expand" : "Collapse"}>
                                     {collapsed[c.id] ? ">" : "v"}
                                    </button>
                            </div>

                            {!collapsed[c.id] &&
                            c.projects.map((p) => (
                                <NavLink key={p.id} to={`/classes/${c.id}/projects/${p.id}`} className="project">
                                    <span>{p.name}</span>
                                    <span>{p.entryCount}</span>
                                </NavLink>
                            ))}
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
