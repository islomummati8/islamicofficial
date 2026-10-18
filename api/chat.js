const dhikrCatalog = require('../public/zikr/dhikr-catalog.js');
const dhikrById = new Map(dhikrCatalog.map(item => [item.id, item]));
const allowedFirebaseHosts = new Set([
  'islamicofficial-zikr.web.app',
  'islamicofficial-zikr.firebaseapp.com'
]);
const flashModels = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash'
];
const responseSchema = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    plan: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING', enum: dhikrCatalog.map(item => item.id) },
          time: { type: 'STRING' },
          target: { type: 'INTEGER' }
        },
        required: ['id', 'time', 'target']
      }
    }
  },
  required: ['reply', 'plan']
};
const requestWindowMs = 60_000;
const requestLimit = 5;
const requestTimestamps = new Map();
const maxHistoryMessages = 12;
const maxHistoryCharacters = 8_000;

function isAllowedOrigin(origin) {
  if (typeof origin !== 'string') return false;
  let url;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port
    || url.origin !== origin || url.pathname !== '/' || url.search || url.hash) return false;
  const hostname = url.hostname.toLowerCase();
  return allowedFirebaseHosts.has(hostname)
    || hostname === 'islamicofficial.com'
    || hostname.endsWith('.islamicofficial.com');
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(payload === null ? '' : JSON.stringify(payload));
}

function readPlan(value) {
  if (!Array.isArray(value) || value.length > 8) {
    throw new Error('AI returned an invalid plan length.');
  }
  return value.map(item => {
    const source = item && dhikrById.get(item.id);
    if (!source
      || typeof item.time !== 'string'
      || (item.time !== '' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time))
      || !Number.isInteger(item.target) || item.target < 1 || item.target > 99999) {
      throw new Error('AI returned an invalid catalog item.');
    }
    return {
      id: source.id,
      time: item.time,
      target: item.target,
      category: source.category,
      arabic: source.arabic,
      latin: source.latin,
      meaning: source.meaning,
      source: source.source
    };
  });
}

