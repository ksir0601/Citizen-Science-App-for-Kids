import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, loadHome, studentNames } from '../observations.js';
import './HomePage.css';

// How many of the newest observations to list
const recentCount = 8;

// Shown to a teacher with no projects yet
function GettingStarted() {
    return (
        <section>
            <h2>Getting Started</h2>
            <ol className='steps'>
                <li>
                    <strong>Add a class.</strong>
                    <span>Classes keep your projects organized, like "Room 12 - 3rd Grade".</span>
                    <Link to='/classes/new'>Add a Class</Link>
                </li>
                <li>
                    <strong>Create a project.</strong>
                    <span>Give it a name, instructions for your students, and the questions they'll answer.</span>
                    <Link to='/new-project'>Create a Project</Link>
                </li>
                <li>
                    <strong>Share the project code.</strong>
                    <span>Every project gets a 6-letter code. Students type it into the app, with an optional nickname.</span>
                </li>
                <li>
                    <strong>Watch the results come in.</strong>
                    <span>Each observation shows up on the project's results page, with charts and a CSV download.</span>
                </li>
            </ol>
        </section>
    );
}

// The newest observations from all of the teacher's projects
function RecentObservations({ projects, observations }) {
    const names = Object.assign({}, ...projects.map((p) => (
        studentNames(observations.filter((o) => o.project_id === p.id))
    )));
    const projectNames = Object.fromEntries(projects.map((p) => [p.id, p.name]));

    return (
        <section>
            <h2>Recent Observations</h2>
            {observations.length === 0 ? (
                <p>No observations yet. They'll show up here once students submit them in the app.</p>
            ) : (
                <ul className='recent'>
                    {observations.slice(0, recentCount).map((o) => (
                        <li key={o.id}>
                            <Link to={`/projects/${o.project_id}/results`}>
                                <strong>{names[o.id]}</strong>
                                <span>{projectNames[o.project_id]}</span>
                                <time dateTime={o.observed_at}>{formatDate(o.observed_at)}</time>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function HomePage() {
    const [loaded, setLoaded] = useState(null);

    useEffect(() => {
        loadHome().then(setLoaded);
    }, []);

    if (!loaded) return <div className='home-page'>Loading...</div>;

    if (loaded.error) {
        return (
            <div className='home-page'>
                <p role='alert'>Couldn't load your projects: {loaded.error}</p>
            </div>
        );
    }

    const { projects, observations } = loaded;
    if (projects.length === 0) {
        return (
            <div className='home-page'>
                <h1>Welcome!</h1>
                <p>Here's how to get your class collecting data.</p>
                <GettingStarted />
            </div>
        );
    }

    const openCount = projects.filter((p) => p.is_open).length;
    const studentCount = new Set(observations.map((o) => o.created_by)).size;

    return (
        <div className='home-page'>
            <h1>Welcome Back!</h1>

            <dl>
                <div><dt>Open Projects</dt><dd>{openCount}</dd></div>
                <div><dt>Observations</dt><dd>{observations.length}</dd></div>
                <div><dt>Students</dt><dd>{studentCount}</dd></div>
            </dl>

            <RecentObservations projects={projects} observations={observations} />
        </div>
    );
}

export default HomePage;
