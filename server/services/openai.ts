import OpenAI from "openai";
import type { Feedback } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY_2 || process.env.OPENAI_API_KEY || "default_key"
});

export async function gradePhysicsExample(
  lawNumber: number,
  title: string,
  actionForce: string,
  reactionForce: string,
  explanation: string
): Promise<{ score: number; feedback: Feedback }> {
  try {
    const lawDescriptions = {
      1: "Newton's First Law (Law of Inertia): An object at rest stays at rest and an object in motion stays in motion unless acted upon by an unbalanced force.",
      2: "Newton's Second Law: F = ma - The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass.",
      3: "Newton's Third Law: For every action, there is an equal and opposite reaction. Forces always come in pairs."
    };

    const prompt = `You are a physics teacher grading a student's example of ${lawDescriptions[lawNumber as keyof typeof lawDescriptions]}.

Student's submission:
- Example Title: ${title}
- Action Force: ${actionForce}
- Reaction Force: ${reactionForce}
- Explanation: ${explanation}

Grade this submission on a scale of 1-10 and provide detailed feedback. Consider:
1. Accuracy of the physics concepts
2. Clarity of the example
3. Correct identification of forces (for law 3) or proper application of the law
4. Quality of explanation

Respond with JSON in this exact format:
{
  "score": number (1-10),
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "comments": "detailed constructive feedback"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert physics teacher who provides constructive, encouraging feedback to students learning Newton's laws of motion."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate and sanitize the response
    const score = Math.max(1, Math.min(10, Math.round(result.score || 5)));
    const feedback: Feedback = {
      score,
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 5) : ["Good effort on this example"],
      improvements: Array.isArray(result.improvements) ? result.improvements.slice(0, 3) : ["Consider reviewing the physics concepts"],
      comments: typeof result.comments === 'string' ? result.comments : "Keep practicing to improve your understanding of physics concepts."
    };

    return { score, feedback };
  } catch (error) {
    console.error("OpenAI grading error:", error);
    
    // Fallback response if OpenAI fails
    return {
      score: 7,
      feedback: {
        score: 7,
        strengths: ["You provided a complete example", "Good effort in explaining the concept"],
        improvements: ["AI grading temporarily unavailable - please try again later"],
        comments: "Your submission has been received. Due to technical issues with the AI grading system, please try resubmitting for detailed feedback."
      }
    };
  }
}
