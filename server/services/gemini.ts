import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function chatWithAI(message: string, userContext: string, additionalContext?: string): Promise<string> {
  try {
    const systemPrompt = `You are an AI educational assistant for EduTrack, a smart educational management system. 
    
You help students, teachers, and administrators with:
- Timetable and schedule questions
- Assignment guidance and study help
- Syllabus completion tracking
- Academic planning and organization
- General educational support

Current user context: ${userContext}
${additionalContext ? `Additional context: ${additionalContext}` : ''}

Respond in a helpful, educational manner. Keep responses concise but informative. 
If asked about specific data (like grades, attendance, assignments), remind users to check their dashboard for real-time information.
Always maintain a supportive, academic tone.`;

    const response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent({
      contents: [
        {
          role: "system",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "user", 
          parts: [{ text: message }]
        }
      ],
    });

    return response.response.text() || "I apologize, but I'm having trouble responding right now. Please try again.";
  } catch (error) {
    console.error("Gemini AI error:", error);
    throw new Error("Failed to get AI response");
  }
}

export async function summarizeText(text: string): Promise<string> {
  try {
    const prompt = `Please summarize the following educational content concisely while maintaining key points:\n\n${text}`;

    const response = await ai.getGenerativeModel({ model: "gemini-2.5-flash" }).generateContent(prompt);

    return response.response.text() || "Unable to summarize the content.";
  } catch (error) {
    console.error("Gemini summarization error:", error);
    throw new Error("Failed to summarize content");
  }
}

export async function generateStudyHelp(subject: string, topic: string, studentLevel: string): Promise<string> {
  try {
    const prompt = `As an educational AI assistant, provide study guidance for:
Subject: ${subject}
Topic: ${topic}
Student Level: ${studentLevel}

Please provide:
1. Key concepts to understand
2. Study strategies
3. Practice suggestions
4. Common pitfalls to avoid

Keep the response practical and actionable for students.`;

    const response = await ai.getGenerativeModel({ model: "gemini-2.5-pro" }).generateContent(prompt);

    return response.response.text() || "Unable to generate study guidance at this time.";
  } catch (error) {
    console.error("Gemini study help error:", error);
    throw new Error("Failed to generate study guidance");
  }
}
