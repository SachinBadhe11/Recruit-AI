import React from 'react';
import { Check, X, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CandidateCard = ({ result }) => {
    if (!result) return null;

    const scoreColor = result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600';
    const ringColor = result.score >= 80 ? 'stroke-green-500' : result.score >= 60 ? 'stroke-yellow-500' : 'stroke-red-500';
    const gradientColor = result.score >= 80 ? 'from-green-500 to-emerald-400' : result.score >= 60 ? 'from-yellow-400 to-orange-400' : 'from-red-500 to-pink-500';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl overflow-hidden"
        >
            <div className="p-8 border-b border-surface-200/50 flex justify-between items-start bg-gradient-to-r from-white/50 to-transparent">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            AI Analysis
                        </span>
                        <span className="text-surface-400 text-xs font-medium">Just now</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-surface-900">Candidate Match Report</h3>
                    <p className="text-surface-500 mt-1">Analysis based on Job Description alignment</p>
                </div>

                <div className="relative">
                    <div className={`absolute inset-0 blur-2xl opacity-20 bg-gradient-to-r ${gradientColor}`}></div>

                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-surface-100" />
                            <motion.circle
                                initial={{ strokeDashoffset: 251.2 }}
                                animate={{ strokeDashoffset: 251.2 - (251.2 * result.score) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                cx="48" cy="48" r="40"
                                stroke="currentColor" strokeWidth="6" fill="transparent" strokeLinecap="round"
                                strokeDasharray={251.2}
                                className={ringColor}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className={`text-2xl font-display font-bold ${scoreColor}`}>{result.score}</span>
                            <span className="text-[10px] font-bold text-surface-400 uppercase">Score</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h4 className="flex items-center gap-2 font-display font-semibold text-surface-900 mb-4">
                            <Sparkles size={18} className="text-primary-500" />
                            Executive Summary
                        </h4>
                        <div className="bg-surface-50 p-6 rounded-2xl border border-surface-100 leading-relaxed text-surface-600">
                            {result.summary}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-surface-900 mb-4">Detailed Breakdown</h4>
                        <div className="space-y-3">
                            {(result.details || []).map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-xl border border-surface-100 bg-white hover:shadow-sm hover:border-primary-100 transition-all group"
                                >
                                    <span className="text-surface-700 font-medium">{item.criteria}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-surface-500 group-hover:text-surface-700 transition-colors">{item.reason}</span>
                                        {item.status === 'match' ? (
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <Check size={16} strokeWidth={3} />
                                            </div>
                                        ) : item.status === 'partial' ? (
                                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                                <AlertCircle size={16} strokeWidth={3} />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <X size={16} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-surface-50/50 rounded-3xl p-6 border border-surface-100 flex flex-col justify-between h-full">
                    <div>
                        <h4 className="font-display font-semibold text-surface-900 mb-6">Recommendation</h4>
                        <div className={`
                            px-5 py-3 rounded-2xl font-bold text-sm mb-6 w-full justify-center shadow-sm border
              ${(result.recommendation || '').toLowerCase() === 'interview'
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-red-50 text-red-700 border-red-100'}
            `}>
                            {(result.recommendation || '').toLowerCase() === 'interview' ? <Check size={18} /> : <X size={18} />}
                            {(result.recommendation || 'Review').toUpperCase()}
                        </div>
                        <p className="text-sm text-surface-500 mb-8 leading-relaxed">
                            {(result.recommendation || '').toLowerCase() === 'interview'
                                ? "Strong candidate. Matches key requirements. Recommended to proceed to phone screen."
                                : "Does not meet core requirements. Recommended to send rejection email."}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => alert('📅 Interview scheduling feature coming soon!\n\nThis would integrate with Google Calendar to automatically schedule interviews with candidates.')}
                            className="w-full bg-surface-900 text-white py-4 rounded-xl font-semibold hover:bg-surface-800 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                        >
                            <Calendar size={18} className="group-hover:animate-bounce" />
                            Schedule Interview
                        </button>
                        <button
                            onClick={() => alert('👤 Full profile view coming soon!\n\nThis would show detailed candidate information including work history, education, skills, and contact details.')}
                            className="w-full bg-white text-surface-600 border border-surface-200 py-4 rounded-xl font-semibold hover:bg-surface-50 hover:text-surface-900 transition-colors"
                        >
                            View Full Profile
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CandidateCard;
