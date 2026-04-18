import { useState } from "react";
import axios from "../api/axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("/api/auth/forgot-password", { email });
        } catch {}
        setSent(true);
        setLoading(false);
    };

    if (sent) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-xl font-bold mb-2">Check your email</h2>
                <p className="text-gray-600 mb-4">
                    If an account exists for <strong>{email}</strong>, a reset link has been sent. It expires in 15 minutes.
                </p>
                <Link to="/login" className="text-blue-600 hover:underline text-sm">Back to login</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow max-w-md w-full">
                <h2 className="text-2xl font-bold mb-2">Forgot password</h2>
                <p className="text-gray-500 mb-6 text-sm">Enter your email and we'll send you a reset link.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email" placeholder="Your email address" value={email}
                        onChange={e => setEmail(e.target.value)} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Sending..." : "Send reset link"}
                    </button>
                </form>
                <p className="text-center mt-4 text-sm">
                    <Link to="/login" className="text-blue-600 hover:underline">Back to login</Link>
                </p>
            </div>
        </div>
    );
}