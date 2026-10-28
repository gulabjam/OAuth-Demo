# Google OAuth Account Access

A small Google OAuth 2.0 account access flow built with Express and Passport.js. It handles sign-in with Google, the OAuth callback, session creation, an authenticated profile, and sign-out.

## Prerequisites

- Node.js 18 or newer
- A Google Cloud project
- An OAuth 2.0 Web application client in Google Cloud Console

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file:

   ```bash
   copy .env.example .env
   ```

3. In Google Cloud Console, configure the OAuth consent screen and create a Web application OAuth client.

4. Add this exact authorized redirect URI to the client:

   ```text
   http://localhost:3000/auth/google/callback
   ```

5. Put the client values in `.env`:

   ```text
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   SESSION_SECRET=use-a-long-random-string
   ```

## Run

Start the application with automatic restart during development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and select **Continue with Google**.

For a normal start:

```bash
npm start
```

## Routes

- `/` - sign-in screen
- `/auth/google` - starts the Google OAuth redirect
- `/auth/google/callback` - receives the Google callback
- `/profile` - protected profile screen
- `/logout` - destroys the local session

## Sign-in flow

1. Open the sign-in page. The application does not collect a password.
2. Select **Continue with Google** and complete the consent step.
3. The profile page displays the identity returned by Google and the active Passport session.
4. Refresh the page to confirm the session, then select **Sign out**.

## Development limitations

This project uses `express-session`'s in-memory store so it can run without a database. It is intended for local use: sessions disappear when the process restarts and the store does not scale across multiple processes. Production deployments should use HTTPS, a persistent session store, a strong secret, and the correct deployed callback URL.

If Google reports a redirect URI error, compare the configured URI character-for-character with `GOOGLE_CALLBACK_URL` in `.env`. If sign-in is blocked by the consent screen, add the presenting Google account as a test user in the OAuth consent configuration.