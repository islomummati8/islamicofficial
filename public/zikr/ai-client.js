export async function requestZikrPlan(request, history = []) {
  const endpoint = window.ISLAMIC_AI_API_URL;
  if (typeof endpoint !== 'string' || !endpoint.trim()) {
    throw new Error('AI server manzili hali ulanmagan. Sayt egasi uni bir marta sozlashi kerak.');
  }
  let url;
  try {
    url = new URL(endpoint, window.location.href);
  } catch {
    throw new Error('AI server manzili noto‘g‘ri sozlangan.');
  }
  if (url.protocol !== 'https:') {
    throw new Error('AI server manzili HTTPS bo‘lishi kerak.');
  }
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 55_000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, history }),
      signal: controller.signal
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error('AI server javobini o‘qib bo‘lmadi.');
    }
    if (!response.ok) throw new Error(payload?.error || `AI server HTTP ${response.status}`);
    if (typeof payload?.reply !== 'string' || !Array.isArray(payload?.plan)) {
      throw new Error('AI server reja formatini noto‘g‘ri qaytardi.');
    }
    return { reply: payload.reply, plan: payload.plan, model: payload.model };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('AI so‘rovi vaqti tugadi. Qayta urinib ko‘ring.');
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
