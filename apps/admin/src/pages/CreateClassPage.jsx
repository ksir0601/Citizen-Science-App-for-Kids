import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClass } from '../classes.js';
import './CreateClassPage.css';

function validate(name, studentCount) {
    const errors = {};
    if (!name.trim()) errors.name = 'Give the class a name.';

    const count = Number(studentCount);
    if (studentCount !== '' && !(Number.isInteger(count) && count >= 1 && count <= 500)) {
        errors['student-count'] = 'Enter a whole number from 1 to 500, or leave it blank.';
    }
    return errors;
}

function FieldError({ errors, id }) {
    if (!errors[id]) return null;
    return <p role='alert' id={`${id}-error`}>{errors[id]}</p>;
}

function errorProps(errors, id) {
    return errors[id] ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {};
}

function CreateClassPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [studentCount, setStudentCount] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        setSubmitted(true);

        const found = validate(name, studentCount);
        const firstProblem = Object.keys(found)[0];
        if (firstProblem) return document.getElementById(firstProblem)?.focus();

        setSaving(true);
        const { data, error } = await createClass(name.trim(), studentCount === '' ? null : Number(studentCount));
        setSaving(false);

        if (error) return setError(error.message);
        navigate(`/classes/${data.id}`);
    }

    const errors = submitted ? validate(name, studentCount) : {};

    return (
        <div className='create-class-page'>
            <h1>New Class</h1>

            <form onSubmit={handleSubmit} noValidate>
                <label htmlFor='name'>Class Name</label>
                <small>For example, "Room 12 - 3rd Grade" or "5th Period Science".</small>
                <input
                    id='name'
                    required
                    {...errorProps(errors, 'name')}
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)} />
                <FieldError errors={errors} id='name' />

                <label htmlFor='student-count'>Number of Students</label>
                <small>Optional. Students never see this.</small>
                <input
                    id='student-count'
                    type='number'
                    min={1}
                    max={500}
                    {...errorProps(errors, 'student-count')}
                    value={studentCount}
                    onChange={(e) => setStudentCount(e.target.value)} />
                <FieldError errors={errors} id='student-count' />

                {error && <p role='alert'>{error}</p>}

                <button type='submit' disabled={saving}>{saving ? 'Creating Class...' : 'Create Class'}</button>
                <button type='button' onClick={() => navigate(-1)}>Cancel</button>
            </form>
        </div>
    );
}

export default CreateClassPage;
