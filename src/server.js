require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const { configurePassport } = require('./config/passport');

const app = express();
const port = Number(process.env.PORT) || 3000;
const oauthConfigured = configurePassport();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'local-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60
  }
}));
app.use(passport.initialize());
app.use(passport.session());

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

app.get('/auth/google', (req, res, next) => {
  if (!oauthConfigured) {
    return res.status(503).send(renderMessage(
      'Google OAuth is not configured',
      'Copy .env.example to .env and add your Google Client ID and Client Secret before signing in.',
      '/'
    ));
  }

  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: '/?error=oauth_failed'
  })(req, res, () => res.redirect('/profile'));
});

app.get('/profile', requireAuth, (req, res) => {
  res.send(renderProfile(req.user));
});

app.get('/logout', (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy(() => res.redirect('/'));
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send(renderMessage(
    'Something went wrong',
    'We could not complete the request. Check the server terminal for details.',
    '/'
  ));
});

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));
}

function renderMessage(title, message, link) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title><link rel="stylesheet" href="/styles.css"></head>
<body><main class="shell"><section class="panel compact"><span class="eyebrow">Account access</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a class="text-link" href="${link}">Return to sign in</a></section></main></body></html>`;
}

function renderProfile(user) {
  const avatar = user.avatar
    ? `<img class="avatar" src="${escapeHtml(user.avatar)}" alt="${escapeHtml(user.displayName)} profile picture" referrerpolicy="no-referrer">`
    : '<div class="avatar avatar-fallback">G</div>';

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Your profile | Account access</title><link rel="stylesheet" href="/styles.css"></head>
<body><main class="shell"><section class="panel profile-panel dashboard-panel"><header class="dashboard-header"><div class="brand-lockup"><div class="brand-mark" aria-hidden="true">G</div><div><span class="eyebrow">Workspace overview</span><strong>Account center</strong></div></div><a class="button secondary" href="/logout">Sign out</a></header><div class="status-row"><span class="status-dot"></span><span>Authenticated with Google</span></div><div class="profile-identity">${avatar}<div class="profile-copy"><span class="eyebrow">Welcome back</span><h1>${escapeHtml(user.displayName)}</h1><p class="muted">${escapeHtml(user.email)}</p></div></div><div class="analytics-heading"><div><span class="eyebrow">Activity snapshot</span><h2>Your account at a glance</h2></div><span class="period-label">Last 30 days</span></div><div class="analytics-grid"><article class="metric-card"><span class="metric-label">Sessions</span><strong>24</strong><span class="metric-change positive">+18.4%</span></article><article class="metric-card"><span class="metric-label">Time active</span><strong>18h 42m</strong><span class="metric-change positive">+6.2%</span></article><article class="metric-card"><span class="metric-label">Security score</span><strong>98<span class="metric-unit">/100</span></strong><span class="metric-change neutral">Excellent</span></article></div><div class="profile-meta"><span>Session active</span><span>Passport.js</span></div></section></main></body></html>`;
}

app.listen(port, () => {
  console.log(`Account access running at http://localhost:${port}`);
  if (!oauthConfigured) {
    console.log('Google sign-in is not configured yet. Add credentials to .env to enable sign-in.');
  }
});