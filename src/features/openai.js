const RESPONSES_URL = 'https://api.openai.com/v1/responses'
export const CHAT_MODEL = 'gpt-4.1-mini'

function extractOutputText(response) {
  return (response.output || [])
    .filter((item) => item.type === 'message')
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text)
    .join('\n')
    .trim()
}

async function requestResponse(apiKey, payload) {
  const response = await fetch(RESPONSES_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error?.message || `요청에 실패했습니다 (${response.status}).`)
  }
  return data
}

export async function checkOpenAIConnection(apiKey) {
  const result = await requestResponse(apiKey, {
    model: CHAT_MODEL,
    input: 'Reply with only OK.',
    max_output_tokens: 8,
  })
  if (!extractOutputText(result)) throw new Error('응답을 받지 못했습니다. 모델 접근 권한을 확인해 주세요.')
  return true
}

export async function askCareerAssistant(apiKey, instructions, conversation) {
  const result = await requestResponse(apiKey, {
    model: CHAT_MODEL,
    instructions,
    input: conversation,
    max_output_tokens: 400,
  })
  const text = extractOutputText(result)
  if (!text) throw new Error('답변을 받지 못했습니다. 다시 시도해 주세요.')
  return text
}
