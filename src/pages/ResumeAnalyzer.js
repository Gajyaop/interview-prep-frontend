import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import api from '../api/axios';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

const ROLES = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
    'Android Developer', 'iOS Developer', 'ML Engineer'
];

export default function ResumeAnalyzer() {
    const navigate = useNavigate();
    const [resumeText, setResumeText] = useState('');
    const [jobRole, setJobRole] = useState('Software Engineer');
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setError('');

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            setExtracting(true);
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                setResumeText(fullText.trim());
            } catch (err) {
                setError('Failed to read PDF. Try pasting the text manually.');
            } finally {
                setExtracting(false);
            }
        } else {
            const reader = new FileReader();
            reader.onload = (event) => setResumeText(event.target.result);
            reader.readAsText(file);
        }
    };

    const analyzeResume = async () => {
        if (!resumeText.trim()) {
            setError('Please paste your resume text or upload a file.');
            return;
        }
        setError('');
        setLoading(true);
        setAnalysis(null);
        try {
            const res = await api.post('/api/ai/resume/analyze', { resumeText, jobRole });
            setAnalysis(res.data.analysis);
        } catch (err) {
            setError('Failed to analyze resume. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (text) => {
        const match = text.match(/OVERALL SCORE:\s*(\d+)/i);
        if (!match) return 'text-gray-600';
        const score = parseInt(match[1]);
        if (score >= 7) return 'text-green-600';
        if (score >= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScore = (text) => {
        const match = text.match(/OVERALL SCORE:\s*(\d+)/i);
        return match ? match[1] : '?';
    };

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

            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Resume Analyzer</h1>
                    <p className="text-gray-500">Get AI-powered feedback on your resume for tech jobs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Target Role</h3>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map(r => (
                                    <button key={r} onClick={() => setJobRole(r)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                                                jobRole === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Upload Resume</h3>
                            <label className="block w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition">
                                <div className="text-4xl mb-2">📄</div>
                                {extracting ? (
                                    <div className="text-sm font-medium text-blue-600">Extracting text from PDF...</div>
                                ) : (
                                    <>
                                        <div className="text-sm font-medium text-gray-700">
                                            {fileName ? fileName : 'Click to upload PDF or TXT file'}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Supports .pdf and .txt files</div>
                                    </>
                                )}
                                <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
                            </label>

                            {resumeText && !extracting && (
                                <div className="mt-3 bg-green-50 text-green-700 text-xs px-3 py-2 rounded-lg">
                                    ✓ Resume text extracted ({resumeText.length} characters)
                                </div>
                            )}

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Or paste resume text here</label>
                                <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={10}
                                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                          placeholder="Paste your resume content here..." />
                            </div>

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                            <button onClick={analyzeResume} disabled={loading || extracting || !resumeText.trim()}
                                    className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                                {loading ? 'Analyzing...' : 'Analyze Resume'}
                            </button>
                        </div>
                    </div>

                    <div>
                        {(loading || extracting) && (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                <div className="text-5xl mb-4">🔍</div>
                                <p className="text-gray-600 font-medium">
                                    {extracting ? 'Extracting text from PDF...' : 'Analyzing your resume...'}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
                            </div>
                        )}

                        {analysis && !loading && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg">Analysis Results</h3>
                                    <div className={`text-4xl font-bold ${getScoreColor(analysis)}`}>{getScore(analysis)}/10</div>
                                </div>
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{analysis}</pre>
                                <button onClick={() => { setAnalysis(null); setResumeText(''); setFileName(''); }}
                                        className="w-full mt-6 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-200 transition">
                                    Analyze Another Resume
                                </button>
                            </div>
                        )}

                        {!analysis && !loading && !extracting && (
                            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                                <div className="text-5xl mb-4">📋</div>
                                <h3 className="font-bold text-gray-800 mb-2">What you will get</h3>
                                <div className="space-y-3 text-left mt-4">
                                    {[
                                        { icon: '⭐', text: 'Overall resume score out of 10' },
                                        { icon: '✅', text: 'Key strengths of your resume' },
                                        { icon: '❌', text: 'Weaknesses and gaps identified' },
                                        { icon: '📝', text: 'Missing sections recruiters expect' },
                                        { icon: '🚀', text: 'Top actionable improvements' },
                                        { icon: '🤖', text: 'ATS compatibility score' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="text-sm text-gray-600">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}