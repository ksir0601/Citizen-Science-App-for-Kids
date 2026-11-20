import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatAnswer, formatDate, isBlank, loadProject, questionTypeLabels, studentNames } from '../observations.js';
import './ResultsPage.css';

// Wraps a value in quotes so commas and quotes inside it don't break the CSV
function csvCell(value) {
    return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadCsv(project, questions, observations, names) {
    const header = ['Student', 'Observed', ...questions.map((q) => q.label)];
    const rows = observations.map((o) => [
        names[o.id],
        o.observed_at,
        ...questions.map((q) => formatAnswer(q, o.answers[q.id], '')),
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `${project.name}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

function countBars(question, answers) {
    if (question.type === 'checkbox') {
        const yes = answers.filter((a) => a).length;
        return [{ label: 'Yes', count: yes }, { label: 'No', count: answers.length - yes }];
    }

    const options = question.options || [];
    const bars = options.map((option) => ({ label: option, count: answers.filter((a) => a === option).length }));
    const other = answers.filter((a) => !options.includes(a)).length;
    
    if (other > 0) bars.push({ label: 'Other', count: other });
    return bars;
}

function Bars({ bars, total }) {
    return (
        <ul className='bars'>
            {bars.map((b) => {
                const percent = total ? Math.round((b.count / total) * 100) : 0;
                return (
                    <li key={b.label}>
                        <span>{b.label}</span>
                        <span className='bar' style={{ '--share': `${percent}%` }} aria-hidden='true' />
                        <span>{b.count} ({percent}%)</span>
                    </li>
                );
            })}
        </ul>
    );
}

function NumberStats({ answers }) {
    const numbers = answers.map(Number).filter(Number.isFinite);
    if (numbers.length === 0) return null;

    const total = numbers.reduce((sum, n) => sum + n, 0);
    return (
        <dl>
            <div><dt>Average</dt><dd>{Math.round((total / numbers.length) * 10) / 10}</dd></div>
            <div><dt>Lowest</dt><dd>{Math.min(...numbers)}</dd></div>
            <div><dt>Highest</dt><dd>{Math.max(...numbers)}</dd></div>
            <div><dt>Total</dt><dd>{total}</dd></div>
        </dl>
    );
}

function TextAnswers({ question, observations, names }) {
    return (
        <ul className='responses'>
            {observations.map((o) => (
                <li key={o.id}>
                    <strong>{names[o.id]}</strong>
                    <span>{o.answers[question.id]}</span>
                </li>
            ))}
        </ul>
    );
}

function QuestionResults({ question, number, observations, names }) {
    const answered = observations.filter((o) => !isBlank(o.answers[question.id]));
    const answers = answered.map((o) => o.answers[question.id]);
    const skipped = observations.length - answered.length;

    return (
        <section>
            <h2>{number}. {question.label}</h2>
            <p>
                {questionTypeLabels[question.type]} · {answered.length} answered
                {skipped > 0 && `, ${skipped} skipped`}
            </p>

            {answered.length === 0 && <p>No one has answered this question yet.</p>}
            {answered.length > 0 && (question.type === 'checkbox' || question.type === 'dropdown') && (
                <Bars bars={countBars(question, answers)} total={answered.length} />
            )}
            {answered.length > 0 && question.type === 'number' && <NumberStats answers={answers} />}
            {answered.length > 0 && question.type === 'text' && (
                <TextAnswers question={question} observations={answered} names={names} />
            )}
        </section>
    );
}

function ObservationsTable({ questions, observations, names }) {
    const [search, setSearch] = useState('');
    const [date, setDate] = useState('');

    const query = search.trim().toLowerCase();
    const shown = observations
        .filter((o) => !date || o.observed_at.startsWith(date))
        .filter((o) => !query || [names[o.id], ...questions.map((q) => formatAnswer(q, o.answers[q.id], ''))]
            .some((text) => text.toLowerCase().includes(query)));

    return (
        <section className='observations'>
            <div className='toolbar'>
                <h2>Observations</h2>
                <input
                    type='search'
                    placeholder='Search observations...'
                    aria-label='Search observations'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                <input
                    type='date'
                    aria-label='Filter by date'
                    value={date}
                    onChange={(e) => setDate(e.target.value)} />
                {date && <button type='button' onClick={() => setDate('')}>All Dates</button>}
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Observed</th>
                        {questions.map((q) => <th key={q.id}>{q.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {shown.map((o) => (
                        <tr key={o.id}>
                            <td>{names[o.id]}</td>
                            <td><time dateTime={o.observed_at}>{formatDate(o.observed_at)}</time></td>
                            {questions.map((q) => <td key={q.id}>{formatAnswer(q, o.answers[q.id], '—')}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>

            <footer>
                {shown.length === observations.length
                    ? `Showing all ${observations.length} observations`
                    : `Showing ${shown.length} of ${observations.length} observations`}
            </footer>
        </section>
    );
}

function ResultsPage() {
    const { projectID } = useParams();
    const [loaded, setLoaded] = useState({ id: null, project: null, questions: [], observations: [], error: '' });

    useEffect(() => {
        loadProject(projectID).then((result) => setLoaded({ id: projectID, ...result }));
    }, [projectID]);

    if (loaded.id !== projectID) return <div className='results-page'>Loading...</div>;

    if (loaded.error) {
        return (
            <div className='results-page'>
                <p role='alert'>Couldn't load these results: {loaded.error}</p>
            </div>
        );
    }

    const { project, questions, observations } = loaded;
    if (!project) {
        return (
            <div className='results-page'>
                <h1>Project Not Found</h1>
                <p>This project doesn't exist, or it belongs to another teacher.</p>
            </div>
        );
    }

    const names = studentNames(observations);
    const studentCount = new Set(observations.map((o) => o.created_by)).size;
    const newest = observations[0];
    const oldest = observations[observations.length - 1];

    return (
        <div className='results-page'>
            <Link to={`/projects/${projectID}`}>← Back to Project</Link>

            <header>
                <div>
                    <h1>{project.name} Results</h1>
                    {observations.length > 0 && (
                        <p>
                            {formatDate(oldest.observed_at)}
                            {newest !== oldest && ` to ${formatDate(newest.observed_at)}`}
                        </p>
                    )}
                </div>
                <button
                    type='button'
                    onClick={() => downloadCsv(project, questions, observations, names)}
                    disabled={observations.length === 0}>
                    Download CSV
                </button>
            </header>

            <dl>
                <div><dt>Observations</dt><dd>{observations.length}</dd></div>
                <div><dt>Students</dt><dd>{studentCount}</dd></div>
                <div><dt>Questions</dt><dd>{questions.length}</dd></div>
            </dl>

            {observations.length === 0 ? (
                <p>No observations yet. Results will show up here once students submit them in the app.</p>
            ) : (
                <>
                    <h2 className='heading'>Charts</h2>
                    {questions.map((q, i) => (
                        <QuestionResults key={q.id} question={q} number={i + 1} observations={observations} names={names} />
                    ))}

                    <ObservationsTable questions={questions} observations={observations} names={names} />
                </>
            )}
        </div>
    );
}

export default ResultsPage;
