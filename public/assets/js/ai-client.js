const geminiFallbackModels = [
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
  { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
  { id: 'gemini-3-flash', label: 'Gemini 3 Flash' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2 Flash' },
  { id: 'gemini-2.0-flash-lite', label: 'Gemini 2 Flash Lite' }
];

export const aiProviders = {
  gemini: {
    name: 'Gemini',
    keyStorage: 'admin-gemini-api-key',
    models: geminiFallbackModels
  },
  openai: {
    name: 'ChatGPT',
    keyStorage: 'admin-openai-api-key',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
      { id: 'gpt-4.1-nano', label: 'GPT-4.1 nano' }
    ]
  }
};

export function getAiApiKey(providerId) {
  const provider = aiProviders[providerId];
  if (!provider) throw new Error('AI provayderi tanilmadi.');
  try {
    return sessionStorage.getItem(provider.keyStorage) || '';
  } catch (error) {
    console.error(`Could not read ${providerId} API key:`, error);
    return '';
  }
}

function canFallbackToAnotherModel(status, message = '') {
  return [404, 429, 500, 502, 503, 504].includes(status)
    || (status === 400 && /model.{0,30}(not found|not supported|invalid)|(?:not found|not supported).{0,30}model/i.test(message));
}

async function requestModel(providerId, modelId, apiKey, promptText) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 40000);
  try {
    const response = providerId === 'gemini'
      ? await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelId)}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 2048 }
        }),
        signal: controller.signal
      })
      : await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: modelId,
          messages: [
            { role: 'system', content: 'You are a careful Uzbek writing assistant. Return only the requested text. Never fabricate religious sources or factual details.' },
            { role: 'user', content: promptText }
          ],
          temperature: 0.35,
          max_tokens: 2048
        }),
        signal: controller.signal
      });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new Error(`${aiProviders[providerId].name} javobini o‘qib bo‘lmadi.`);
    }
    if (!response.ok) {
      const error = new Error(payload?.error?.message || `${aiProviders[providerId].name} HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    const text = providerId === 'gemini'
      ? payload?.candidates?.[0]?.content?.parts?.map((part) => typeof part.text === 'string' ? part.text : '').join('').trim()
      : payload?.choices?.[0]?.message?.content?.trim();
    if (!text) {
      const error = new Error(`${modelId} modelidan matn kelmadi.`);
      error.status = 502;
      throw error;
    }
    return text;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('AI so‘rovi vaqti tugadi. Qayta urinib ko‘ring.');
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function requestAiText(providerId, requestedModel, apiKey, promptText) {
  const provider = aiProviders[providerId];
  if (!provider) throw new Error('AI provayderi tanilmadi.');
  if (!apiKey) throw new Error(`${provider.name} API kaliti sozlanmagan.`);
  const models = [
    requestedModel,
    ...provider.models.map((model) => model.id).filter((id) => id !== requestedModel)
  ];
  let lastError;
  for (const modelId of models) {
    try {
      return await requestModel(providerId, modelId, apiKey, promptText);
    } catch (error) {
      lastError = error;
      if (!canFallbackToAnotherModel(error.status, error.message)) throw error;
      console.warn(`${providerId} model ${modelId} unavailable; trying the next model:`, error.message);
    }
  }
  throw lastError || new Error(`${provider.name} modellari hozir javob bermadi.`);
}

function extractInteractionText(payload) {
  const collect = (value) => {
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value)) return value.flatMap(collect);
    if (typeof value.text === 'string') return [value.text];
    if (typeof value.output_text === 'string') return [value.output_text];
    return ['output', 'steps', 'content'].flatMap((key) => collect(value[key]));
  };
  return [...new Set(collect(payload).map((text) => text.trim()).filter(Boolean))].join('\n').trim();
}

export async function transcribeYouTubeVideo(videoId, apiKey) {
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    throw new Error('Yaroqli YouTube video havolasi topilmadi.');
  }
  if (!apiKey) throw new Error('Gemini API kaliti sozlanmagan.');

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 180000);
  try {
    let lastError;
    for (const { id: modelId } of aiProviders.gemini.models) {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            model: modelId,
            input: [
              {
                type: 'text',
                text: [
                  'Transcribe this public YouTube video as accurately and completely as possible.',
                  'Return only the spoken words in their original language, with light punctuation and paragraph breaks.',
                  'Do not summarize, translate, add explanations, or invent words. Mark unclear speech as [inaudible].'
                ].join(' ')
              },
              { type: 'video', uri: `https://www.youtube.com/watch?v=${videoId}` }
            ]
          }),
          signal: controller.signal
        });

        let payload;
        try {
          payload = await response.json();
        } catch {
          throw new Error('Gemini javobini o‘qib bo‘lmadi.');
        }
        if (!response.ok) {
          const error = new Error(payload?.error?.message || `Gemini HTTP ${response.status}`);
          error.status = response.status;
          throw error;
        }
        const transcript = extractInteractionText(payload);
        if (!transcript) {
          const error = new Error(`${modelId} modelidan transkript matni kelmadi.`);
          error.status = 502;
          throw error;
        }
        return transcript;
      } catch (error) {
        lastError = error;
        if (!canFallbackToAnotherModel(error.status, error.message)) throw error;
        console.warn(`Gemini transcription model ${modelId} unavailable; trying the next model:`, error.message);
      }
    }
    throw lastError || new Error('Gemini Flash modellari hozir javob bermadi.');
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Transkripsiya vaqti tugadi. Qisqaroq videoda qayta urinib ko‘ring.');
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
