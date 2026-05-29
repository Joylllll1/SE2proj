const SEARCH_TIMEOUT_MS = parseInt(process.env.AI_TOOL_TIMEOUT_MS || '8000', 10);
const MAX_RESULTS = parseInt(process.env.AI_WEB_SEARCH_MAX_RESULTS || '8', 10);
const BAIDU_WEB_SEARCH_URL = process.env.AI_WEB_SEARCH_BAIDU_URL || 'https://qianfan.baidubce.com/v2/ai_search/web_search';
const BAIDU_WEB_SEARCH_API_KEY = process.env.AI_WEB_SEARCH_BAIDU_API_KEY || '';

function createTimeoutSignal(signal, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error('SEARCH_TIMEOUT'));
  }, timeoutMs);

  if (signal) {
    if (signal.aborted) {
      controller.abort(signal.reason);
    } else {
      signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}

function normalizeReference(item = {}) {
  const title = item.title || item.name || '';
  const snippet = item.content || item.snippet || item.summary || item.description || '';
  const url = item.url || item.link || '';
  const source = item.website || item.site_name || item.source || item.hostname || '';
  const publishedAt = item.publish_time || item.published_at || item.date || '';

  return {
    title,
    snippet,
    url,
    source,
    ...(publishedAt ? { publishedAt } : {}),
  };
}

function normalizeSearchResults(data = {}) {
  const references = Array.isArray(data.references) ? data.references : [];
  const normalized = references
    .map(normalizeReference)
    .filter((item) => item.title && item.url);

  return normalized.slice(0, MAX_RESULTS);
}

function buildRequestBody(query) {
  return {
    messages: [
      {
        role: 'user',
        content: query,
      },
    ],
    edition: 'standard',
    search_source: 'baidu_search_v2',
  };
}

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
  if (!query?.trim()) {
    return { results: [], note: '搜索关键词为空' };
  }

  if (!BAIDU_WEB_SEARCH_API_KEY) {
    console.log('[web_search] missing baidu api key');
    return { results: [], note: '搜索服务未配置' };
  }

  try {
    if (signal?.aborted) {
      return { results: [], note: '暂时没有拿到可靠的最新结果' };
    }

    const timeoutContext = createTimeoutSignal(signal, SEARCH_TIMEOUT_MS);
    let response;
    try {
      response = await fetch(BAIDU_WEB_SEARCH_URL, {
        method: 'POST',
        signal: timeoutContext.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BAIDU_WEB_SEARCH_API_KEY}`,
        },
        body: JSON.stringify(buildRequestBody(query.trim())),
      });
    } finally {
      timeoutContext.cleanup();
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      console.warn('[web_search] baidu provider failed:', response.status, errorBody.slice(0, 300));
      return { results: [], note: '暂时没有拿到可靠的最新结果' };
    }

    const data = await response.json();
    const results = normalizeSearchResults(data);
    console.log('[web_search] baidu response summary:', JSON.stringify({
      query,
      resultCount: results.length,
      firstTitle: results[0]?.title || '',
      firstSource: results[0]?.source || '',
    }));

    if (!results.length) {
      return {
        results: [],
        query,
        note: data?.message?.content || data?.result || '没有找到可靠的最新结果',
      };
    }

    return { results, query };
  } catch (err) {
    if (err?.message === 'SEARCH_TIMEOUT' || err?.name === 'AbortError') {
      return { results: [], note: '搜索超时，未拿到可靠结果' };
    }
    console.warn('[web_search] baidu provider exception:', err?.message || err);
    return { results: [], note: '暂时没有拿到可靠的最新结果' };
  }
}
