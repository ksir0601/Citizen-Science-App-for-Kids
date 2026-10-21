import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../Supabase';
import { isAdmin } from '../AuthContext';
// import './LoginPage.css'; needs to be created

function resetLink() {
    return window.location.hash.includes('type=recovery');
}

const titles = {
    login: 'Admin Login',
    signup: 'Create Account',
    forgot: 'Reset Password',
    reset: 'Set New Password',
};

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const [mode, setMode] = useState(resetLink() ? 'reset' : 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') switchMode('reset');
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session && isAdmin(session.user) && !resetLink()) {
                navigate(from, { replace: true });
            }
            setCheckingSession(false);
        });

        return () => subscription.unsubscribe();
    }, [navigate, from]);

    function switchMode(next) {
        setMode(next);
        setError('');
        setMessage('');
        setPassword('');
        setConfirmPassword('');
    }

    async function handleLogin() {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) return setError(error.message);

        if (!isAdmin(data.user)) {
            await supabase.auth.signOut();
            return setError('Only teacher accounts can sign in here.');
        }
        navigate(from, { replace: true });
    }

    async function handleSignup() {
        if (password !== confirmPassword) return setError('Passwords do not match.');

        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { 
                emailRedirectTo: window.location.origin,
                data: { account_type: 'teacher'},
            },
        });
        if (error) return setError(error.message);

        // Email confirmation off: they're signed in already, go straight in.
        if (data.session) return navigate(from, { replace: true });

        // Email confirmation on: they need to click the link first.
        switchMode('login');
        setMessage('Check your email to confirm your account, then sign in.');
    }

    async function handleForgotPassword() {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin + '/login',
        });

        if (error) return setError(error.message);
        setMessage('If an account exists for that email, a reset link has been sent.');
    }

    async function handleResetPassword() {
        if (password !== confirmPassword) return setError('Passwords do not match.');

        const { error } = await supabase.auth.updateUser({ password });

        if (error) return setError(error.message);

        // Erase the recovery token from the URL, redirect back to the login page
        window.history.replaceState(null, '', window.location.pathname);
        await supabase.auth.signOut();
        switchMode('login');
        setMessage('Password updated.');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setMessage('');

        setLoading(true);
        try {
            if (mode === 'login') await handleLogin();
            if (mode === 'signup') await handleSignup();
            if (mode === 'forgot') await handleForgotPassword();
            if (mode === 'reset') await handleResetPassword();
        } finally {
            setLoading(false);
        }
    }

    if (checkingSession) {
        return <div className='login-page'>Loading...</div>;
    }

    const showEmail = mode !== 'reset';
    const showPassword = mode !== 'forgot';
    const showConfirm = mode === 'signup' || mode === 'reset';

    const buttonText = {
        login: loading ? 'Signing In...' : 'Sign In',
        signup: loading ? 'Creating Account...' : 'Sign Up',
        forgot: loading ? 'Sending Reset Link...' : 'Send Reset Link',
        reset: loading ? 'Saving...' : 'Update Password',
    }[mode];

    return (
        <div className='login-page'>
            <form onSubmit={handleSubmit}>
                <h1>{titles[mode]}</h1>

                {mode === 'forgot' && (
                    <p>Enter your email to receive a link to reset your password.</p>
                )}

                {showEmail && (
                    <>
                        <label htmlFor='email'>Email</label>
                        <input
                            id='email'
                            type='email'
                            autoComplete='email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                    </>
                )}

                {showPassword && (
                    <>
                        <label htmlFor='password'>{mode === 'reset' ? 'New Password' : 'Password'}</label>
                        <input
                            id='password'
                            type='password'
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                    </>
                )}

                {mode === 'login' && (
                    <button type='button' onClick={() => switchMode('forgot')}>Forgot Password?</button>
                )}

                {showConfirm && (
                    <>
                        <label htmlFor='confirm'>Confirm Password</label>
                        <input
                            id='confirm'
                            type='password'
                            autoComplete='new-password'
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} />
                    </>
                )}

                {error && <p role='alert'>{error}</p>}
                {message && <p role='status'>{message}</p>}

                <button type='submit' disabled={loading}>{buttonText}</button>

                <footer>
                    {mode === 'login' && (
                        <>
                            First time here?{' '}
                            <button type='button' onClick={() => switchMode('signup')}>Sign Up</button>
                        </>
                    )}

                    {(mode === 'signup' || mode === 'forgot') && (
                        <button type='button' onClick={() => switchMode('login')}>Back to Sign In</button>
                    )}
                </footer>
            </form>
        </div>
    );
}

export default LoginPage;
