import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getClass } from '../classes.js';
import './ClassPage.css';

function ClassPage() {
    const { classID } = useParams();
    const [loaded, setLoaded] = useState({ id: null, classInfo: null, error: '' });

    useEffect(() => {
        getClass(classID).then(({ data, error }) => (
            setLoaded({ id: classID, classInfo: data, error: error?.message || '' })
        ));
    }, [classID]);

    if (loaded.id !== classID) return <div className='class-page'>Loading...</div>;

    if (loaded.error) {
        return (
            <div className='class-page'>
                <p role='alert'>Couldn't load this class: {loaded.error}</p>
            </div>
        );
    }

    const { classInfo } = loaded;
    if (!classInfo) {
        return (
            <div className='class-page'>
                <h1>Class Not Found</h1>
                <p>This class doesn't exist, or it belongs to another teacher.</p>
                <Link to='/classes/new'>Add a Class</Link>
            </div>
        );
    }

    return (
        <div className='class-page'>
            <header>
                <div>
                    <h1>{classInfo.name}</h1>
                    {classInfo.student_count && <p>{classInfo.student_count} students</p>}
                </div>
                <Link to={`/new-project?class=${classInfo.id}`}>Add New Project</Link>
            </header>

            <section>
                <h2>Projects</h2>
                {classInfo.projects.length === 0 ? (
                    <p>No projects in this class yet.</p>
                ) : (
                    <ul>
                        {classInfo.projects.map((p) => (
                            <li key={p.id}>
                                <Link to={`/projects/${p.id}`}>
                                    <strong>{p.name}</strong>
                                    <span>{p.is_open ? p.join_code : 'Closed'}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default ClassPage;
