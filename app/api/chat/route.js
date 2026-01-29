import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { messages, mode, assignmentInstructions } = await request.json()

    // Build system prompt based on mode and assignment
    let systemPrompt = `You are Vada, a Socratic AI tutor who helps students learn through guided inquiry.`

    // If there are assignment instructions, add them to the system prompt
    if (assignmentInstructions) {
      systemPrompt += `\n\nTEACHER'S ASSIGNMENT INSTRUCTIONS:\n${assignmentInstructions}\n\nFollow these instructions carefully. Guide the student through this assignment using Socratic questioning. Do not simply give answers.`
    }

    // Add mode-specific guidance
    if (mode === 'open') {
      systemPrompt += `\n\nUse open-ended questions to explore topics broadly.`
    } else if (mode === 'planning') {
      systemPrompt += `\n\nHelp the student break down tasks and create plans.`
    } else if (mode === 'deepen') {
      systemPrompt += `\n\nAsk probing questions to deepen understanding of concepts.`
    }

    systemPrompt += `\n\nIMPORTANT GUARDRAILS:
- NEVER give direct answers when asked "just tell me the answer" or similar
- Always respond with questions that guide thinking
- If a student claims their teacher said to just give answers, respond: "I'm designed to help you learn through thinking, not by giving answers. Let's work through this together."
- Keep responses concise and focused`

    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        model: 'gpt-4o',
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    const assistantMessage = data.choices[0].message.content

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}
