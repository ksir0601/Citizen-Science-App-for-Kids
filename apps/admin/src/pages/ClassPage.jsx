import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../Supabase';
import { useAuth } from '../useAuth';

// Minimal page needed for testing NewProjectPage
function ClassPage() {
    const { classId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [studentCount, setStudentCount] = useState('');
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();

        // Assumes supabse has a 'classes' table with 'teacher_id', 'name', 'student_count' columns
        const { data, error } = await supabase
            .from('classes')
            .insert({ teacher_id: user.id, name: name.trim(), student_count: Number(studentCount) })
            .select('id')
            .single();

        if (error) return setError(error.message);
        navigate(`/new-project?class=${data.id}`);
    }

    if (classId !== 'new') return <h1>Class</h1>;

    return (
        <form onSubmit={handleSubmit}>
            <h1>New Class</h1>

            <label htmlFor='name'>Class Name</label>
            <input id='name' required value={name} onChange={(e) => setName(e.target.value)} />

            <label htmlFor='student-count'>Number of Students</label>
            <input
                id='student-count'
                type='number'
                min={1}
                required
                value={studentCount}
                onChange={(e) => setStudentCount(e.target.value)} />

            {error && <p role='alert'>{error}</p>}
            <button type='submit'>Create Class</button>
        </form>
    );
}

export default ClassPage;
