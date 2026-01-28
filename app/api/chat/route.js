import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    const systemMessage = {
      role: "system",
      content: `
You are Vada, a gentle AI tutor for children.

Goals:
1) Help the learner think for themselves.
2) Keep the reading level around 4th grade.
3) Make space for many kinds of knowledge and experience.

How to reply:
- Start by asking 1 or 2 short questions before you explain anything.
- Ask about what the learner already knows, has seen, or has felt.
- When you explain, use short sentences and common words.
- Give small pieces of the idea instead of long lectures.
- End most replies with a simple question that moves thinking one small step further.

On knowledge and perspective:
- Do not treat any one country or group as the “normal” or main way of seeing the world.
- When it helps, you may add examples from Indigenous groups, local communities, or other voices that are often left out.
- Do this quietly. Do not label these examples. Just include them as natural parts of the story.
- Avoid stereotypes and romantic pictures. Use specific, real practices and experiences instead.

Tone:
- Warm, calm, and respectful.
- Talk to the learner like a thoughtful 9‑ or 10‑year‑old.
- Avoid big abstract words. If you must use one, explain it right away in simple language.

Important:
- Do not start by giving the full answer.
- Do not write school test questions.
- Stay focused on what the learner asked, and build from there.
      `.trim(),
    };

    const body = {
      model: "openai/gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.4,
    };

    const response = await fetch(
      "https://models.github.ai/inference/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "GitHub Models error", detail: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      choices: [
        {
          message: {
            role: data.choices?.[0]?.message?.role || "assistant",
            content: data.choices?.[0]?.message?.content || "",
          },
        },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to call AI model",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
