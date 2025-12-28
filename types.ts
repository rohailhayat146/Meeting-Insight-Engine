export enum DecisionStatus {
  Final = "Final decision",
  Tentative = "Tentative decision",
  NeedsApproval = "Needs further approval"
}

export enum ConfidenceLevel {
  High = "High",
  Medium = "Medium",
  Low = "Low"
}

export enum PriorityLevel {
  Low = "Low",
  Medium = "Medium",
  High = "High"
}

export enum SentimentType {
  Positive = "Positive",
  Neutral = "Neutral",
  Tense = "Tense",
  Conflicted = "Conflicted"
}

export interface Decision {
  text: string;
  status: DecisionStatus;
  confidenceLevel: ConfidenceLevel;
}

export interface ActionItem {
  task: string;
  owner: string;
  priority: PriorityLevel;
  deadline: string;
}

export interface Risk {
  issue: string;
  explanation: string;
}

export interface NextExecutionCheckpoint {
  description: string;
  date: string;
}

export interface MeetingAnalysis {
  meetingType: string;
  sentiment: SentimentType;
  sentimentExplanation: string;
  executiveSummary: string;
  decisions: Decision[];
  actionItems: ActionItem[];
  risks: Risk[];
  productivityInsights: string[];
  nextExecutionCheckpoint: NextExecutionCheckpoint;
}