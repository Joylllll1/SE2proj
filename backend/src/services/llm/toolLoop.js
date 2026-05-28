import { callLLM, extractToolCalls, extractContent, parseStreamChunk } from './client.js';
import { toolSchemas, executeTool } from '../tools/index.js';
import { sseToolCall, sseToolResult, sseToken, sseDone } from './sseEvents.js';

const MAX_TOOL_CALLS = parseInt(process.env.AI_TOOL_MAX_CALLS || '3');
const MAX_LOOP_ROUNDS = 6;

export async function runToolLoop({ messages, signal, writeEvent }) {
  let toolCallCount = 0;
  let rounds = 0;
  const workingMessages = [...messages];

  while (rounds < MAX_LOOP_ROUNDS) {
    const result = await callLLM({ messages: workingMessages, tools: toolSchemas, toolChoice: 'auto', stream: false, signal });
    const choice = result.data.choices[0];
    const toolCalls = extractToolCalls(choice);
    const content = extractContent(choice);

    if (!toolCalls.length) {
      // Phase 2: stream final answer
      const streamResult = await callLLM({
        messages: [...workingMessages, { role: 'assistant', content }],
        tools: toolSchemas, toolChoice: 'none', stream: true, signal,
      });
      const reader = streamResult.stream.getReader();
      const decoder = new TextDecoder();
      let fullContent = content || '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const ev of parseStreamChunk(decoder.decode(value, { stream: true }))) {
          const delta = ev.choices?.[0]?.delta?.content;
          if (delta) { fullContent += delta; writeEvent(sseToken(delta)); }
        }
      }
      writeEvent(sseDone());
      return { content: fullContent, toolCallCount };
    }

    // Handle tool calls
    workingMessages.push({ role: 'assistant', content: content || null, tool_calls: toolCalls });

    for (const tc of toolCalls) {
      toolCallCount += 1;
      if (toolCallCount > MAX_TOOL_CALLS) {
        workingMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify({ error: '工具调用次数已达上限' }) });
        break;
      }

      let args = {};
      try { args = JSON.parse(tc.function.arguments); } catch { /* use empty */ }
      writeEvent(sseToolCall(tc.function.name, args));

      const toolResult = await executeTool(tc.function.name, args, signal).catch(e => ({ error: e.message }));
      writeEvent(sseToolResult(tc.function.name));
      workingMessages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(toolResult) });
    }
    rounds += 1;
  }

  // Exceeded limit — force final non-tool answer
  workingMessages.push({ role: 'system', content: '工具调用次数已达上限，请基于已有信息直接回答。不要再调工具。' });
  const finalResult = await callLLM({ messages: workingMessages, tools: toolSchemas, toolChoice: 'none', stream: true, signal });
  const reader = finalResult.stream.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const ev of parseStreamChunk(decoder.decode(value, { stream: true }))) {
      const delta = ev.choices?.[0]?.delta?.content;
      if (delta) { fullContent += delta; writeEvent(sseToken(delta)); }
    }
  }
  writeEvent(sseDone());
  return { content: fullContent, toolCallCount };
}
