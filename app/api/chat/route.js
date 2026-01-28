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
      content:
        "You are a semi-Socratic learning companion. Ask short, targeted questions that help the learner think, but also offer brief explanations when they are stuck. Center Indigenous, Black, and other marginalized perspectives whenever they are relevant, and explicitly name whose knowledge or tradition you are drawing from. Avoid assuming Europe or the US as the default reference point; treat them as just one set of perspectives among many. When discussing history, science, or education, look for indigenous knowledge systems, local practices, community-based approaches, and relational ways of knowing. Be gentle but honest about colonialism, racism, and power when they matter for understanding a topic. Keep answers concise and concrete, and invite the learner to connect ideas to their lived experience.",
    };

    const body = {
      model: "openai/gpt-4o", // format from GitHub Models doc
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

