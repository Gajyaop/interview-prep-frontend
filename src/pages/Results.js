import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Results() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { sessionId } = state || {};

    const [summary, setSummary] = useState(null);
    const [review, setReview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReview, setShowReview] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!sessionId) { navigate('/'); return; }
        loadResults();
    }, []);

    const loadResults = async () => {
        try {
            const [sumRes, revRes] = await Promise.all([
                api.get(`/api/interview/${sessionId}/summary`),
                api.get(`/api/interview/${sessionId}/review`),
            ]);
            setSummary(sumRes.data);
            setReview(revRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500 text-lg">Loading results...</div>
        </div>
    );

    const percentage = summary && summary.totalQuestions > 0
        ? Math.round((summary.correct / summary.totalQuestions) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                    <span className="font-bold text-gray-800 text-lg">Interview PrepPro</span>
                </div>
                <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline font-medium">
                    Back to Dashboard
                </button>
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 text-center">
                    <div className={`text-6xl font-bold mb-2 ${
                        percentage >= 70 ? 'text-green-500' : percentage >= 40 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                        {percentage}%
                    </div>
                    <p className="text-gray-500 text-lg mb-6">
                        {percentage >= 70 ? 'Great job!' : percentage >= 40 ? 'Good effort!' : 'Keep practicing!'}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-gray-800">{summary?.totalQuestions}</div>
                            <div className="text-xs text-gray-500 mt-1">Total</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-green-600">{summary?.correct}</div>
                            <div className="text-xs text-gray-500 mt-1">Correct</div>
                        </div>
                        <div className="bg-red-50 rounded-xl p-4">
                            <div className="text-2xl font-bold text-red-500">{(summary?.attempted || 0) - (summary?.correct || 0)}</div>
                            <div className="text-xs text-gray-500 mt-1">Wrong</div>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                        Topic: <span className="font-medium text-gray-700">{summary?.domain}</span> •
                        Difficulty: <span className="font-medium text-gray-700">{summary?.difficulty}</span> •
                        Score: <span className="font-medium text-gray-700">{summary?.score} pts</span>
                    </div>
                </div>

                <button onClick={() => setShowReview(!showReview)}
                        className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition mb-4">
                    {showReview ? 'Hide Review' : 'Review Answers'}
                </button>

                {showReview && review.map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                        <p className="font-medium text-gray-800 mb-4">
                            <span className="text-gray-400 mr-2">Q{i + 1}.</span>{item.questionText}
                        </p>
                        <div className="space-y-2 mb-3">
                            {['A', 'B', 'C', 'D'].map(opt => {
                                const text = item[`option${opt}`];
                                if (!text) return null;
                                let cls = 'px-3 py-2 rounded-lg text-sm ';
                                if (opt === item.correctAnswer) cls += 'bg-green-50 text-green-700 font-medium';
                                else if (opt === item.selectedAnswer && !item.correct) cls += 'bg-red-50 text-red-600';
                                else cls += 'text-gray-600';
                                return (
                                    <div key={opt} className={cls}>
                                        <span className="font-bold mr-1">{opt}.</span> {text}
                                        {opt === item.correctAnswer && <span className="ml-2 text-green-600">✓ Correct</span>}
                                        {opt === item.selectedAnswer && !item.correct && <span className="ml-2 text-red-500">✗ Your answer</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                <button onClick={() => navigate('/')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition mt-2">
                    Start New Quiz
                </button>
            </div>
        </div>
    );
}