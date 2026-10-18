# Zikr AI API

The `/api/chat` Vercel function only creates a personal schedule from the four
built-in dhikr phrases. It does not accept provider names, model names, or API
keys from the browser.

## One-time setup

1. Import this repository into a Vercel project and deploy it with the project
   root as the repository root. `vercel.json` publishes the static site from
   `public/`; Vercel detects `api/chat.js` as a Node.js function.
2. In Vercel project settings, add `GEMINI_API_KEY` as an encrypted environment
   variable. Never put the value in a tracked file, the browser, or a chat.
3. Redeploy the Vercel project so the function receives the environment
   variable.
4. Copy the deployed function URL (for example,
   `https://your-project.vercel.app/api/chat`) into
   `window.ISLAMIC_AI_API_URL` in `public/zikr/ai-config.js`, replacing the
   empty value:

   ```js
   window.ISLAMIC_AI_API_URL = 'https://your-project.vercel.app/api/chat';
   ```
5. Deploy the Zikr static site to Firebase Hosting. Visitors can then ask the
   agent for a schedule without supplying their own key or signing in.

Gemini API free-tier availability and quotas depend on Google's current terms
and can change. The function has an in-memory per-IP throttle; serverless
instances can restart, so this is best-effort protection, not a durable abuse
limit. Set a conservative quota in the Google AI project and add a durable rate
limiter before enabling broad public traffic.

Run the focused checks with `node --test tests/api-chat.test.js`.
