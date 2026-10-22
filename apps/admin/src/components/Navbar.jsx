import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
/* import './Navbar.css'; waiting to be created */ 

// Placeholder for Supabase classes
const classes = []

function Navbar() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [collapsed, setcollapsed] = useState({});

    async function handleSignOut() {
        await signOut();
        navigate('/login', { replace: true });
    }

    return (
        <>
            <aside className="navbar">
                <h2>Your Classes</h2>

                <nav>
                    {classes.map((c) => (
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
