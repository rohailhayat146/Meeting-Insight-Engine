import React from 'react';
import { MeetingAnalysis, DecisionStatus, PriorityLevel, SentimentType, ConfidenceLevel } from '../types';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  Copy,
  ArrowLeft,
  Flag
} from 'lucide-react';

interface AnalysisViewProps {
  data: MeetingAnalysis;
  onReset: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ data, onReset }) => {
  
  const getPriorityColor = (p: PriorityLevel) => {
    switch (p) {
      case PriorityLevel.High: return 'text-red-700 bg-red-50 border-red-200';
      case PriorityLevel.Medium: return 'text-amber-700 bg-amber-50 border-amber-200';
      case PriorityLevel.Low: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const getDecisionBadge = (s: DecisionStatus) => {
    switch (s) {
      case DecisionStatus.Final: return 'bg-green-100 text-green-800 border-green-200';
      case DecisionStatus.Tentative: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case DecisionStatus.NeedsApproval: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getConfidenceColor = (c: ConfidenceLevel) => {
    switch (c) {
      case ConfidenceLevel.High: return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case ConfidenceLevel.Medium: return 'text-blue-700 bg-blue-50 border-blue-200';
      case ConfidenceLevel.Low: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getSentimentColor = (s: SentimentType) => {
    switch(s) {
      case SentimentType.Positive: return 'text-green-600';
      case SentimentType.Neutral: return 'text-slate-500';
      case SentimentType.Tense: return 'text-red-500';
      case SentimentType.Conflicted: return 'text-orange-500';
    }
  };

  const handleCopyReport = () => {
    const report = `
Meeting Type: ${data.meetingType}
Overall Sentiment: ${data.sentiment} (${data.sentimentExplanation})

Executive Summary:
${data.executiveSummary}

Decisions:
${data.decisions.map(d => `- ${d.text} [${d.status}] (Confidence: ${d.confidenceLevel})`).join('\n')}

Action Items:
${data.actionItems.map(a => `- ${a.task} | Owner: ${a.owner} | Priority: ${a.priority} | Due: ${a.deadline}`).join('\n')}

Ambiguities & Risks:
${data.risks.map(r => `- ${r.issue}: ${r.explanation}`).join('\n')}

Productivity Insights:
${data.productivityInsights.map(i => `- ${i}`).join('\n')}

Next Execution Checkpoint:
- ${data.nextExecutionCheckpoint.description} (Target: ${data.nextExecutionCheckpoint.date})
    `;
    navigator.clipboard.writeText(report);
    alert("Report copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onReset}
          className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Analyze New Meeting
        </button>
        <button 
          onClick={handleCopyReport}
          className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm font-medium text-sm"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Text Report
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Meeting Context */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4 text-indigo-600">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Meeting Type</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800 capitalize">{data.meetingType}</p>
        </div>

        {/* Sentiment */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center space-x-2 mb-4 text-indigo-600">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-semibold text-sm uppercase tracking-wide">Sentiment</h3>
          </div>
          <p className={`text-2xl font-bold capitalize ${getSentimentColor(data.sentiment)}`}>
            {data.sentiment}
          </p>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {data.sentimentExplanation}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-center space-y-3">
           <div className="flex justify-between items-center">
             <span className="text-slate-500 text-sm">Decisions</span>
             <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{data.decisions.length}</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-slate-500 text-sm">Action Items</span>
             <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{data.actionItems.length}</span>
           </div>
           <div className="flex justify-between items-center">
             <span className="text-slate-500 text-sm">Risks Detected</span>
             <span className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">{data.risks.length}</span>
           </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
          <FileText className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="font-semibold text-slate-800">Executive Summary</h2>
        </div>
        <div className="p-6 text-slate-700 leading-relaxed whitespace-pre-line">
          {data.executiveSummary}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Decisions */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <h2 className="font-semibold text-slate-800">Decisions Made</h2>
          </div>
          <div className="p-6 space-y-4 flex-grow">
            {data.decisions.length === 0 ? (
              <p className="text-slate-400 italic">No formal decisions detected.</p>
            ) : (
              data.decisions.map((decision, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors bg-slate-50/30">
                  <p className="text-slate-800 font-medium mb-3">{decision.text}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getDecisionBadge(decision.status)}`}>
                      {decision.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getConfidenceColor(decision.confidenceLevel)}`}>
                      Confidence: {decision.confidenceLevel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Risks */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            <h2 className="font-semibold text-slate-800">Ambiguities & Risks</h2>
          </div>
          <div className="p-6 space-y-4 flex-grow">
            {data.risks.length === 0 ? (
              <p className="text-slate-400 italic">No significant risks detected.</p>
            ) : (
              data.risks.map((risk, idx) => (
                <div key={idx} className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                  <p className="text-red-800 font-semibold text-sm mb-1">{risk.issue}</p>
                  <p className="text-slate-600 text-sm">{risk.explanation}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
          <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
          <h2 className="font-semibold text-slate-800">Action Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-3">Task</th>
                <th className="px-6 py-3">Owner</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.actionItems.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No action items detected.</td>
                </tr>
              ) : (
                data.actionItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{item.task}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2">
                          {item.owner.charAt(0)}
                        </div>
                        {item.owner}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{item.deadline}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Productivity Insights */}
       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
         <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
           ✨ Productivity Insights
         </h3>
         <ul className="space-y-2">
           {data.productivityInsights.map((insight, idx) => (
             <li key={idx} className="flex items-start text-indigo-800 text-sm">
               <span className="mr-2">•</span>
               {insight}
             </li>
           ))}
         </ul>
       </div>

      {/* Next Execution Checkpoint */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white border border-slate-700">
        <div className="flex items-center mb-4">
           <Flag className="w-5 h-5 text-indigo-400 mr-2" />
           <h2 className="font-semibold text-lg tracking-wide">Next Execution Checkpoint</h2>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <p className="text-slate-200 text-lg font-medium leading-relaxed">{data.nextExecutionCheckpoint.description}</p>
           <div className="bg-white/10 px-5 py-3 rounded-lg border border-white/20 whitespace-nowrap min-w-fit">
              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1">Target Date</span>
              <span className="font-bold text-white text-lg">{data.nextExecutionCheckpoint.date}</span>
           </div>
        </div>
      </div>

    </div>
  );
};

export default AnalysisView;