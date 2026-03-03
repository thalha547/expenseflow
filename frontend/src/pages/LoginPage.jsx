import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';

const LoginPage = () => {
    const { showSnackbar } = useSnackbar();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/login', formData);
            login(res.data.user);
            showSnackbar('Identity verified. Access granted.', 'success');
            navigate('/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Authentication failed: Invalid credentials';
            setError(errMsg);
            showSnackbar(errMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="premium-card !p-10 md:!p-14 shadow-2xl">
                    <div className="text-center mb-12">
                        <div className="inline-block p-4 bg-indigo-50 rounded-3xl mb-6">
                            <Lock className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Intelligence Access</h2>
                        <p className="text-slate-500 font-medium">Verify credentials to synchronize your ledger.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm font-bold border border-red-100/50 flex items-center gap-3 animate-shake">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Authentication ID (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    className="input-field !pl-14"
                                    placeholder="name@ecosystem.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Secure Passphrase</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    className="input-field !pl-14"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full !py-4.5 text-lg mt-8 shadow-2xl shadow-indigo-100"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Decrypt & Login'}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-500 text-sm font-semibold">
                            New user? <Link to="/register" className="text-indigo-600 font-black hover:text-indigo-700 underline underline-offset-8">Create Identity</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
