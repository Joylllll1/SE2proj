const SEARCH_API_URL = process.env.SEARCH_API_URL;
const SEARCH_API_KEY = process.env.SEARCH_API_KEY;

export const schema = {
  type: 'function',
  function: {
    name: 'web_search',
    description: '搜索实时外部信息（新闻、实时动态、外部政策、天气等知识库之外的信息）',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string', description: '搜索关键词' } },
      required: ['query'],
    },
  },
};

export async function handler({ query }, signal) {
  if (!SEARCH_API_URL || !SEARCH_API_KEY) return { results: [], note: '搜索服务未配置' };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const combined = signal ? AbortSignal.any?.([signal, controller.signal]) : controller.signal;
    const res = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SEARCH_API_KEY}` },
      signal: combined || controller.signal,
      body: JSON.stringify({ query, max_results: 5 }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { results: (data.results || []).slice(0, 5) };
  } catch (err) {
    return { results: [], error: err.name === 'AbortError' ? '搜索超时' : err.message };
  } finally {
    clearTimeout(timeout);
  }
}
