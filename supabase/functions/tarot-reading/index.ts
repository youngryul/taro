// Supabase Edge Function: 질문 타로 AI 답변 생성 (OpenAI)
//
// 배포:
//   supabase secrets set OPENAI_API_KEY=sk-...
//   supabase secrets set OPENAI_MODEL=gpt-4o-mini   # 선택
//   supabase functions deploy tarot-reading
//
// OpenAI 키는 절대 프론트(.env 의 REACT_APP_*)에 두지 마세요. 번들에 그대로 노출됩니다.
// 이 함수는 Deno 런타임에서 실행되며 CRA 빌드(src/)에는 포함되지 않습니다.

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-4o-mini';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CardInput {
  key: string;
  position: string;
  name: string;
  nameKo: string;
  keywords: string[];
  /** 규칙 엔진이 문서/개발자 보완 해석으로 만든 자리별 해석 (근거) */
  basis: string;
}

interface RequestBody {
  question: string;
  category: string;
  topic: string;
  spreadName: string;
  cards: CardInput[];
  overall: string;
  advice: string;
}

interface AiReading {
  headline: string;
  sections: { position: string; body: string }[];
  overall: string;
  advice: string;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const SYSTEM_PROMPT = `당신은 따뜻하고 차분한 한국어 타로 리더입니다.
- 사용자의 질문과 뽑힌 카드, 그리고 '근거 해석'을 바탕으로 답변합니다.
- 근거 해석에 없는 카드 의미를 지어내지 말고, 근거를 질문 상황에 맞게 자연스럽게 풀어 주세요.
- 단정적인 예언, 의료·법률·투자 판단은 피하고, 스스로 선택할 수 있도록 돕는 어조로 씁니다.
- 각 자리 해석은 2~4문장, 전체 흐름은 3~5문장, 조언은 2~3문장.
- 반드시 아래 JSON 형식으로만 답하세요:
{"headline": string, "sections": [{"position": string, "body": string}], "overall": string, "advice": string}
sections 는 입력 카드 순서와 같은 position 을 그대로 사용합니다.`;

function buildUserPrompt(b: RequestBody): string {
  const cards = b.cards
    .map(
      (c, i) =>
        `${i + 1}. [${c.position}] ${c.nameKo} (${c.name}) — 키워드: ${c.keywords.slice(0, 5).join(', ')}\n   근거 해석: ${c.basis}`
    )
    .join('\n');
  return [
    `질문 주제: ${b.topic} (${b.category})`,
    `스프레드: ${b.spreadName}`,
    `질문: "${b.question}"`,
    '',
    '뽑힌 카드:',
    cards,
    '',
    `규칙 기반 전체 흐름 분석: ${b.overall}`,
    `규칙 기반 조언: ${b.advice}`,
  ].join('\n');
}

function validate(body: unknown): body is RequestBody {
  const b = body as RequestBody;
  return (
    !!b &&
    typeof b.question === 'string' &&
    b.question.trim().length > 0 &&
    b.question.length <= 500 &&
    Array.isArray(b.cards) &&
    b.cards.length > 0 &&
    b.cards.length <= 10
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { error: 'method not allowed' });

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return json(500, { error: 'OPENAI_API_KEY 가 설정되지 않았습니다.' });
  const model = Deno.env.get('OPENAI_MODEL') || DEFAULT_MODEL;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'invalid json' });
  }
  if (!validate(body)) return json(400, { error: 'invalid request' });

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(body) },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('OpenAI error', res.status, detail);
    return json(502, { error: 'AI 응답 생성에 실패했습니다.' });
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  let reading: AiReading;
  try {
    reading = JSON.parse(content ?? '');
  } catch {
    return json(502, { error: 'AI 응답 형식이 올바르지 않습니다.' });
  }
  if (!reading.headline || !Array.isArray(reading.sections)) {
    return json(502, { error: 'AI 응답 형식이 올바르지 않습니다.' });
  }

  return json(200, { model: data.model ?? model, reading });
});
