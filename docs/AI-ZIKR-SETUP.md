# Zikr AI API

The `/api/chat` Vercel function creates a private, context-aware dhikr planning
conversation. It only adds built-in dhikr phrases to schedules and does not
provide religious rulings or source verification.

## Production setup

1. Deploy the repository to Vercel with the repository root as the project root.
   `vercel.json` publishes `public/` and gives the chat function up to 60 seconds.
2. In the Vercel project, add `GEMINI_API_KEY` as an encrypted **Secret** in the
   Production environment. Enter the variable name in **Key** and the Gemini API
   credential from Google AI Studio in **Value**. Never paste the credential in
   chat, source code, the browser, or a committed `.env` file.
3. Redeploy after saving or changing the secret.
4. `public/zikr/ai-config.js` already points to the production `/api/chat`
   endpoint. Deploy `public/zikr/` to Firebase Hosting after frontend changes.

The server tries the Gemini Flash latest alias, Gemini 3.6 Flash, Gemini 2.5
Flash, and Gemini 2.5 Flash-Lite in order. It moves to the next model on quota,
availability, or invalid structured output. The exact models available to an
API key depend on Google's current model catalog, account region, and quota.

The client sends up to 12 prior conversation messages (at most 8,000 combined
characters) to the function so the assistant can continue the personal plan.
The history stays in the visitor's browser and syncs with their private account
when signed in. The function validates messages and schedules before returning
them. Requests are limited to five per IP per minute per warm server instance;
this in-memory throttle is best-effort and is not durable across serverless
restarts. Set appropriate quota limits in Google AI Studio for public use.

Run the focused checks with `node --test tests/api-chat.test.js`.
