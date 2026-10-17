import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, Check, Circle } from 'lucide-react';
import { signUp, signIn, saveUser, forgotPassword, resetPassword } from '../authApi';
import logo from '../../assets/zenve-vet-logo.png';
import './authPage.css';
import './authExtra.css';

const emptyForm = { username: '', email: '', password: '', confirmPassword: '', code: '' };

function passwordRules(password) {
  return [
    { text: 'At least 8 characters', ok: password.length >= 8 },
    { text: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { text: 'One symbol, like @ # $ % !', ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

function Rules({ password }) {
  return (
    <ul className="au-rules">
      {passwordRules(password).map(rule => (
        <li key={rule.text} className={rule.ok ? 'au-rule au-rule-ok' : 'au-rule'}>
          {rule.ok ? <Check size={13} /> : <Circle size={13} />}
          {rule.text}
        </li>
      ))}
    </ul>
  );
}

function PasswordInput({ id, name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);

  return (
    <div className="auth-input">
      <Lock size={16} />
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="auth-eye"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

const titles = {
  signin: ['Sign in', 'Welcome back to Zenve Vet.'],
  signup: ['Create account', 'Join the Zenve Vet community.'],
  forgot: ['Forgot password', 'Enter your email and we will generate a reset code.'],
  reset: ['Reset password', 'Enter the reset code and choose a new password.'],
};

const buttonText = {
  signin: 'Sign in',
  signup: 'Create account',
  forgot: 'Send reset code',
  reset: 'Change password',
};

export default function AuthPage({ onLoggedIn }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = next => {
    setMode(next);
    setError('');
    setMessage('');
    setForm(emptyForm);
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'signup' || mode === 'reset') {
      if (!passwordRules(form.password).every(rule => rule.ok)) {
        setError('Password must have at least 8 characters, one uppercase letter and one symbol.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'forgot') {
        await forgotPassword({ email: form.email });
        setForm({ ...emptyForm, email: form.email });
        setMode('reset');
        setMessage('A reset code was generated. Check the server console and enter it below.');
      } else if (mode === 'reset') {
        await resetPassword({
          email: form.email,
          code: form.code,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        setForm({ ...emptyForm, email: form.email });
        setMode('signin');
        setMessage('Your password was changed. Please sign in.');
      } else {
        const user =
          mode === 'signup'
            ? await signUp(form)
            : await signIn({ email: form.email, password: form.password });
        saveUser(user);
        onLoggedIn(user);
      }
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <img className="auth-logo" src={logo} alt="Zenve Vet" />
        <h1>{titles[mode][0]}</h1>
        <p className="auth-sub">{titles[mode][1]}</p>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <div className="auth-field">
              <label htmlFor="au-username">Username</label>
              <div className="auth-input">
                <User size={16} />
                <input id="au-username" name="username" value={form.username} onChange={update} placeholder="Your username" />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="au-email">Gmail</label>
            <div className="auth-input">
              <Mail size={16} />
              <input id="au-email" name="email" type="email" value={form.email} onChange={update} placeholder="you@gmail.com" />
            </div>
          </div>

          {mode === 'reset' && (
            <div className="auth-field">
              <label htmlFor="au-code">Reset code</label>
              <div className="auth-input">
                <KeyRound size={16} />
                <input id="au-code" name="code" value={form.code} onChange={update} placeholder="6-digit code from the console" maxLength={6} />
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="auth-field">
              <label htmlFor="au-password">{mode === 'reset' ? 'New password' : 'Password'}</label>
              <PasswordInput
                id="au-password"
                name="password"
                value={form.password}
                onChange={update}
                placeholder={mode === 'signin' ? 'Your password' : 'At least 8 characters'}
              />
              {(mode === 'signup' || mode === 'reset') && <Rules password={form.password} />}
              {mode === 'signin' && (
                <button type="button" className="au-forgot" onClick={() => switchMode('forgot')}>
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {(mode === 'signup' || mode === 'reset') && (
            <div className="auth-field">
              <label htmlFor="au-confirm">Confirm password</label>
              <PasswordInput
                id="au-confirm"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={update}
                placeholder="Re-enter your password"
              />
            </div>
          )}

          {message && <p className="au-ok">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? 'Please wait...' : buttonText[mode]}
            <ArrowRight size={17} />
          </button>
        </form>

        {(mode === 'signin' || mode === 'signup') && (
          <p className="auth-switch">
            {mode === 'signup' ? 'Already have an account?' : 'New to Zenve Vet?'}{' '}
            <button type="button" onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}>
              {mode === 'signup' ? 'Sign in' : 'Create account'}
            </button>
          </p>
        )}

        {mode === 'forgot' && (
          <p className="auth-switch">
            Remember your password?{' '}
            <button type="button" onClick={() => switchMode('signin')}>
              Sign in
            </button>
          </p>
        )}

        {mode === 'reset' && (
          <p className="auth-switch">
            Did not get a code?{' '}
            <button type="button" onClick={() => switchMode('forgot')}>
              Send again
            </button>
          </p>
        )}
      </div>
    </div>
  );
}