function readAssistantResponse(text) {
  let value;
  try {
    value = JSON.parse(text.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
  } catch {
    throw new Error('AI returned invalid response JSON.');
  }
  if (!value || typeof value.reply !== 'string' || !value.reply.trim() || value.reply.length > 800) {
    throw new Error('AI returned an invalid response message.');
  }
  return {
    reply: value.reply.trim(),
    plan: readPlan(value.plan)
  };
}

function validateHistory(history, request) {
  if (history === undefined) return [];
  if (!Array.isArray(history) || history.length > maxHistoryMessages) {
    throw new Error('Suhbat tarixi ko‘p yoki noto‘g‘ri formatda.');
  }
  let characters = request.length;
  const normalized = history.map(message => {
    if (!message || !['user', 'assistant'].includes(message.role)
      || typeof message.content !== 'string'
      || !message.content.trim() || message.content.length > 2000) {
      throw new Error('Suhbatdagi xabar noto‘g‘ri formatda.');
    }
    const content = message.content.trim();
    characters += content.length;
    return { role: message.role, content };
  });
  if (characters > maxHistoryCharacters) {
    throw new Error('Suhbat juda uzun. Yangi suhbat boshlang yoki eski xabarlarni tozalang.');
  }
  return normalized;
}

function findCatalogDua(request) {
  const text = request.toLocaleLowerCase('uz-UZ').replace(/[’‘`]/g, "'");
  if (!/\b(dua|duo|zikr|qo'shib|qo'sh|qo'sha|qo'shish|add)\b/.test(text)) return null;
  const requestedId = /\b(ilm|bilim|o'qish|oqish|tahsil|knowledge|study)\w*/.test(text)
    ? 'rabbi-zidni-ilma'
    : /\b(ota|ona|ota-ona|parents)\w*/.test(text)
      ? 'rabbighfir-li-wa-liwalidayya'
      : /\b(rizq|daromad|kasb|muhtoj)\w*/.test(text)
        ? 'rabbi-inni-lima-anzalta'
        : /\b(oson|yengil|hayajon|nutq|gapir|imtihon|imtixon)\w*/.test(text)
          ? 'rabbi-ishrah-li-sadri'
          : /\b(dunyo|oxirat|yaxshilik|jannat)\w*/.test(text)
            ? 'rabbana-atina'
            : null;
  const source = dhikrById.get(requestedId);
  return source ? {
    reply: `${source.latin} duosi ${source.source} da kelgan. O‘qilishi va ma’nosini xohlaganingizcha tahrirlashingiz mumkin.`,
    plan: [{
      id: source.id,
      time: '',
      target: 1,
      category: source.category,
      arabic: source.arabic,
      latin: source.latin,
      meaning: source.meaning,
      source: source.source
    }],
    model: 'verified-quran-catalog'
  } : null;
}

function allowRequest(ip, now = Date.now()) {
  const recent = (requestTimestamps.get(ip) || []).filter(time => now - time < requestWindowMs);
  if (recent.length >= requestLimit) {
    requestTimestamps.set(ip, recent);
    return false;
  }
  recent.push(now);
  requestTimestamps.set(ip, recent);
  if (requestTimestamps.size > 5000) {
    for (const [key, timestamps] of requestTimestamps) {
      if (!timestamps.some(time => now - time < requestWindowMs)) requestTimestamps.delete(key);
    }
  }
  return true;
}

async function requestGemini(contents, apiKey, signal) {
  let lastStatus = 502;
  let sawRateLimit = false;
  let sawInvalidResponse = false;
  for (const model of flashModels) {
    let upstream;
    try {
      upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: [
                'Sen foydalanuvchining shaxsiy zikr rejasini tuzuvchi va shu suhbat kontekstini eslab qoluvchi yordamchisan.',
                `Faqat quyidagi katalog idlaridan foydalan: ${dhikrCatalog.map(item => item.id).join(', ')}.`,
                'Katalogdagi arabcha matn, o‘qilishi, ma’nosi va manbasi tekshirilgan deb hisobla; yangi diniy matn, tarjima, hadis, manba yoki fazilatni o‘zing to‘qima.',
                'Duo yoki zikr so‘ralganda maqsadiga eng mos katalog idlarini tanla. Masalan, ilmni ziyoda qilish uchun rabbi-zidni-ilma. Reja vaqtini so‘ramasa time bo‘sh satr, target esa 1 bo‘lsin.',
                'Diniy hukm yoki katalogda yo‘q duo so‘ralsa, manba to‘qima; reply ichida cheklovni muloyim tushuntir va kerak bo‘lsa ishonchli olimga murojaat qilishni tavsiya et.',
                'Suhbat tarixini va oxirgi topshiriqni hisobga ol. Yangi reja so‘ralsa, oldingi reja bilan zid bo‘lmagan to‘liq yangilangan rejani qaytar.',
                'Faqat JSON obyekt qaytar: {"reply":"qisqa javob","plan":[{"id":"rabbi-zidni-ilma","time":"","target":1}]}',
                'Oddiy savol yoki aniqlik uchun plan bo‘sh massiv bo‘lishi mumkin. Reja yoki zikr qo‘shishda 1–8 ta katalog elementi qaytar.',
                'Har bir plan elementi katalogdagi id, HH:MM yoki bo‘sh time va 1–99999 oralig‘idagi butun target qiymatiga ega bo‘lsin.'
              ].join('\n')
            }]
          },
          contents: contents.map(message => ({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }]
          })),
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json',
            responseSchema
          }
        }),
        signal
      });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      lastStatus = 502;
      console.error('Gemini model request failed:', model, error.message);
      continue;
    }

    if (!upstream.ok) {
      lastStatus = upstream.status;
      if (upstream.status === 429) sawRateLimit = true;
      console.error('Gemini model returned HTTP status:', model, upstream.status);
      if (upstream.status === 401 || upstream.status === 403 || upstream.status === 400) break;
      continue;
    }

    let result;
    try {
      result = await upstream.json();
    } catch {
      lastStatus = 502;
      continue;
    }
    const text = result?.candidates?.[0]?.content?.parts
      ?.map(part => typeof part.text === 'string' ? part.text : '')
      .join('')
      .trim();
    if (!text) {
      lastStatus = 502;
      sawInvalidResponse = true;
      continue;
    }
    try {
      return { ...readAssistantResponse(text), model };
    } catch (error) {
      lastStatus = 502;
      sawInvalidResponse = true;
      console.error('Gemini model returned an invalid zikr response:', model, error.message);
    }
  }
  return {
    errorStatus: sawRateLimit ? 429 : lastStatus,
    errorReason: sawInvalidResponse ? 'invalid-response' : null
  };
}

module.exports = async function chatHandler(req, res) {
  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin)) {
    return send(res, 403, { error: 'Bu sayt manzilidan so‘rovga ruxsat berilmagan.' });
  }
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end('');
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return send(res, 405, { error: 'Faqat POST so‘rovi qabul qilinadi.' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return send(res, 503, { error: 'AI server hozircha sozlanmagan.' });
  }
  const contentLength = Number(req.headers['content-length']);
  if (Number.isFinite(contentLength) && contentLength > 16_000) {
    return send(res, 413, { error: 'So‘rov hajmi ruxsat etilgan chegaradan katta.' });
  }
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return send(res, 415, { error: 'JSON formatidagi so‘rov yuboring.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return send(res, 400, { error: 'JSON so‘rovi noto‘g‘ri formatda.' });
    }
  }
  const request = body && typeof body.request === 'string' ? body.request.trim() : '';
  if (!request || request.length > 2000) {
    return send(res, 400, { error: 'Topshiriqni 1–2000 belgi oralig‘ida kiriting.' });
  }
  let history;
  try {
    history = validateHistory(body.history, request);
  } catch (error) {
    return send(res, 400, { error: error.message });
  }
  if (Buffer.byteLength(JSON.stringify({ request, history }), 'utf8') > 16_000) {
    return send(res, 413, { error: 'Suhbat hajmi ruxsat etilgan chegaradan katta.' });
  }

  const ip = req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
  if (!allowRequest(String(ip))) {
    res.setHeader('Retry-After', '60');
    return send(res, 429, { error: 'So‘rovlar tez-tez yuborildi. Bir ozdan keyin qayta urinib ko‘ring.' });
  }

  const contents = [...history, { role: 'user', content: request }];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50_000);
  try {
    const result = await requestGemini(contents, process.env.GEMINI_API_KEY, controller.signal);
    if (result.errorStatus) {
      const catalogDua = findCatalogDua(request);
      if (catalogDua) return send(res, 200, catalogDua);
      if (result.errorStatus === 429) {
        return send(res, 429, { error: 'Barcha Gemini modellari vaqtincha kvota yoki tezlik chekloviga uchradi. Keyinroq qayta urinib ko‘ring.' });
      }
      if (result.errorStatus === 401 || result.errorStatus === 403) {
        return send(res, 503, { error: 'Gemini kaliti yaroqsiz yoki ruxsati cheklangan. Vercel Secret sozlamasini tekshiring.' });
      }
      if (result.errorReason === 'invalid-response') {
        return send(res, 502, { error: 'Gemini modellari yaroqli zikr rejasini qaytara olmadi. Boshqacha so‘rov bilan urinib ko‘ring.' });
      }
      return send(res, 502, { error: 'Gemini modellari javob bera olmadi. Birozdan keyin qayta urinib ko‘ring.' });
    }
    if (!result.plan.length) {
      const catalogDua = findCatalogDua(request);
      if (catalogDua) return send(res, 200, catalogDua);
    }
    return send(res, 200, {
      reply: result.reply,
      plan: result.plan,
      model: result.model
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return send(res, 504, { error: 'AI so‘rovining vaqti tugadi. Qayta urinib ko‘ring.' });
    }
    console.error('AI server request failed:', error);
    return send(res, 502, { error: 'AI serverga ulanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.' });
  } finally {
    clearTimeout(timeoutId);
  }
};
