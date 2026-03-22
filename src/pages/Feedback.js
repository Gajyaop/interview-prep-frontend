import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SUBJECTS = ['General Feedback', 'Bug Report', 'Feature Request', 'UI/UX Improvement', 'Question Quality', 'Other'];

export default function Feedback() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', rating: 5 });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/api/feedback', { ...form, rating: Number(form.rating) });
            setSubmitted(true);
        } catch (err) {
            setError('Failed to submit feedback. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center max-w-md">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank you!</h2>
                    <p className="text-gray-500 mb-6">Your feedback has been submitted!</p>
                    <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

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
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Share Your Feedback</h1>
                    <p className="text-gray-500 mb-2">Help us improve Interview Prep for everyone</p>
                    <p className="text-sm text-gray-400">
                        Built by <span className="font-medium text-blue-600">Harsh</span> — always open to feedback
                    </p>
                </div>

                {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} required
                                       className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} required
                                       className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       placeholder="you@example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS.map(s => (
                                    <button type="button" key={s}
                                            onClick={() => setForm({ ...form, subject: s })}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${form.subject === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating: {['😞', '😕', '😐', '😊', '🤩'][form.rating - 1]} {form.rating}/5
                            </label>
                            <input type="range" name="rating" min="1" max="5" value={form.rating} onChange={handleChange} className="w-full accent-blue-600" />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                                      className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                      placeholder="Tell us what you think..." />
                        </div>

                        <button type="submit" disabled={loading || !form.subject || !form.message}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg">
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                    <div className="text-4xl mb-3">📧</div>
                    <h3 className="font-bold text-gray-800 text-lg mb-2">Contact Me Directly</h3>
                    <p className="text-gray-500 text-sm mb-5">Have a question or want to collaborate? Reach out directly.</p>
                    <a href="mailto:hp76376@gmail.com"
                       className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                        <span>hp76376@gmail.com</span>
                    </a>
                    <p className="mt-4 text-xs text-gray-400">I typically respond within 24 hours</p>
                </div>
            </div>
        </div>
    );
}