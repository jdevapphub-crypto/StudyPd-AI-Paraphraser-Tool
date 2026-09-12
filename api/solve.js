// api/solve.js - POWERFUL VERSION
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { question, subject } = req.body;
  if (!question) return res.status(400).json({error:'No question'});

  const systemPrompt = `
You are StudyPad AI - Top SA varsity tutor for UFH, TUT, WSU, UNISA.
You solve ANY academic question: Math, Accounting, Law, Science, IT, Economics, Engineering.

RULES:
1. First detect subject automatically.
2. If Math/Accounting/Stats: Show formula, then substitution, then answer. Use simple steps.
3. If Law: Reference SA law, cases if possible.
4. If Essay: Give structure (Intro, 3 points, Conclusion) + references.
5. If MCQ: Give correct letter + why others wrong.
6. Always give FINAL ANSWER clearly at end.
7. Tone: Senior SA student who knows, not robot. Use "So basically", "This means".
8. If question is blurry from OCR, guess best meaning.
9. For calculations, double check.
10. Keep it short for exam - not textbook.

Format:
**Subject:** [detected]
**Understanding:** [1 line what question wants]
**Solution:**
Step 1...
Step 2...
**Final Answer:** ...

Question: ${question}
Subject hint: ${subject || 'auto-detect'}
`;

  try {
    // Use more powerful model for solving
    const r = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{ "Authorization": `Bearer ${process.env.OPENAI_KEY}`, "Content-Type":"application/json"},
      body: JSON.stringify({
        model: "gpt-4o", // POWERFUL - change from mini to 4o for solving
        messages: [
          {role:"system", content:"You are expert SA academic tutor. Be accurate, step-by-step, exam-ready."},
          {role:"user", content: systemPrompt}
        ],
        temperature: 0.3,
        max_tokens: 1200
      })
    });

    const d = await r.json();
    let answer = d.choices?.[0]?.message?.content || "Error solving.";

    // If math, add extra check
    if(question.match(/[0-9]+\s*[\+\-\*\/\=]/) && !answer.includes("Final Answer")){
      answer += "\n\n**Final Answer:** Check calculation above.";
    }

    return res.json({ 
      answer,
      subject: answer.match(/\*\*Subject:\*\* (.*)/)?.[1] || "General",
      powerful: true 
    });

  } catch(e){
    return res.status(500).json({error:e.message});
  }
}
