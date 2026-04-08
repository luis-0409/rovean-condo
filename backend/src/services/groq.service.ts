interface EncomendaInfo {
  moradorNome: string;
  remetente: string;
  transportadora: string;
  tipo: string;
  tamanho: string;
}

export async function gerarMensagemEncomenda(info: EncomendaInfo): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY não configurada.');

  const prompt = `Você é o sistema de notificações do condomínio Rovean Condo, um condomínio premium em Alphaville Eusébio.
Gere uma mensagem curta e cordial em português para avisar o morador que uma encomenda chegou.

Dados da encomenda:
- Morador: ${info.moradorNome}
- Remetente: ${info.remetente}
- Transportadora: ${info.transportadora}
- Tipo: ${info.tipo} (${info.tamanho})

Regras:
- Tom cordial e profissional, condizente com um condomínio premium
- Máximo 5 linhas
- Use emojis com moderação
- Inclua o nome do morador
- Finalize pedindo para retirar na portaria
- Não use markdown, apenas texto simples`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await res.json() as any;
  return data.choices[0].message.content.trim();
}
