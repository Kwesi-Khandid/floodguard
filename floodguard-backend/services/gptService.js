

// const templates = {
//   HIGH: {
//     recommendation:
//       "A very detailed flood and drainage assessment by experts is strongly recommended. This property appears to have very high flood risk",
//     buyerAdvice:
//       "This property has a very high flood risk and could lead to damage to your property and possible lost of investment. You are adviced to desist from buying"
//   },

//   MODERATE: {
//     recommendation:
//       "Construction is possible but should include proper drainage, elevated foundations where appropriate, and flood-resistant design measures.",
//     buyerAdvice:
//       "Request a professional site assessment before making a purchase. This place is likely to get flooded"
//   },

//   LOW: {
//     recommendation:
//       "Standard construction practices are generally suitable, but ensure local drainage systems are adequate and comply with building regulations.",
//     buyerAdvice:
//       "The property appears to have a relatively low flood risk,you can go ahead a purchase it."
//   }
// };

// /**
//  * Generate explanation locally (0 API tokens)
//  */
// function localExplanation({ level, score, confidence, reasons }) {
//   return {
//     summary: `This land is classified as ${level.toLowerCase()} flood risk with a score of ${score}/100 and a confidence level of ${confidence}%. The assessment is based on the following factors: ${reasons.join(", ")}.`,

//     recommendation:
//       templates[level]?.recommendation ??
//       "Seek professional engineering advice before construction.",

//     buyerAdvice:
//       templates[level]?.buyerAdvice ??
//       "Review local flood history before purchasing."
//   };
// }

// /**
//  * Optional GPT explanation
//  * Only use this if you really want AI-generated wording.
//  */

// OPENAI_API_KE= 

// async function gptExplanation({ level, score, confidence, reasons }) {
//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
//     },

//     body: JSON.stringify({
//       model: "gpt-5",
//       temperature: 0.2,
//       max_completion_tokens: 60,

//       messages: [
//         {
//           role: "system",
//           content:
//             "Use supplied values only. Return JSON:{summary,recommendation,buyerAdvice}"
//         },

//         {
//           role: "user",
//           content: `${level}|${score}|${confidence}|${reasons.join("|")}`
//         }
//       ]
//     })
//   });

//   if (!response.ok) {
//     throw new Error(`GPT request failed (${response.status})`);
//   }

//   const data = await response.json();

//   return JSON.parse(data.choices[0].message.content);
// }

// /**
//  * Main exported function
//  *
//  * By default:
//  * - Uses LOCAL explanation (0 tokens)
//  *
//  * To enable GPT:
//  * explainRisk(data, true)
//  */
// async function explainRisk(data, useGPT = false) {
//   if (!useGPT) {
//     return localExplanation(data);
//   }

//   try {
//     return await gptExplanation(data);
//   } catch (err) {
//     console.error("GPT failed, using local explanation.");
//     return localExplanation(data);
//   }
// }

// module.exports = {
//   explainRisk
// };




require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const templates = {
  HIGH: {
    recommendation:
      "A detailed flood and drainage assessment by qualified engineers is strongly recommended before any construction.",

    buyerAdvice:
      "This property has a high flood risk. Carefully consider potential damage, repair costs, insurance, and long-term investment risks before purchasing."
  },

  MODERATE: {
    recommendation:
      "Construction is possible but should include proper drainage, elevated foundations, and flood-resistant design.",

    buyerAdvice:
      "Obtain a professional site assessment and review historical flood records before purchasing."
  },

  LOW: {
    recommendation:
      "Standard construction practices are generally suitable, provided local drainage regulations are followed.",

    buyerAdvice:
      "The property appears to have a relatively low flood risk, but verify local planning information before purchasing."
  }
};

/**
 * Zero-token explanation
 */
function localExplanation({ level, score, confidence, reasons }) {
  return {
    summary:
      `This land is classified as ${level.toLowerCase()} flood risk with a flood risk score of ${score}/100 and a confidence level of ${confidence}%. ` +
      `The assessment is based on the following factors: ${reasons.join(", ")}.`,

    recommendation:
      templates[level]?.recommendation ??
      "Seek professional engineering advice before construction.",

    buyerAdvice:
      templates[level]?.buyerAdvice ??
      "Review local flood history before purchasing."
  };
}

/**
 * Gemini explanation
 */
async function geminiExplanation({ level, score, confidence, reasons }) {

  const prompt = `
You are a flood-risk communication assistant.

Explain ONLY the supplied assessment.
Do NOT change the risk level, score or confidence.

Risk Level: ${level}
Score: ${score}/100
Confidence: ${confidence}%
Reasons: ${reasons.join(", ")}

Return ONLY valid JSON.

{
  "summary":"",
  "recommendation":"",
  "buyerAdvice":""
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  let text = response.text.trim();

  // Remove markdown fences if Gemini adds them
  text = text.replace(/```json|```/g, "").trim();

  return JSON.parse(text);
}

/**
 * Public function
 */
async function explainRisk(data) {

  // Use local explanation for straightforward cases
  const useLocal =
    data.confidence >= 90 ||
    data.score <= 30 ||
    data.score >= 80;

  if (useLocal) {
    return localExplanation(data);
  }

  try {
    return await geminiExplanation(data);
  } catch (err) {
    console.error("Gemini failed:", err.message);
    return localExplanation(data);
  }
}

module.exports = {
  explainRisk
};