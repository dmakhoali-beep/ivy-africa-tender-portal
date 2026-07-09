// Netlify Function — keeps ANTHROPIC_API_KEY server-side.
// Set ANTHROPIC_API_KEY in Netlify → Site settings → Environment variables.
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { text } = JSON.parse(event.body || "{}");
  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing tender text" }) };
  }

  const prompt = `You are simulating a South African public sector tender evaluation committee (PPPFA/PFMA scoring methodology: functionality evaluation against a points threshold, then price/B-BBEE preference points, typically 80/20 or 90/10 split).

Company profile — Ivy Africa (Pty) Ltd: B-BBEE Level 1, 100% Black-owned, Eastern Cape based (Aliwal North), ETDP SETA accredited, CompTIA Authorized Delivery Partner, PECB Accredited Training Partner. Experience: ICT reselling, training delivery, skills development facilitation (WSP/ATR), government tender submissions. No corporate ISO 9001 certification, but has individually PECB-certified staff.

Read the tender text below and return ONLY valid JSON, no markdown fences, no preamble, exact structure:
{"entity":"","refNumber":"","closingDate":"","estimatedValue":0,"functionalityCriteria":[{"name":"","maxPoints":0}],"functionalityThreshold":0,"priceBBBEESplit":"","mandatoryDocuments":[""],"estimatedFunctionalityScore":0,"meetsThreshold":true,"keyGaps":[""],"verdict":"GO","verdictReason":""}

verdict must be one of GO, SELECTIVE, AVOID. Score realistically against Ivy Africa's actual profile — do not inflate.

TENDER TEXT:
"""${text.slice(0, 15000)}"""`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    const textBlock = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    const clean = textBlock.replace(/```json|```/g, "").trim();
    return { statusCode: 200, body: clean };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
