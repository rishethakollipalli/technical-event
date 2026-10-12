import { supabase } from './supabase-client.js';
import {
  signIn, signUp, signOut, sendPasswordReset,
  getCurrentSession, onAuthStateChange
} from './auth.js';
import { isSupabaseConfigured } from './supabase-client.js';
import { getRoleLabel, normalizeRole,renderRoleDashboard } from './router.js';


const $ = (selector) => document.querySelector(selector);
const authView = $('#auth-view');
const workspaceView = $('#workspace-view');
const form = $('#auth-form');
const message = $('#auth-message');
const submitButton = $('#auth-submit');
const submitLabel = $('#auth-submit-label');
let mode = 'signin';

function setMessage(text, type = 'error') {
  message.textContent = text;
  message.classList.toggle('success', type === 'success');
}

function setBusy(busy) {
  submitButton.disabled = busy;
  submitLabel.textContent = busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account';
}

function setMode(nextMode) {
  mode = nextMode;
  const signingIn = mode === 'signin';
  $('#signin-tab').classList.toggle('active', signingIn);
  $('#signup-tab').classList.toggle('active', !signingIn);
  $('#signin-tab').setAttribute('aria-pressed', String(signingIn));
  $('#signup-tab').setAttribute('aria-pressed', String(!signingIn));
  $('#auth-heading').textContent = signingIn ? 'Sign in to your portal' : 'Create your account';
  $('#auth-subheading').textContent = signingIn
    ? 'Use your registered email to continue to your workspace.'
    : 'Register with your email. Your dashboard role must be assigned by the event team.';
  $('#password').autocomplete = signingIn ? 'current-password' : 'new-password';
  $('#reset-password').classList.toggle('hidden', !signingIn);
  submitLabel.textContent = signingIn ? 'Sign in' : 'Create account';
  setMessage('');
}

function showAuth() {
  authView.classList.remove('hidden');
  workspaceView.classList.add('hidden');
}

function showWorkspace(user) {
import { renderStudentDashboard } from "./dashboards/student.js";
import { renderProctorDashboard } from "./dashboards/proctor.js";
import { renderEventInChargeDashboard } from "./dashboards/event-in-charge.js";

export const ROLE_LABELS = {
  student: "Student",
  proctor: "Proctor",
  event_in_charge: "Event In-Charge"
};

export function normalizeRole(role) {
  return ROLE_LABELS[role] ? role : null;
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? "Role not assigned";
}

export async function renderRoleDashboard(role, workspace, user) {
  const normalizedRole = normalizeRole(role);

  if (!normalizedRole) {
    workspace.textContent =
      "Your role has not been assigned. Please contact the event team.";
    return;
  }

  switch (normalizedRole) {
    case "student":
      await renderStudentDashboard(workspace, user);
      break;

    case "proctor":
      await renderProctorDashboard(workspace, user);
      break;

    case "event_in_charge":
      await renderEventInChargeDashboard(workspace, user);
      break;

    default:
      workspace.textContent = "Dashboard unavailable.";
  }
}
}

function showConfigNotice() {
  setMessage('Setup required: add your Supabase Project URL and publishable key in assets/js/config.js, then reload this page.');
}

$('#signin-tab').addEventListener('click', () => setMode('signin'));
$('#signup-tab').addEventListener('click', () => setMode('signup'));

$('#toggle-password').addEventListener('click', () => {
  const input = $('#password');
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  $('#toggle-password').textContent = showing ? 'Show' : 'Hide';
  $('#toggle-password').setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setMessage('');
  if (!isSupabaseConfigured()) {
    showConfigNotice();
    return;
  }

  const email = $('#email').value.trim();
  const password = $('#password').value;
  if (!email || !password) {
    setMessage('Enter your email address and password.');
    return;
  }
  if (password.length < 8) {
    setMessage('Your password must contain at least 8 characters.');
    return;
  }

  setBusy(true);
  try {
    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.error) throw result.error;

    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email for a confirmation link before signing in.', 'success');
    } else if (result.data.user) {
      showWorkspace(result.data.user);
    }
  } catch (error) {
    setMessage(error.message || 'Authentication failed. Please try again.');
  } finally {
    setBusy(false);
  }
});

$('#reset-password').addEventListener('click', async () => {
  setMessage('');
  if (!isSupabaseConfigured()) {
    showConfigNotice();
    return;
  }
  const email = $('#email').value.trim();
  if (!email) {
    setMessage('Enter your email address first, then choose Forgot password.');
    $('#email').focus();
    return;
  }
  try {
    const { error } = await sendPasswordReset(email);
    if (error) throw error;
    setMessage('If an account exists for this address, a password-reset email has been sent.', 'success');
  } catch (error) {
    setMessage(error.message || 'Could not request a password reset.');
  }
});

$('#signout-button').addEventListener('click', async () => {
  const status = $('#workspace-message');
  status.textContent = '';
  try {
    const { error } = await signOut();
    if (error) throw error;
    showAuth();
  } catch (error) {
    status.textContent = error.message || 'Could not sign out.';
  }
});

async function initialize() {
  if (!isSupabaseConfigured()) {
    showConfigNotice();
    return;
  }
  try {
    const { data, error } = await getCurrentSession();
    if (error) throw error;
    if (data.session?.user) showWorkspace(data.session.user);
  } catch (error) {
    setMessage(error.message || 'Could not check your session.');
  }
  onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) showAuth();
    else showWorkspace(session.user);
  });
}

setMode('signin');
initialize();
