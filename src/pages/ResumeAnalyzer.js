import React, { useState } from 'react';
import api from '../api/axios';

const TARGET_ROLES = [
    "Software Development Engineer (SDE)",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Android Developer",
    "iOS Developer",
    "Cloud Engineer",
    "Cybersecurity Engineer",
    "Database Administrator",
    "QA / Test Engineer",
    "Product Manager",
];

export default function ResumeAnalyzer() {
    const [file, setFile]               = useState(null);
    const [resumeText, setResumeText]   = useState('');
    const [analysis, setAnalysis]       = useState('');
    const [analyzing, setAnalyzing]     = useState(false);
    const [error, setError]             = useState('');

    // Tailored questions state
    const [targetRole, setTargetRole]   = useState(TARGET_ROLES[0]);
    const [difficulty, setDifficulty]   = useState('MEDIUM');
    const [generating, setGenerating]   = useState(false);
    const [questions, setQuestions]     = useState([]);
    const [quizStarted, setQuizStarted] = useState(false);
    const [currentQ, setCurrentQ]       = useState(0);
    const [selected, setSelected]       = useState(null);
    const [answers, setAnswers]         = useState([]);
    const [quizDone, setQuizDone]       = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    // ── File handling ──────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setAnalysis('');
        setQuestions([]);
        setQuizStarted(false);
        setQuizDone(false);

        const reader = new FileReader();
        reader.onload = (ev) => setResumeText(ev.target.result);
        if (f.type === 'application/pdf') {
            // PDF text extraction via pdfjs (loaded in public/index.html)
            reader.readAsArrayBuffer(f);
            extractPdfText(f).then(text => setResumeText(text));
        } else {
            reader.readAsText(f);
        }
    };

    const extractPdfText = async (file) => {
        try {
            const pdfjsLib = window['pdfjs-dist/build/pdf'];
            if (!pdfjsLib) return await file.text();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
            }
            return text;
        } catch {
            return '';
        }
    };

    // ── Resume Analysis ────────────────────────────────────────────────────
    const handleAnalyze = async () => {
        if (!resumeText.trim()) { setError('Could not read file text.'); return; }
        setAnalyzing(true); setError('');
        try {
            const res = await api.post('/api/ai/resume/analyze', { resumeText });
            setAnalysis(res.data.analysis || res.data);
        } catch {
            setError('Analysis failed. Please try again.');
        } finally {
            setAnalyzing(false);
        }
    };

    // ── Generate Tailored Questions ────────────────────────────────────────
    const handleGenerateQuestions = async () => {
        if (!resumeText.trim()) { setError('Please upload your resume first.'); return; }
        setGenerating(true); setError('');
        setQuestions([]); setQuizStarted(false); setQuizDone(false);
        try {
            const res = await api.post('/api/ai/resume/generate-questions', {
                resumeText,
                targetRole,
                difficulty,
            });
            const raw = res.data.questions;
            const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
            setQuestions(parsed);
        } catch (err) {
            setError('Failed to generate questions. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    // ── Quiz Logic ─────────────────────────────────────────────────────────
    const startQuiz = () => {
        setCurrentQ(0); setAnswers([]); setSelected(null);
        setShowExplanation(false); setQuizStarted(true); setQuizDone(false);
    };

    const handleAnswer = (option) => {
        if (selected) return;
        setSelected(option);
        setShowExplanation(true);
        const q = questions[currentQ];
        setAnswers(prev => [...prev, {
            question: q.question,
            selected: option,
            correct: q.correctAnswer,
            isCorrect: option === q.correctAnswer,
            explanation: q.explanation,
        }]);
    };

    const nextQuestion = () => {
        if (currentQ + 1 >= questions.length) {
            setQuizDone(true);
        } else {
            setCurrentQ(prev => prev + 1);
            setSelected(null);
            setShowExplanation(false);
        }
    };

    const score = answers.filter(a => a.isCorrect).length;

    // ── RENDER ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        📄 Resume Analyzer
                    </h1>
                    <p className="text-gray-500">
                        Upload your resume to get AI analysis + personalized interview questions
                    </p>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Resume</h2>
                    <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50">
                        <div className="text-4xl mb-3">📁</div>
                        <p className="text-gray-500 text-sm mb-4">PDF or TXT format</p>
                        <label className="cursor-pointer">
                            <span className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                                Choose File
                            </span>
                            <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="hidden" />
                        </label>
                        {file && (
                            <p className="mt-3 text-green-600 text-sm font-medium">
                                ✅ {file.name} loaded
                            </p>
                        )}
                    </div>

                    {file && (
                        <button onClick={handleAnalyze} disabled={analyzing}
                                className="mt-4 w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50">
                            {analyzing ? '🔄 Analyzing...' : '🔍 Analyze Resume'}
                        </button>
                    )}
                </div>

                {/* Analysis Result */}
                {analysis && (
                    <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 AI Analysis</h2>
                        <div className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {analysis}
                        </div>
                    </div>
                )}

                {/* ── TAILORED QUESTIONS SECTION ── */}
                {resumeText && (
                    <div className="bg-white rounded-2xl shadow p-6 mb-6 border-2 border-purple-100">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🎯</span>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Tailored Interview Questions
                                </h2>
                                <p className="text-gray-500 text-sm">
                                    Generate questions based on YOUR resume for your target role
                                </p>
                            </div>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4 mt-4 mb-5">
                            <p className="text-purple-700 text-sm font-medium">
                                ✨ These questions are uniquely generated from your actual skills,
                                projects, and experience — not generic questions.
                            </p>
                        </div>

                        {/* Role + Difficulty selectors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Target Role
                                </label>
                                <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    {TARGET_ROLES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Difficulty
                                </label>
                                <div className="flex gap-2">
                                    {['EASY', 'MEDIUM', 'HARD'].map(d => (
                                        <button key={d} onClick={() => setDifficulty(d)}
                                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition border ${
                                                    difficulty === d
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                                                }`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button onClick={handleGenerateQuestions} disabled={generating}
                                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            {generating
                                ? <><span className="animate-spin">⚙️</span> Generating your personalized questions...</>
                                : '✨ Generate My Interview Questions'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Questions Preview + Start Quiz */}
                {questions.length > 0 && !quizStarted && !quizDone && (
                    <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">
                                🎉 {questions.length} Questions Generated!
                            </h2>
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                                {targetRole}
                            </span>
                        </div>

                        {/* Preview first 3 questions */}
                        <div className="space-y-3 mb-6">
                            {questions.slice(0, 3).map((q, i) => (
                                <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold text-purple-600">Q{i+1}.</span> {q.question}
                                    </p>
                                    {q.topic && (
                                        <span className="inline-block mt-1 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                                            {q.topic}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {questions.length > 3 && (
                                <p className="text-center text-gray-400 text-sm">
                                    + {questions.length - 3} more questions...
                                </p>
                            )}
                        </div>

                        <button onClick={startQuiz}
                                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                            ▶ Start Practice Quiz
                        </button>
                    </div>
                )}

                {/* ── QUIZ MODE ── */}
                {quizStarted && !quizDone && questions[currentQ] && (
                    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                        {/* Progress */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">
                                Question {currentQ + 1} of {questions.length}
                            </span>
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                                {questions[currentQ].topic || targetRole}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                            <div className="bg-purple-600 h-2 rounded-full transition-all"
                                 style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
                        </div>

                        {/* Question */}
                        <h3 className="text-base font-semibold text-gray-800 mb-5 leading-relaxed">
                            {questions[currentQ].question}
                        </h3>

                        {/* Options */}
                        <div className="space-y-3 mb-5">
                            {questions[currentQ].options.map((opt, i) => {
                                const isCorrect = opt === questions[currentQ].correctAnswer;
                                const isSelected = opt === selected;
                                let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm transition font-medium ";
                                if (!selected) {
                                    cls += "border-gray-200 hover:border-purple-400 hover:bg-purple-50";
                                } else if (isCorrect) {
                                    cls += "border-green-500 bg-green-50 text-green-700";
                                } else if (isSelected) {
                                    cls += "border-red-400 bg-red-50 text-red-600";
                                } else {
                                    cls += "border-gray-200 bg-gray-50 text-gray-400";
                                }
                                return (
                                    <button key={i} onClick={() => handleAnswer(opt)} className={cls}>
                                        <span className="font-bold mr-2">
                                            {['A','B','C','D'][i]}.
                                        </span>
                                        {opt}
                                        {selected && isCorrect && <span className="float-right">✅</span>}
                                        {selected && isSelected && !isCorrect && <span className="float-right">❌</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        {showExplanation && questions[currentQ].explanation && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <p className="text-sm font-semibold text-blue-700 mb-1">💡 Explanation</p>
                                <p className="text-sm text-blue-600">{questions[currentQ].explanation}</p>
                            </div>
                        )}

                        {selected && (
                            <button onClick={nextQuestion}
                                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                                {currentQ + 1 >= questions.length ? '🏁 See Results' : 'Next Question →'}
                            </button>
                        )}
                    </div>
                )}

                {/* ── QUIZ RESULTS ── */}
                {quizDone && (
                    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
                        <div className="text-center mb-6">
                            <div className="text-5xl mb-3">
                                {score >= 8 ? '🏆' : score >= 5 ? '👍' : '📚'}
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-1">
                                {score} / {questions.length}
                            </h2>
                            <p className="text-gray-500 mb-2">
                                {Math.round((score/questions.length)*100)}% correct
                            </p>
                            <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${
                                score >= 8 ? 'bg-green-100 text-green-700' :
                                    score >= 5 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-600'
                            }`}>
                                {score >= 8 ? '🌟 Excellent — You\'re interview ready!' :
                                    score >= 5 ? '👍 Good — A bit more practice needed' :
                                        '📚 Keep studying — Review the topics below'}
                            </div>
                        </div>

                        {/* Answer review */}
                        <div className="space-y-3 mb-6">
                            {answers.map((a, i) => (
                                <div key={i} className={`rounded-xl p-4 border ${
                                    a.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                }`}>
                                    <p className="text-sm font-medium text-gray-800 mb-2">
                                        {a.isCorrect ? '✅' : '❌'} Q{i+1}: {a.question}
                                    </p>
                                    {!a.isCorrect && (
                                        <>
                                            <p className="text-xs text-red-600">Your answer: {a.selected}</p>
                                            <p className="text-xs text-green-600">Correct: {a.correct}</p>
                                        </>
                                    )}
                                    {a.explanation && (
                                        <p className="text-xs text-gray-500 mt-1 italic">{a.explanation}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={startQuiz}
                                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition">
                                🔄 Retry Quiz
                            </button>
                            <button onClick={handleGenerateQuestions}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
                                ✨ Generate New Questions
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}