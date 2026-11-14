import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../mock/mockApi.js';
import './NewProjectPage.css';

const questionTypes = [
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'number', label: 'Number' },
    { value: 'text', label: 'Text' },
];

// fyi key is not saved
function newQuestion() {
    return { key: crypto.randomUUID(), type: 'text', label: '', required: false, options: ['', ''] };
}

function validate(name, questions) {
    const errors = {};
    if (!name.trim()) errors.name = 'Give the project a name.';
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
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState(() => [newQuestion()]);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [created, setCreated] = useState(null);
    const [copied, setCopied] = useState(false);

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

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        // Errors are updated as the teacher fixes them
        setSubmitted(true);

        // Jumps to the first field with an error
        const found = validate(name, questions);
        const firstProblem = Object.keys(found)[0];
        if (firstProblem) return document.getElementById(firstProblem)?.focus();

        // Saves the project and its questions together. The project code is made automatically.
        setSaving(true);
        const { data: project, error } = await api.createProject(
            name.trim(),
            description.trim(),
            questions.map((q) => ({
                type: q.type,
                label: q.label.trim(),
                required: q.required,
                options: q.type === 'dropdown' ? q.options.map((o) => o.trim()).filter(Boolean) : null,
            })),
        );
        setSaving(false);

        if (error) return setError(error.message);
        setCreated({ id: project.id, projectCode: project.join_code });
    }

    async function copyProjectCode() {
        await navigator.clipboard.writeText(created.projectCode);
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

    if (created) {
        return (
            <div className ='new-project-page'>
                <h1>Project Created</h1>
                <p>Students join '{name.trim()}' in the app with this code:</p>
                <p className='join-code'>{created.projectCode}</p>

                <button type='button' onClick={copyProjectCode}>{copied ? 'Copied!' : 'Copy Project Code'}</button>
                <Link to={`/projects/${created.id}`}>View Project</Link>
                <button type='button' onClick={startOver}>Create Another Project</button>
            </div>
        )
    }

    const errors = submitted ? validate(name, questions) : {};

    return (
        <div className='new-project-page'>
            <h1>New Project</h1>

            <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor='name'>Project Name</label>
                    <input
                        id='name'
                        required
                        {...errorProps(errors, 'name')}
                        maxLength={100}
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
                                    maxLength={200}
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

                    {/* Errors from saving */}
                    {error && <p role='alert'>{error}</p>}

                    <button type='submit' disabled={saving}>{saving ? 'Creating Project...' : 'Create Project'}</button>
                    <button type='button' onClick={() => navigate(-1)}>Cancel</button>
            </form>
        </div>
    );
}

export default NewProjectPage;
