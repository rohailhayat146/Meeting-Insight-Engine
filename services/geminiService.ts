import { GoogleGenAI, Type } from "@google/genai";
import { MeetingAnalysis, DecisionStatus, PriorityLevel, SentimentType, ConfidenceLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an enterprise-grade AI Meeting Intelligence Engine.
Analyze the provided meeting content (transcript or notes) and produce structured insights.
Strictly adhere to the JSON schema provided.
Do not hallucinate. If info is missing, use "Unassigned" or "To be determined".
Maintain a professional, objective tone.

For decisions: Wording must be tight, concise, and action-oriented. Avoid fluff.
For every decision, you MUST assess a Confidence Level (High/Medium/Low) based on the clarity of the agreement and any mentioned dependencies.

For Productivity Insights: Ensure you include one specific execution-oriented insight connecting upstream dependencies (like design readiness) to fixed deadlines if relevant to the discussion.

You MUST identify the single most critical "Next Execution Checkpoint". This describes exactly what needs to happen next to move the project forward and when.
`;

export const analyzeMeeting = async (transcript: string): Promise<MeetingAnalysis> => {
  const modelId = "gemini-3-flash-preview"; 

  const response = await ai.models.generateContent({
    model: modelId,
    contents: transcript,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meetingType: { type: Type.STRING, description: "e.g., Informational, Decision-making, Brainstorming" },
          sentiment: { 
            type: Type.STRING, 
            enum: [SentimentType.Positive, SentimentType.Neutral, SentimentType.Tense, SentimentType.Conflicted] 
          },
          sentimentExplanation: { type: Type.STRING },
          executiveSummary: { type: Type.STRING, description: "Concise, executive-ready summary." },
          decisions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Tight, concise decision text." },
                status: { 
                  type: Type.STRING, 
                  enum: [DecisionStatus.Final, DecisionStatus.Tentative, DecisionStatus.NeedsApproval] 
                },
                confidenceLevel: {
                  type: Type.STRING,
                  enum: [ConfidenceLevel.High, ConfidenceLevel.Medium, ConfidenceLevel.Low],
                  description: "Confidence based on clarity and dependencies."
                }
              },
              required: ["text", "status", "confidenceLevel"]
            }
          },
          actionItems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                owner: { type: Type.STRING },
                priority: { 
                  type: Type.STRING, 
                  enum: [PriorityLevel.Low, PriorityLevel.Medium, PriorityLevel.High] 
                },
                deadline: { type: Type.STRING, description: "Suggested date or 'ASAP'" }
              },
              required: ["task", "owner", "priority", "deadline"]
            }
          },
          risks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                issue: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["issue", "explanation"]
            }
          },
          productivityInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "2-3 improvements, including one on design readiness vs deadlines."
          },
          nextExecutionCheckpoint: {
             type: Type.OBJECT,
             properties: {
                description: { type: Type.STRING, description: "What must be confirmed or decided next." },
                date: { type: Type.STRING, description: "When this must happen by." }
             },
             required: ["description", "date"]
          }
        },
        required: [
          "meetingType", 
          "sentiment", 
          "sentimentExplanation", 
          "executiveSummary", 
          "decisions", 
          "actionItems", 
          "risks", 
          "productivityInsights",
          "nextExecutionCheckpoint"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as MeetingAnalysis;
};
