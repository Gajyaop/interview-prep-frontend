import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function History() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await api.get('/api/interview/history');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score, total) => {
        if (!total) return 'text-gray-500';
        const pct = (score / total) * 100;
        if (pct >= 70) return 'text-green-600';
        if (pct >= 40) return 'text-yellow-600';
        return 'text-red-500';
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toUpperCase()) {
            case 'EASY': return 'bg-green-100 text-green-700';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
            case 'HARD': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500 text-lg">Loading history...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Interview Prep</h1>
                <button
                    onClick={() => navigate('/')}
                    className="text-sm text-blue-600 hover:underline font-medium"
                >
                    Back to Dashboard
                </button>
            </nav>

            <div className="max-w-3xl mx-auto px-4 py-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz History</h2>
                <p className="text-gray-500 mb-8">All your past quiz attempts</p>

                {sessions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="text-gray-500 text-lg">No quizzes taken yet</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition"
                        >
                            Start your first quiz
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {sessions.map((session, i) => (
                            <div
                                key={session.id}
                                className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between hover:shadow-md transition cursor-pointer"
                                onClick={() => navigate('/results', { state: { sessionId: session.id } })}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-lg">#{sessions.length - i}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-800">{session.domain}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(session.difficulty)}`}>
                        {session.difficulty}
                      </span>
                                            {session.finished && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                          Completed
                        </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-400">{formatDate(session.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold ${getScoreColor(session.score, 10)}`}>
                                        {session.score} pts
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">Click to review</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}