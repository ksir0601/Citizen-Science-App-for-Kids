import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as api from '../lib/api.js';
import { loadProject, questionTypeLabels } from '../observations.js';
import './ProjectPage.css';

function ProjectPage() {
    const { projectID } = useParams();
    const [loaded, setLoaded] = useState({ id: null, project: null, questions: [], observations: [], error: '' });
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadProject(projectID).then((result) => setLoaded({ id: projectID, ...result }));
    }, [projectID]);

    // Closing a project stops students from joining it or adding observations
    async function toggleOpen() {
        setError('');
        const { data, error } = await api.setProjectOpen(projectID, !loaded.project.is_open);
        if (error) return setError(error.message);
        setLoaded((l) => ({ ...l, project: { ...data } }));
    }

    async function copyProjectCode() {
        await navigator.clipboard.writeText(loaded.project.join_code);
        setCopied(true);
    }

    if (loaded.id !== projectID) return <div className='project-page'>Loading...</div>;

    if (loaded.error) {
        return (
            <div className='project-page'>
                <p role='alert'>Couldn't load this project: {loaded.error}</p>
            </div>
        );
    }

    const { project, questions, observations } = loaded;
    if (!project) {
        return (
            <div className='project-page'>
                <h1>Project Not Found</h1>
                <p>This project doesn't exist, or it belongs to another teacher.</p>
                <Link to='/new-project'>Create a Project</Link>
            </div>
        );
    }

    return (
        <div className='project-page'>
            <header>
                <div>
                    <h1>{project.name}</h1>
                    {project.description && <p>{project.description}</p>}
                </div>
                <Link to={`/projects/${projectID}/results`}>View Results ({observations.length})</Link>
            </header>

            <section className='join'>
                <p>
                    Project Code: <strong>{project.join_code}</strong>{' '}
                    <button type='button' onClick={copyProjectCode}>{copied ? 'Copied!' : 'Copy'}</button>
                </p>
                <p>
                    {project.is_open
                        ? 'Open: students can join and add observations.'
                        : 'Closed: students can\'t join or add observations.'}{' '}
                    <button type='button' onClick={toggleOpen}>{project.is_open ? 'Close Project' : 'Reopen Project'}</button>
                </p>
                {error && <p role='alert'>{error}</p>}
            </section>

            <section>
                <h2>Questions</h2>
                <ol>
                    {questions.map((q) => (
                        <li key={q.id}>
                            <strong>{q.label}</strong>
                            <span>{questionTypeLabels[q.type]}{q.required && ' · Required'}</span>
                            {q.options && <span>Options: {q.options.join(', ')}</span>}
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}

export default ProjectPage;
