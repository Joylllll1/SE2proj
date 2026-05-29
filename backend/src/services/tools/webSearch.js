const SEARCH_TIMEOUT_MS = parseInt(process.env.AI_TOOL_TIMEOUT_MS || '8000', 10);
const MAX_RESULTS = parseInt(process.env.AI_WEB_SEARCH_MAX_RESULTS || '8', 10);

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SEARCH_TIMEOUT')), timeoutMs);
    }),
  ]);
}

function normalizeSearchResults(results = []) {
  return results.slice(0, MAX_RESULTS).map((item) => ({
    title: item.title || '',
    snippet: item.description || item.snippet || item.body || '',
    url: item.url || item.href || '',
    source: item.hostname || '',
  }));
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

  try {
    if (signal?.aborted) {
      return { results: [], note: '暂时没有拿到可靠的最新结果' };
    }

    const DDG = await import('duck-duck-scrape');
    const searchPromise = DDG.search(query, {
      safeSearch: DDG.SafeSearchType.MODERATE,
      locale: 'zh-cn',
    });

    const rawResults = await withTimeout(searchPromise, SEARCH_TIMEOUT_MS);

    if (signal?.aborted) {
      return { results: [], note: '暂时没有拿到可靠的最新结果' };
    }

    const normalizedResults = normalizeSearchResults(rawResults?.results || rawResults || []);

    if (!normalizedResults.length) {
      return { results: [], note: '没有找到可靠的最新结果' };
    }

    return { results: normalizedResults, query };
  } catch (err) {
    if (err?.message === 'SEARCH_TIMEOUT') {
      return { results: [], note: '搜索超时，未拿到可靠结果' };
    }
    return { results: [], note: '暂时没有拿到可靠的最新结果' };
  }
}
