import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../Supabase';
import { useAuth} from '../useAuth';
import './NewProjectPage.css';

const questionTypes = [
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'number', label: 'Number' },
    { value: 'text', label: 'Text' },
];

// 0/O and 1/I left out for clarity
const codeChars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';

function makeProjectCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(6));
    return Array.from(bytes, (b) => codeChars[b % codeChars.length]).join('');
}

// fyi key is not saved
function newQuestion() {
    return { key: crypto.randomUUID(), type: 'text', label: '', required: false, optios: ['', ''] };
}

function validate(classId, name, projectCode, questions) {
    const errors = [];
    if (!classId) errors.class = 'Choose a class.';
    if (!name.trim()) errors.name = 'Give the project a name.';
    if (projectCode !== null && !/^[A-Za-z0-9]{4,20}$/.test(projectCode.trim())) {
        errors['project-code'] = 'The project code can only include letters and numbers and must be between 4 and 20 characters long.';
    }

    if (questions.length === 0) errors['add-question'] = 'Add at least one question';

    questions.forEach((q) => {
        if (!q.label.trim()) errors[`label-${q.key}`] = 'Give this question a label.';
        if (q.type === 'dropdown' && q.options.filter((o) => o.trim()).length < 2) {
            errors[`option-${q.key}-0`] = 'Dropdowns need at least two options.';
        }
    });
    return errors;
}

// Shows the error message under the corresponding field
function FieldError({ errors, id }) {
    if (!errors[id]) return null;
    return <p role='alert' id={`${id}-error`}>{errors[id]}</p>;
}

function errorProps(errors, id) {
    return errors[id] ? { 'aria-invalid': true, 'aria-describedby' : `${id}-error` } : {};
}

function NewProjectPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loaded, setLoaded] = useState({ done: false, classes: [], error: '' });
    const [classId, setClassId] = useState(searchParams.get('class') || '');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState(() => [newQuestion()]);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [created, setCreated] = useState(null);
    const [copied, setCopied] = useState(false);

    // Assumes Supabase has a 'classes' table with 'id', 'name' columns
    // Assumes RLS is turned on in Supabase
    useEffect(() => {
        supabase
            .from('classes')
            .select('id, name')
            .order('name')
            .then(({ data, error }) => setLoaded({ done: true, classes: data || [], error: error?.message || '' }));
    }, []);

    function updateQuestion(key, changes) {
        setQuestions((list) => list.map((q) => (q.key === key ? { ...q, ...changes } : q)));
    }

    function removeQuestion(key) {
        setQuestions((list) => list.filter((q) => q.key !== key));
    }

    function moveQuestion(index, direction) {
        setQuestions((list) => {
            const next = [...list];
            [next[index], next[index + direction]] = [next[index + direction], next[index]];
            return next;
        });
    }

    function updateOption(q, index, text) {
        updateQuestion(q.key, { options: q.options.map((o, i) => (i === index ? text : o)) });
    }

    function removeOption(q, index) {
        updateQuestion(q.key, { options: q.options.filter((o, i) => i !== index) });
    }

    // Assumes supbase has a 'projects' table with 'class_id', 'teacher_id', 'name', 'description', and 'project_code' columns.
    // Assumes supabase has an auto-generated 'id' column
    // Assumes 'project-code' column is UNIQUE
    async function insertProject() {
        for (let attempt = 0; attempt < 5; attempt++) {
            const result = await supabase
                .from('projects')
                .insert({
                    class_id: classId,
                    teacher_id: user.id,
                    name: name.trim(),
                    description: description.trim(),
                    project_code: makeProjectCode(),
                })
                .select('id, project_code')
                .single();
            
                // 23505 is the supabase/postgreSQL error code for a Project Code being taken
            if (result.error?.code !== '23505') return result;
        }
        return { data: null, error: { message: 'Couldn\'t make a unique Project Code. Please try again.'} };
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // Errors are updated as the teacher fixes them
        setSubmitted(true);

        // Jumps to the first field with an error
        const found = validate(classId, name, questions);
        const firstProblem = Object.keys(found)[0];
        if (firstProblem) return document.getElementById(firstProblem)?.focus();

        setSaving(true);
        try {
            const { data: project, error } = await insertProject();
            if (error) return setError(error.message);

            // Assumes supabase has a 'questions' table with 'project_id', 'position', 'type', 'label', 'required', 'options' columns and that 'options' is a text array that is only used by dropdowns
            const { error: questionsError } = await supabase.from('questions').insert(
                questions.map((q, i) => ({
                    project_id: project.id,
                    position: i,
                    type: q.type,
                    label: q.label.trim(),
                    required: q.required,
                    options: q.type === 'dropdown' ? q.options.map((o) => o.trim()).filter(Boolean) : null,
                })),
            );

            // Prevents a project being saved with no questions, in the event that a project is successfully saved but the questions are not
            if (questionsError) {
                await supabase.from('projects').delete().eq('id', project.id);
                return setError(questionsError.message);
            }

            setCreated({ id: project.id, projectCode: project.project_code });
        } finally {
            setSaving(false);
        }
    }

    async function copyProjectcode() {
        await navigator.clipboard.writeText(created.projectcode);
        setCopied(true);
    }

    function startOver() {
        setCreated(null);
        setCopied(false);
        setName('');
        setDescription('');
        setQuestions([newQuestion()]);
        setSubmitted(false);
    }

    if (!loaded.done) return <div className='new-project-page'>Loading...</div>;

    if (loaded.error) {
        return (
            <div className='new-project-page'>
                <p role='alert'>Couldn't load your classes: {loaded.error}</p>
            </div>
        );
    }

    if (loaded.classes.length === 0) {
        return (
            <div className='new-project-page'>
                <h1>New Project</h1>
                <p>Add a class before creating a project.</p>
                <Link to='/classes/new'>Add a Class</Link>
            </div>
        );
    }

    if (created) {
        return (
            <div className ='new-project-page'>
                <h1>Project Created</h1>
                <p>Students join '{name.trim()}' in the app with this code:</p>
                <p className='join-code'>{created.joinCode}</p>

                <button type='button' onClick={copyProjectcode}>{copied ? 'Copied!' : 'Copy Project Code'}</button>
                <Link to={`/classes/${classId}/projects/${created.id}`}>View Project</Link>
                <button type='button' onClick={startOver}>Create Another Project</button>
            </div>
        )
    }

    const errors = submitted ? validate(classId, name, questions) : {};

    return (
        <div className='new-project-page'>
            <h1>New Project</h1>

            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor='class'>Class</label>
                <select
                    id='class'
                    required
                    {...errorProps(errors, 'class')}
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}>
                    <option value='' disabled>Choose a class</option>
                    {loaded.classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    </select>
                    <FieldError errors={errors} id='class' />

                    <label htmlFor='name'>Project Name</label>
                    <input
                        id='name'
                        required
                        {...errorProps(errors, 'name')}
                        maxLength={80}
                        value={name}
                        onChange={(e) => setName(e.target.value)} />
                    <FieldError errors={errors} id='name' />

                    <label htmlFor='description'>Description</label>
                    <small>Students read this in the app.</small>
                    <textarea
                        id='description'
                        maxLength={300}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)} />

                    <fieldset>
                        <legend>Questions</legend>

                        {questions.map((q, i) => (
                            <section key={q.key}>
                                <h2>Question {i + 1}</h2>

                                <label htmlFor={`label-${q.key}`}>Label</label>
                                <input
                                    id={`label-${q.key}`}
                                    required
                                    {...errorProps(errors, `label-${q.key}`)}
                                    value={q.label}
                                    onChange={(e) => updateQuestion(q.key, { label: e.target.value })} />
                                <FieldError errors={errors} id={`label-${q.key}`} />

                                <label htmlFor={`type-${q.key}`}>Type</label>
                                <select
                                    id={`type-${q.key}`}
                                    value={q.type}
                                    onChange={(e) => updateQuestion(q.key, { type: e.target.value })}>
                                    {questionTypes.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                    </select>

                                    <label>
                                        <input
                                            type='checkbox'
                                            checked={q.required}
                                            onChange={(e) => updateQuestion(q.key, { required: e.target.checked })} />
                                        Required
                                    </label>

                                    {q.type === 'dropdown' && (
                                        <div className='options'>
                                            {q.options.map((o, j) => (
                                                <div key={j}>
                                                    <input
                                                        id={`option-${q.key}-${j}`}
                                                        {...(j === 0 ? errorProps(errors, `option-${q.key}-0`) : {})}
                                                        aria-label={`Question ${i + 1} option ${j + 1}`}
                                                        value={o}
                                                        onChange={(e) => updateOption(q, j, e.target.value)} />
                                                    
                                                    <button
                                                        type='button'
                                                        onClick={() => removeOption(q, j)}
                                                        disabled={q.options.length <= 2}>
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}

                                            <FieldError errors={errors} id={`option-${q.key}-0`} />
                                            <button type='button' onClick={() => updateQuestion(q.key, { options: [...q.options, ''] })}>
                                                Add Option
                                            </button>
                                        </div>
                                    )}

                                    <div className='question-actions'>
                                        <button type='button' onClick={() => moveQuestion(i, -1)} disabled={i === 0}>Move Up</button>
                                        <button type='button' onClick={() => moveQuestion(i, 1)} disabled={i === questions.length - 1}>Move Down</button>
                                        <button type='button' onClick={() => removeQuestion(q.key)}>Remove Question</button>
                                    </div>
                            </section>
                        ))}

                        <FieldError errors={errors} id='add-question' />
                        <button
                            id='add-question'
                            type='button'
                            {...errorProps(errors, 'add-question')}
                            onClick={() => setQuestions((list) => [...list, newQuestion()])}>
                            Add Question
                            </button>
                    </fieldset>

                    {/* Errors from Supabase */}
                    {error && <p role='alert'>{error}</p>}

                    <button type='submit' disabled={saving}>{saving ? 'Creating Project...' : 'Create Project'}</button>
                    <button type='button' onClick={() => navigate(-1)}>Cancel</button>
            </form>
        </div>
    );
}

export default NewProjectPage;
