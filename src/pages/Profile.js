import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get('/api/interview/history');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.finished).length;
    const avgScore = totalSessions > 0 ? (totalScore / totalSessions).toFixed(1) : 0;

    const topicStats = sessions.reduce((acc, s) => {
        if (!acc[s.domain]) acc[s.domain] = { total: 0, score: 0 };
        acc[s.domain].total += 1;
        acc[s.domain].score += s.score || 0;
        return acc;
    }, {});

    const bestTopic = Object.entries(topicStats).sort((a, b) => b[1].score - a[1].score)[0];

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500">Loading profile...</div>
        </div>
    );

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

            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 flex items-center gap-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
                        <p className="text-gray-500">{user?.email}</p>
                        <span className="mt-2 inline-block bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full font-medium">
                            Interview PrepPro User
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-1">{totalSessions}</div>
                        <div className="text-sm text-gray-500">Total Quizzes</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                        <div className="text-4xl font-bold text-green-600 mb-1">{totalScore}</div>
                        <div className="text-sm text-gray-500">Total Score</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                        <div className="text-4xl font-bold text-purple-600 mb-1">{avgScore}</div>
                        <div className="text-sm text-gray-500">Avg Score / Quiz</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                        <div className="text-4xl font-bold text-yellow-500 mb-1">{completedSessions}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                    </div>
                </div>

                {bestTopic && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <h3 className="font-bold text-gray-800 mb-4">Topic Performance</h3>
                        <div className="space-y-3">
                            {Object.entries(topicStats).sort((a, b) => b[1].score - a[1].score).map(([topic, stats]) => (
                                <div key={topic} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-700 w-32">{topic}</span>
                                        <div className="flex-1 bg-gray-100 rounded-full h-2 w-40">
                                            <div className="bg-blue-600 h-2 rounded-full"
                                                 style={{ width: `${Math.min((stats.score / (bestTopic[1].score || 1)) * 100, 100)}%` }} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-gray-700">{stats.score} pts</span>
                                        <span className="text-xs text-gray-400 ml-2">{stats.total} quizzes</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
                    {sessions.length === 0 ? (
                        <p className="text-gray-400 text-sm">No quizzes taken yet</p>
                    ) : (
                        <div className="space-y-3">
                            {sessions.slice(0, 5).map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <span className="font-medium text-gray-700 text-sm">{s.domain}</span>
                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                            s.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                                s.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>{s.difficulty}</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{s.score} pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={() => navigate('/')}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                        Start New Quiz
                    </button>
                    <button onClick={() => { logout(); navigate('/login'); }}
                            className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}