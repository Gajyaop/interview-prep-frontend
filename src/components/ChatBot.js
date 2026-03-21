import React, { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hi! I\'m your AI study assistant. Ask me anything about Java, DSA, SQL, System Design, or any technical topic!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (open) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, open]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const history = messages
                .slice(-6)
                .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
                .join('\n');

            const res = await api.post('/api/ai/chat', {
                message: userMessage,
                history,
            });

            setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I could not respond. Try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {open && (
                <div className="mb-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
                     style={{ height: '480px' }}>

                    {/* Header */}
                    <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">AI</span>
                            </div>
                            <div>
                                <div className="text-white font-semibold text-sm">Study Assistant</div>
                                <div className="text-blue-200 text-xs">Always here to help</div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="text-white hover:text-blue-200 text-lg font-bold">✕</button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-700 shadow-sm rounded-bl-sm border border-gray-100'
                                }`}>
                                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-400 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 text-sm">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                        <div className="flex gap-2">
                            <textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Ask anything... (Enter to send)"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold"
                            >
                                ➤
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">Press Enter to send • Shift+Enter for new line</p>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center text-2xl"
            >
                {open ? '✕' : '🤖'}
            </button>
        </div>
    );
}