import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/users/login', { email, password });
            const userData = {
                id: res.data.userId,
                name: res.data.name,
                email: res.data.email,
            };
            login(userData, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <nav className="px-6 py-4 flex justify-between items-center max-w-6xl mx-auto">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                    <span className="font-bold text-gray-800 text-lg">Interview PrepPro</span>
                </div>
                <Link to="/register">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                        Get Started Free
                    </button>
                </Link>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row items-center gap-16">
                <div className="flex-1 text-center lg:text-left">
                    <div className="inline-block bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                        AI-Powered Interview Preparation
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
                        Ace Your Next
                        <span className="text-blue-600"> Technical </span>
                        Interview
                    </h1>
                    <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                        Practice MCQs, solve coding problems, take mock interviews, and get instant AI feedback — all in one place.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {[
                            { icon: '📝', title: 'MCQ Practice', desc: 'Test your knowledge' },
                            { icon: '💻', title: 'Coding Problems', desc: 'Solve real problems' },
                            { icon: '🤖', title: 'Mock Interview', desc: 'AI-powered sessions' },
                            { icon: '📊', title: 'Track Progress', desc: 'Leaderboard & stats' },
                        ].map((f, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">{f.title}</div>
                                    <div className="text-xs text-gray-500">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
                        <p className="text-gray-500 text-sm mb-6">Sign in to continue your prep</p>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password" value={password} onChange={e => setPassword(e.target.value)} required
                                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button type="submit" disabled={loading}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-gray-500 mt-6">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-blue-600 hover:underline font-medium">Register free</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}