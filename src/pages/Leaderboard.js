import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Leaderboard() {
    const navigate = useNavigate();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const res = await api.get('/api/interview/leaderboard');
            setLeaders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getMedalColor = (index) => {
        if (index === 0) return 'text-yellow-500';
        if (index === 1) return 'text-gray-400';
        if (index === 2) return 'text-amber-600';
        return 'text-gray-300';
    };

    const getMedalEmoji = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500 text-lg">Loading leaderboard...</div>
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
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Leaderboard</h2>
                <p className="text-gray-500 mb-8">Top performers ranked by total score</p>

                {leaders.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <div className="text-5xl mb-4">🏆</div>
                        <p className="text-gray-500 text-lg">No scores yet</p>
                        <button onClick={() => navigate('/')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition">
                            Be the first!
                        </button>
                    </div>
                ) : (
                    <>
                        {leaders.length >= 3 && (
                            <div className="flex items-end justify-center gap-4 mb-8">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🥈</div>
                                    <div className="bg-white rounded-2xl shadow-sm p-4 w-28">
                                        <div className="font-bold text-gray-800 text-sm truncate">{leaders[1]?.name}</div>
                                        <div className="text-gray-500 text-xs mt-1">{leaders[1]?.totalScore} pts</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl mb-2">🥇</div>
                                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl shadow-sm p-4 w-32">
                                        <div className="font-bold text-gray-800 truncate">{leaders[0]?.name}</div>
                                        <div className="text-yellow-600 font-bold mt-1">{leaders[0]?.totalScore} pts</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🥉</div>
                                    <div className="bg-white rounded-2xl shadow-sm p-4 w-28">
                                        <div className="font-bold text-gray-800 text-sm truncate">{leaders[2]?.name}</div>
                                        <div className="text-gray-500 text-xs mt-1">{leaders[2]?.totalScore} pts</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rank</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Best Topic</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quizzes</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {leaders.map((leader, i) => (
                                    <tr key={i} className={`hover:bg-gray-50 transition ${i < 3 ? 'font-medium' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className={`text-xl ${getMedalColor(i)}`}>{getMedalEmoji(i)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-800">{leader.name}</div>
                                            <div className="text-xs text-gray-400">{leader.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">{leader.bestTopic}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{leader.totalSessions}</td>
                                        <td className="px-6 py-4 text-right">
                                                <span className={`text-lg font-bold ${
                                                    i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-700'
                                                }`}>{leader.totalScore}</span>
                                            <span className="text-gray-400 text-sm ml-1">pts</span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}