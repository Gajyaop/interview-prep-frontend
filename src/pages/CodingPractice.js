import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';

const LANGUAGES = [
    { id: 62, name: 'Java', defaultCode: 'import java.util.Scanner;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}' },
    { id: 71, name: 'Python', defaultCode: '# Write your code here\n' },
    { id: 54, name: 'C++', defaultCode: '#include<iostream>\nusing namespace std;\nint main() {\n    // Write your code here\n    return 0;\n}' },
    { id: 63, name: 'JavaScript', defaultCode: '// Write your code here\n' },
];

export default function CodingPractice() {
    const navigate = useNavigate();
    const [problems, setProblems] = useState([]);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [code, setCode] = useState(LANGUAGES[0].defaultCode);
    const [stdin, setStdin] = useState('');
    const [output, setOutput] = useState(null);
    const [running, setRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [topic, setTopic] = useState('Java');
    const [generating, setGenerating] = useState(false);
    const [generateMsg, setGenerateMsg] = useState('');
    const [reviewing, setReviewing] = useState(false);
    const [review, setReview] = useState(null);

    const TOPICS = ['Java', 'Python', 'C++', 'JavaScript'];

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        loadProblems();
    }, [topic]);

    const loadProblems = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/questions?type=CODING`);
            const filtered = res.data.filter(q => q.topic === topic);
            setProblems(filtered);
            if (filtered.length > 0) {
                setSelectedProblem(filtered[0]);
            } else {
                setSelectedProblem(null);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        setCode(lang.defaultCode);
        setOutput(null);
        setReview(null);
    };

    const runCode = async () => {
        setRunning(true);
        setOutput(null);
        setReview(null);
        try {
            const res = await api.post('/api/code/run', {
                sourceCode: code,
                languageId: language.id,
                stdin: stdin,
            });
            setOutput(res.data);
        } catch (err) {
            setOutput({
                stdout: null,
                stderr: err.response?.data?.message || 'Execution failed',
                status: 'Error',
                statusId: 13,
            });
        } finally {
            setRunning(false);
        }
    };

    const generateCodingProblems = async () => {
        setGenerateMsg('');
        setGenerating(true);
        try {
            const res = await api.post('/api/ai/generate/coding', {
                topic,
                difficulty: 'EASY',
                count: 3,
            });
            setGenerateMsg(`✓ Generated ${res.data.generated} new problems`);
            loadProblems();
        } catch (err) {
            setGenerateMsg('Failed to generate. Try again.');
        } finally {
            setGenerating(false);
        }
    };

    const getAIReview = async () => {
        if (!code || !selectedProblem) return;
        setReviewing(true);
        setReview(null);
        try {
            const res = await api.post('/api/ai/review', {
                code,
                language: language.name,
                problemDescription: selectedProblem.questionText,
                output: output?.stdout || output?.stderr || 'No output',
            });
            setReview(res.data.feedback);
        } catch (err) {
            setReview('Failed to get review. Try again.');
        } finally {
            setReviewing(false);
        }
    };

    const getStatusColor = (statusId) => {
        if (statusId === 3) return 'text-green-600 bg-green-50';
        if (statusId === 6) return 'text-red-600 bg-red-50';
        if (statusId === 5) return 'text-yellow-600 bg-yellow-50';
        return 'text-red-600 bg-red-50';
    };

    const getVerdict = () => {
        if (!output || !selectedProblem) return null;
        if (output.statusId !== 3) return { correct: false, label: output.status };
        if (!output.stdout || output.stdout.trim() === '') {
            return { correct: false, label: 'No Output' };
        }
        return { correct: true, label: 'Accepted' };
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

            <div className="flex h-screen pt-16">
                {/* Left panel */}
                <div className="w-2/5 bg-white border-r border-gray-200 flex flex-col">

                    {/* Topic selector */}
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex gap-2 flex-wrap">
                            {TOPICS.map(t => (
                                <button
                                    key={t}
                                    onClick={() => { setTopic(t); setGenerateMsg(''); setReview(null); }}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                                        topic === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Generate button */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <button
                            onClick={generateCodingProblems}
                            disabled={generating}
                            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            {generating ? 'Generating...' : '✦ Generate AI Problems'}
                        </button>
                        {generateMsg && (
                            <p className={`text-xs mt-2 text-center font-medium ${
                                generateMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'
                            }`}>
                                {generateMsg}
                            </p>
                        )}
                    </div>

                    {/* Problem list */}
                    <div className="flex overflow-x-auto border-b border-gray-100 p-2 gap-2">
                        {loading ? (
                            <p className="text-gray-400 text-sm px-2">Loading...</p>
                        ) : problems.length === 0 ? (
                            <p className="text-gray-400 text-sm px-2">No problems found. Generate some!</p>
                        ) : (
                            problems.map((p, i) => (
                                <button
                                    key={p.id}
                                    onClick={() => { setSelectedProblem(p); setReview(null); setOutput(null); }}
                                    className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap font-medium transition ${
                                        selectedProblem?.id === p.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Problem {i + 1}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Problem description */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedProblem ? (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        selectedProblem.difficulty === 'EASY' ? 'bg-green-100 text-green-700' :
                                            selectedProblem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                    }`}>
                                        {selectedProblem.difficulty}
                                    </span>
                                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                                        {selectedProblem.topic}
                                    </span>
                                </div>
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                    {selectedProblem.questionText}
                                </pre>
                            </>
                        ) : (
                            <div className="text-center text-gray-400 mt-10">
                                <div className="text-4xl mb-3">💻</div>
                                <p>No problems yet.</p>
                                <p className="text-sm mt-2">Click Generate AI Problems to add some!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right panel */}
                <div className="flex-1 flex flex-col">
                    {/* Language selector + buttons */}
                    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                        <div className="flex gap-2">
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => handleLanguageChange(lang)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                                        language.id === lang.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={getAIReview}
                                disabled={reviewing || !output}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 text-sm"
                            >
                                {reviewing ? 'Reviewing...' : '✦ AI Review'}
                            </button>
                            <button
                                onClick={runCode}
                                disabled={running}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                                {running ? 'Running...' : '▶ Run Code'}
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            language={language.name.toLowerCase() === 'c++' ? 'cpp' : language.name.toLowerCase()}
                            value={code}
                            onChange={val => setCode(val || '')}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 16 },
                            }}
                        />
                    </div>

                    {/* Input + Output + Review */}
                    <div
                        className="bg-gray-900 text-white flex flex-col"
                        style={{ height: review || reviewing ? '420px' : '220px', transition: 'height 0.3s' }}
                    >
                        {/* Input + Output row */}
                        <div className="flex" style={{ height: '220px', minHeight: '220px' }}>
                            {/* Stdin */}
                            <div className="w-1/3 border-r border-gray-700 flex flex-col">
                                <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 font-medium">
                                    INPUT (stdin)
                                </div>
                                <textarea
                                    value={stdin}
                                    onChange={e => setStdin(e.target.value)}
                                    className="flex-1 bg-transparent text-sm text-gray-200 p-3 resize-none focus:outline-none font-mono"
                                    placeholder="Enter input here..."
                                />
                            </div>

                            {/* Output */}
                            <div className="flex-1 flex flex-col">
                                <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 font-medium flex items-center justify-between">
                                    <span>OUTPUT</span>
                                    {output && (() => {
                                        const verdict = getVerdict();
                                        return verdict ? (
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                verdict.correct
                                                    ? 'text-green-600 bg-green-50'
                                                    : 'text-red-600 bg-red-50'
                                            }`}>
                                                {verdict.label}
                                            </span>
                                        ) : null;
                                    })()}
                                </div>
                                <div className="flex-1 p-3 overflow-auto font-mono text-sm">
                                    {running && <span className="text-gray-400">Running...</span>}
                                    {!running && output && (
                                        <>
                                            {output.stdout && (
                                                <pre className="text-green-400 whitespace-pre-wrap">{output.stdout}</pre>
                                            )}
                                            {output.compileOutput && (
                                                <pre className="text-yellow-400 whitespace-pre-wrap">{output.compileOutput}</pre>
                                            )}
                                            {output.stderr && (
                                                <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
                                            )}
                                            {!output.stdout && !output.stderr && !output.compileOutput && (
                                                <span className="text-yellow-400">
                                                    Program ran but produced no output. Check your code.
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {!running && !output && (
                                        <span className="text-gray-500">Run your code to see output here</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AI Review Panel */}
                        {(review || reviewing) && (
                            <div className="border-t border-gray-700 flex flex-col flex-1 overflow-hidden">
                                <div className="px-4 py-2 text-xs text-purple-400 border-b border-gray-700 font-medium flex items-center justify-between">
                                    <span>✦ AI CODE REVIEW</span>
                                    <button
                                        onClick={() => setReview(null)}
                                        className="text-gray-500 hover:text-gray-300 text-xs"
                                    >
                                        Close
                                    </button>
                                </div>
                                <div className="flex-1 p-4 overflow-auto">
                                    {reviewing && (
                                        <span className="text-purple-400 text-sm">Analyzing your code...</span>
                                    )}
                                    {review && (
                                        <pre className="text-gray-200 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                                            {review}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}