import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TOPICS = [
    'Java', 'Python', 'C++',
    'Data Structures', 'Algorithms',
    'OOP', 'SQL', 'DBMS',
    'Operating Systems', 'Computer Networks',
    'Aptitude', 'Logical Reasoning'
];

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [topic, setTopic] = useState('Java');
    const [difficulty, setDifficulty] = useState('EASY');
    const [questionCount, setQuestionCount] = useState(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generateMsg, setGenerateMsg] = useState('');
    const [sessions, setSessions] = useState([]);
    const [showQuizConfig, setShowQuizConfig] = useState(false);
    const quizConfigRef = useRef(null);

    useEffect(() => {
        loadRecentStats();
    }, []);

    const loadRecentStats = async () => {
        try {
            const res = await api.get('/api/interview/history');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const startQuiz = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/interview/start', {
                domain: topic,
                difficulty: difficulty,
            });
            const sessionId = res.data.id;
            await api.get(`/api/interview/${sessionId}/mcq?count=${questionCount}`);
            navigate('/quiz', { state: { sessionId, topic, difficulty } });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to start quiz. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateQuestions = async () => {
        setGenerateMsg('');
        setGenerating(true);
        try {
            const res = await api.post('/api/ai/generate', {
                topic,
                difficulty,
                count: 10,
            });
            setGenerateMsg(`✓ Generated ${res.data.generated} new questions for ${topic} ${difficulty}`);
        } catch (err) {
            setGenerateMsg('Failed to generate questions. Try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleMCQClick = () => {
        setShowQuizConfig(prev => !prev);
        setTimeout(() => {
            quizConfigRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">IP</span>
                        </div>
                        <span className="font-bold text-gray-800 text-lg">Interview Prep</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/history')} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">History</button>
                        <button onClick={() => navigate('/leaderboard')} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">Leaderboard</button>
                        <button onClick={() => navigate('/profile')} className="text-sm text-gray-600 hover:text-blue-600 font-medium transition">Profile</button>
                        <button onClick={() => navigate('/feedback')} className="text-sm text-gray-600 hover:text-pink-600 font-medium transition">Feedback</button>
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/profile')}>
                            <span className="text-white font-bold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
                        </div>
                        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium transition">Logout</button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Welcome section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">What would you like to practice today?</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-blue-600">{sessions.length}</div>
                        <div className="text-sm text-gray-500 mt-1">Quizzes Taken</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-green-600">{totalScore}</div>
                        <div className="text-sm text-gray-500 mt-1">Total Score</div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-purple-600">
                            {sessions.length > 0 ? (totalScore / sessions.length).toFixed(1) : 0}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Avg Score</div>
                    </div>
                </div>

                {/* Main feature cards */}
                <h2 className="text-lg font-bold text-gray-700 mb-4">Choose your practice mode</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

                    {/* MCQ Card */}
                    <div
                        className={`bg-white rounded-2xl p-6 shadow-sm border transition cursor-pointer hover:shadow-md ${
                            showQuizConfig ? 'border-blue-400' : 'border-gray-100 hover:border-blue-200'
                        }`}
                        onClick={handleMCQClick}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📝</div>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Most Popular</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">MCQ Quiz</h3>
                        <p className="text-gray-500 text-sm mb-4">Test your knowledge with multiple choice questions across various topics. Get instant feedback and track your progress.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Java</span>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">Python</span>
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">+10 more</span>
                        </div>
                        <div className="mt-3 text-xs text-blue-500 font-medium">
                            {showQuizConfig ? '▲ Hide config' : '▼ Click to configure and start'}
                        </div>
                    </div>

                    {/* Coding Card */}
                    <div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition cursor-pointer"
                        onClick={() => navigate('/coding')}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">💻</div>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">New</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Coding Practice</h3>
                        <p className="text-gray-500 text-sm mb-4">Solve real coding problems with our built-in code editor. Write, run, and get AI-powered code review feedback.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">Monaco Editor</span>
                            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full">AI Review</span>
                        </div>
                    </div>

                    {/* Mock Interview Card */}
                    <div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition cursor-pointer"
                        onClick={() => navigate('/mock-interview')}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🤖</div>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">AI Powered</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Mock Interview</h3>
                        <p className="text-gray-500 text-sm mb-4">Simulate a real technical interview with AI. Answer questions, get instant feedback, and receive an overall assessment.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">Real Questions</span>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">Instant Feedback</span>
                        </div>
                    </div>

                    {/* Leaderboard Card */}
                    <div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-200 transition cursor-pointer"
                        onClick={() => navigate('/leaderboard')}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">🏆</div>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">Compete</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Leaderboard</h3>
                        <p className="text-gray-500 text-sm mb-4">See how you rank against other users. Compete for the top spot and track your improvement over time.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full">Rankings</span>
                            <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-1 rounded-full">Top Performers</span>
                        </div>
                    </div>

                    {/* Feedback Card */}
                    <div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-pink-200 transition cursor-pointer md:col-span-2"
                        onClick={() => navigate('/feedback')}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-2xl">💬</div>
                            <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">Help Us Improve</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Send Feedback</h3>
                        <p className="text-gray-500 text-sm mb-4">Share your thoughts, report bugs, or suggest new features. Your feedback helps us make Interview Prep better for everyone.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">Bug Report</span>
                            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">Feature Request</span>
                            <span className="text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-full">UI/UX Improvement</span>
                        </div>
                    </div>

                    {/* Resume Analyzer Card */}
                    <div
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition cursor-pointer md:col-span-2"
                        onClick={() => navigate('/resume')}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">📄</div>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">AI Powered</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Resume Analyzer</h3>
                        <p className="text-gray-500 text-sm mb-4">Upload your resume and get instant AI feedback on how to improve it for tech jobs. Get a score, identify gaps, and receive actionable suggestions.</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">ATS Score</span>
                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">Strengths & Weaknesses</span>
                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">Improvements</span>
                        </div>
                    </div>
                </div>

                {/* MCQ Config Panel */}
                {showQuizConfig && (
                    <div ref={quizConfigRef} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 text-lg">Configure your MCQ Quiz</h3>
                            <button onClick={() => setShowQuizConfig(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                                <div className="flex flex-wrap gap-2">
                                    {TOPICS.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTopic(t)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                                topic === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                                <div className="flex gap-2">
                                    {DIFFICULTIES.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                                difficulty === d
                                                    ? d === 'EASY' ? 'bg-green-500 text-white'
                                                        : d === 'MEDIUM' ? 'bg-yellow-500 text-white'
                                                            : 'bg-red-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Questions: {questionCount}
                                </label>
                                <input
                                    type="range" min="3" max="10" value={questionCount}
                                    onChange={e => setQuestionCount(Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>3</span><span>10</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={startQuiz}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Starting...' : '▶ Start Quiz'}
                                </button>
                                <button
                                    onClick={generateQuestions}
                                    disabled={generating}
                                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {generating ? 'Generating...' : '✦ Generate AI Questions'}
                                </button>
                            </div>

                            {generateMsg && (
                                <div className={`px-4 py-3 rounded-lg text-sm font-medium text-center ${
                                    generateMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {generateMsg}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                {sessions.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-700">Recent Activity</h3>
                            <button onClick={() => navigate('/history')} className="text-sm text-blue-600 hover:underline">View all</button>
                        </div>
                        <div className="space-y-3">
                            {sessions.slice(0, 3).map((s, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-sm">📝</div>
                                        <div>
                                            <div className="font-medium text-gray-700 text-sm">{s.domain}</div>
                                            <div className="text-xs text-gray-400">{s.difficulty}</div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-blue-600">{s.score} pts</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}