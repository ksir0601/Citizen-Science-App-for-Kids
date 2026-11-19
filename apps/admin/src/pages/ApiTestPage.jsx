import { useEffect, useState } from 'react';
import * as api from '../lib/api.js';

function ApiTestPage() {
    const [result, setResult] = useState('Loading...');

    useEffect(() => {
        api.getMyProjects().then(({ data, error }) => {
            if (error) setResult(`Error: ${error.message}`);
            else setResult(data.length + ' projects: ' + data.map((p) => p.name).join(', '));
        });
    }, []);

    return <h1>{result}</h1>;
}

export default ApiTestPage;
