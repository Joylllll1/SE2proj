import AppError from '../../utils/AppError.js';

function getLLMConfig() {
  return {
    apiUrl: process.env.LLM_API_URL || 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.LLM_API_KEY,
    model: process.env.LLM_MODEL || 'deepseek-chat',
  };
}

/**
 * Call the DeepSeek (OpenAI-compatible) LLM API.
 *
 * @param {Object} options
 * @param {Array}  options.messages   - Array of { role, content } message objects
 * @param {Array}  [options.tools]    - Tool definitions for function calling
 * @param {string} [options.toolChoice] - Tool choice policy ('auto', 'none', or { type: 'function', function: { name } })
 * @param {boolean} [options.stream]  - Whether to stream the response
 * @param {AbortSignal} [options.signal] - AbortSignal for cancellation
 * @returns {Promise<{ data?: Object, stream?: ReadableStream }>}
 */
export async function callLLM({ messages, tools, toolChoice, stream, signal }) {
  const { apiUrl, apiKey, model } = getLLMConfig();

  if (!apiKey) {
    throw new AppError('AI 服务未配置', 500, 'AI_NOT_CONFIGURED');
  }

  const body = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  };

  if (tools) {
    body.tools = tools;
    body.tool_choice = toolChoice || 'auto';
  }

  if (stream) {
    body.stream = true;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || `LLM API 请求失败 (${response.status})`;
    throw new AppError(message, 502, 'LLM_API_ERROR');
  }

  if (stream) {
    return { stream: response.body };
  }

  const data = await response.json();
  return { data };
}

/**
 * Parse NDJSON SSE chunks from an OpenAI-compatible streaming API response.
 *
 * Each chunk is a Buffer or string of concatenated SSE lines.
 * Lines starting with `data: ` contain a JSON payload.
 * The stream ends with a `data: [DONE]` sentinel.
 *
 * @param {Buffer|string} chunk - Raw bytes or text from the stream
 * @returns {Array<Object>} Parsed JSON objects from this chunk
 */
export function parseStreamChunk(chunk) {
  const text = typeof chunk === 'string' ? chunk : chunk.toString('utf-8');
  const lines = text.split('\n');
  const results = [];

  for (const line of lines) {
    if (!line.startsWith('data: ')) {
      continue;
    }

    const payload = line.slice(6).trim();

    if (payload === '[DONE]') {
      continue;
    }

    try {
      results.push(JSON.parse(payload));
    } catch {
      // Skip malformed JSON lines
    }
  }

  return results;
}

/**
 * Extract tool_calls from a streaming or non-streaming choice object.
 *
 * @param {Object} choice - A choice object from the API response
 * @returns {Array} The tool_calls array, or an empty array
 */
export function extractToolCalls(choice) {
  return choice.message?.tool_calls || [];
}

/**
 * Extract content text from a choice object.
 *
 * @param {Object} choice - A choice object from the API response
 * @returns {string} The content string, or empty string
 */
export function extractContent(choice) {
  return choice.message?.content || '';
}
