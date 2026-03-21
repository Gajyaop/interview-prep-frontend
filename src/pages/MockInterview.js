import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TOPICS = ['Java', 'Python', 'Data Structures', 'SQL', 'OOP', 'System Design', 'Computer Networks', 'Operating Systems'];
const ROLES = ['Junior Developer', 'Senior Developer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'Software Engineer'];

export default function MockInterview() {
    const navigate = useNavigate();
    const [stage, setStage] = useState('setup');
    const [topic, setTopic] = useState('Java');
    const [role, setRole] = useState('Software Engineer');
    const [questionCount, setQuestionCount] = useState(5);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [allQA, setAllQA] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const startInterview = async () => {
        setLoading(true);
        try {
            const res = await api.post('/api/ai/mock-interview/start', {
                topic,
                role,
                count: questionCount,
            });
            const parsed = JSON.parse(res.data.questionsJson);
            setQuestions(parsed);
            setCurrentIndex(0);
            setAllQA([]);
            setStage('interview');
        } catch (err) {
            alert('Failed to start interview. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (!answer.trim()) return;
        setLoading(true);
        setFeedback(null);
        try {
            const res = await api.post('/api/ai/mock-interview/evaluate', {
                question: questions[currentIndex],
                answer,
                topic,
            });
            setFeedback(res.data.feedback);
            setAllQA(prev => [...prev, {
                question: questions[currentIndex],
                answer,
                feedback: res.data.feedback,
            }]);
        } catch (err) {
            setFeedback('Failed to evaluate. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = () => {
        if (currentIndex + 1 >= questions.length) {
            finishInterview();
        } else {
            setCurrentIndex(prev => prev + 1);
            setAnswer('');
            setFeedback(null);
        }
    };

    const finishInterview = async () => {
        setLoading(true);
        setStage('summary');
        try {
            const transcript = allQA.map((qa, i) =>
                `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nFeedback: ${qa.feedback}`
            ).join('\n\n');

            const res = await api.post('/api/ai/mock-interview/summary', {
                topic,
                role,
                questionsAndAnswers: transcript,
            });
            setSummary(res.data.summary);
        } catch (err) {
            setSummary('Failed to generate summary.');
        } finally {
            setLoading(false);
        }
    };

    const resetInterview = () => {
        setStage('setup');
        setQuestions([]);
        setCurrentIndex(0);
        setAnswer('');
        setFeedback(null);
        setAllQA([]);
        setSummary(null);
    };

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

                {/* Setup Stage */}
                {stage === 'setup' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Mock Interview</h2>
                        <p className="text-gray-500 mb-8">Practice with AI-powered interview questions and get instant feedback</p>

                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                                <div className="flex flex-wrap gap-2">
                                    {TOPICS.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTopic(t)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                                topic === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <div className="flex flex-wrap gap-2">
                                    {ROLES.map(r => (
                                        <button
                                            key={r}
                                            onClick={() => setRole(r)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                                role === r ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Number of Questions: {questionCount}
                                </label>
                                <input
                                    type="range"
                                    min="3"
                                    max="10"
                                    value={questionCount}
                                    onChange={e => setQuestionCount(Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>3</span>
                                    <span>10</span>
                                </div>
                            </div>

                            <button
                                onClick={startInterview}
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 text-lg"
                            >
                                {loading ? 'Preparing interview...' : 'Start Mock Interview'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Interview Stage */}
                {stage === 'interview' && questions.length > 0 && (
                    <div>
                        {/* Progress */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Mock Interview</h2>
                                <p className="text-sm text-gray-500">{role} • {topic}</p>
                            </div>
                            <span className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
                                Question {currentIndex + 1} of {questions.length}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            />
                        </div>

                        {/* Question */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-bold text-sm">{currentIndex + 1}</span>
                                </div>
                                <p className="text-gray-800 font-medium text-lg leading-relaxed">
                                    {questions[currentIndex]}
                                </p>
                            </div>
                        </div>

                        {/* Answer */}
                        {!feedback && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
                                <textarea
                                    value={answer}
                                    onChange={e => setAnswer(e.target.value)}
                                    rows={5}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Type your answer here..."
                                />
                                <button
                                    onClick={submitAnswer}
                                    disabled={loading || !answer.trim()}
                                    className="w-full mt-3 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {loading ? 'Evaluating...' : 'Submit Answer'}
                                </button>
                            </div>
                        )}

                        {/* Feedback */}
                        {feedback && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-purple-600 font-semibold text-sm">✦ AI Feedback</span>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                        {feedback}
                                    </pre>
                                </div>
                                <button
                                    onClick={nextQuestion}
                                    className="w-full mt-4 bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition"
                                >
                                    {currentIndex + 1 >= questions.length ? 'Finish Interview' : 'Next Question →'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Summary Stage */}
                {stage === 'summary' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Interview Complete!</h2>
                        <p className="text-gray-500 mb-8">{role} • {topic} • {questions.length} questions</p>

                        {loading && (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                <div className="text-purple-600 font-medium">Generating your assessment...</div>
                            </div>
                        )}

                        {summary && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl">📊</span>
                                    <h3 className="font-bold text-gray-800 text-lg">Overall Assessment</h3>
                                </div>
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                    {summary}
                                </pre>
                            </div>
                        )}

                        {/* Review all Q&A */}
                        <div className="space-y-4 mb-6">
                            {allQA.map((qa, i) => (
                                <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
                                    <p className="font-semibold text-gray-800 mb-2">
                                        <span className="text-blue-600 mr-2">Q{i + 1}.</span>
                                        {qa.question}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">
                                        <span className="font-medium">Your answer: </span>{qa.answer}
                                    </p>
                                    <div className="bg-purple-50 rounded-lg p-3">
                                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans">
                                            {qa.feedback}
                                        </pre>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={resetInterview}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Start New Interview
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}