import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Quiz() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { sessionId, topic, difficulty } = state || {};

    const [question, setQuestion] = useState(null);
    const [progress, setProgress] = useState(null);
    const [selected, setSelected] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const OPTIONS = ['A', 'B', 'C', 'D'];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!sessionId) { navigate('/'); return; }
        fetchNext();
    }, []);

    const fetchNext = async () => {
        setLoading(true);
        setSelected('');
        setResult(null);
        setError('');
        try {
            const [qRes, pRes] = await Promise.all([
                api.get(`/api/interview/${sessionId}/next`),
                api.get(`/api/interview/${sessionId}/progress`),
            ]);
            setQuestion(qRes.data);
            setProgress(pRes.data);
        } catch (err) {
            if (err.response?.status === 400) {
                finishAndNavigate();
            } else {
                setError('Failed to load question.');
            }
        } finally {
            setLoading(false);
        }
    };

    const finishAndNavigate = async () => {
        try { await api.post(`/api/interview/${sessionId}/finish`); } catch (e) {}
        navigate('/results', { state: { sessionId } });
    };

    const submitAnswer = async () => {
        if (!selected) return;
        setSubmitting(true);
        try {
            const res = await api.post(`/api/interview/${sessionId}/submit`, {
                questionId: question.questionId,
                selectedAnswer: selected,
            });
            setResult(res.data);
            const pRes = await api.get(`/api/interview/${sessionId}/progress`);
            setProgress(pRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const getOptionText = (q, opt) => {
        if (opt === 'A') return q.optionA;
        if (opt === 'B') return q.optionB;
        if (opt === 'C') return q.optionC;
        if (opt === 'D') return q.optionD;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500 text-lg">Loading question...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                    <span className="font-bold text-gray-800 text-lg">Interview PrepPro</span>
                </div>
                {progress && (
                    <span className="text-sm text-gray-500">
                        {progress.attempted} / {progress.total} answered • Score: {progress.score}
                    </span>
                )}
            </nav>

            <div className="max-w-2xl mx-auto px-4 py-10">
                {progress && (
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>{topic} — {difficulty}</span>
                            <span>{progress.attempted}/{progress.total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all"
                                 style={{ width: `${(progress.attempted / progress.total) * 100}%` }} />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
                )}

                {question && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <p className="text-lg font-semibold text-gray-800 mb-6">{question.questionText}</p>

                        <div className="space-y-3 mb-6">
                            {OPTIONS.map(opt => {
                                const text = getOptionText(question, opt);
                                if (!text) return null;

                                let btnClass = 'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition ';
                                if (result) {
                                    if (opt === result.correctAnswer) btnClass += 'bg-green-50 border-green-500 text-green-700';
                                    else if (opt === selected && !result.correct) btnClass += 'bg-red-50 border-red-400 text-red-700';
                                    else btnClass += 'bg-gray-50 border-gray-200 text-gray-500';
                                } else {
                                    btnClass += selected === opt
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-300';
                                }

                                return (
                                    <button key={opt} onClick={() => !result && setSelected(opt)}
                                            className={btnClass} disabled={!!result}>
                                        <span className="font-bold mr-2">{opt}.</span> {text}
                                    </button>
                                );
                            })}
                        </div>

                        {result && (
                            <div className={`px-4 py-3 rounded-lg mb-4 text-sm font-medium ${
                                result.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                                {result.explanation}
                            </div>
                        )}

                        {!result ? (
                            <button onClick={submitAnswer} disabled={!selected || submitting}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                                {submitting ? 'Submitting...' : 'Submit Answer'}
                            </button>
                        ) : (
                            <button onClick={fetchNext}
                                    className="w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition">
                                {progress?.remaining === 0 ? 'See Results' : 'Next Question →'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}