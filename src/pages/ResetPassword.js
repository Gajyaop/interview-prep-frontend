import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!token) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-red-500 mb-4">Invalid reset link.</p>
                <Link to="/forgot-password" className="text-blue-600 hover:underline">Request a new one</Link>
            </div>
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirm) { setError("Passwords don't match"); return; }
        if (newPassword.length < 6) { setError("Minimum 6 characters"); return; }
        setLoading(true);
        try {
            await axios.post("/api/auth/reset-password", { token, newPassword });
            navigate("/login?reset=success");
        } catch (err) {
            setError(err.response?.data || "Link is invalid or expired. Please request a new one.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Set new password</h2>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password" placeholder="New password (min 6 chars)" value={newPassword}
                        onChange={e => setNewPassword(e.target.value)} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="password" placeholder="Confirm new password" value={confirm}
                        onChange={e => setConfirm(e.target.value)} required
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {loading ? "Saving..." : "Reset password"}
                    </button>
                </form>
            </div>
        </div>
    );
}