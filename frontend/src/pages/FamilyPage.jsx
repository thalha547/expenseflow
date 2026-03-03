import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserPlus, Shield, Copy, CheckCircle2, UserCircle, History } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';

const FamilyPage = () => {
    const { showSnackbar } = useSnackbar();
    const [familyData, setFamilyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [familyName, setFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);
    const [familyExpenses, setFamilyExpenses] = useState([]);

    useEffect(() => {
        fetchFamilyDetails();
    }, []);

    const fetchFamilyDetails = async () => {
        try {
            const res = await axios.get('/api/family/details');
            setFamilyData(res.data);
            if (res.data.inFamily) {
                const expensesRes = await axios.get('/api/family/expenses');
                setFamilyExpenses(expensesRes.data);
            }
        } catch (err) {
            console.error('Failed to fetch family data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFamily = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/family/create', { name: familyName });
            fetchFamilyDetails();
            showSnackbar('Family workspace initialized successfully.', 'success');
        } catch (err) {
            showSnackbar('Failed to create family ecosystem.', 'error');
        }
    };

    const handleJoinFamily = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/family/join', { inviteCode });
            fetchFamilyDetails();
            showSnackbar('Successfully linked to household ecosystem.', 'success');
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Access denied: Invalid invite code', 'error');
        }
    };

    const copyInviteCode = () => {
        navigator.clipboard.writeText(familyData.family.inviteCode);
        setCopied(true);
        showSnackbar('Invite code copied to clipboard.', 'info');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="text-center py-20 animate-pulse">Establishing encrypted link...</div>;

    if (!familyData?.inFamily) {
        return (
            <div className="max-w-4xl mx-auto space-y-12 py-10">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Family Financial Core</h1>
                    <p className="text-slate-500 text-lg">Unite your household spending and build a shared future.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="card border-2 border-indigo-100 bg-white">
                        <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                            <Users className="text-indigo-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Initialize New Family</h2>
                        <p className="text-slate-500 text-sm mb-6">Create a shared workspace where you can manage group budgets and track collective spending.</p>
                        <form onSubmit={handleCreateFamily} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Family Name (e.g., The Robinsons)"
                                className="input-field"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                required
                            />
                            <button className="btn-primary w-full py-3">Create Family Workspace</button>
                        </form>
                    </div>

                    <div className="card border-2 border-slate-100 bg-white">
                        <div className="bg-slate-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                            <UserPlus className="text-slate-600 w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Join Existing Family</h2>
                        <p className="text-slate-500 text-sm mb-6">Enter the unique access code provided by your family administrator to join their workspace.</p>
                        <form onSubmit={handleJoinFamily} className="space-y-4">
                            <input
                                type="text"
                                placeholder="8-Character Invite Code"
                                className="input-field uppercase font-mono"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                required
                            />
                            <button className="btn-secondary w-full py-3">Link to Household</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Family Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{familyData.family.name}</h1>
                    </div>
                    <p className="text-slate-500 text-lg font-medium">Shared household economic ecosystem.</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
                    <div className="px-4 py-2 font-mono font-bold text-slate-900">{familyData.family.inviteCode}</div>
                    <button
                        onClick={copyInviteCode}
                        className="p-2 bg-white text-slate-600 rounded-xl hover:text-indigo-600 transition-all border border-slate-200"
                    >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Member List */}
                <div className="card h-fit">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Family Members
                    </h3>
                    <div className="space-y-4">
                        {familyData.members.map((member, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold">
                                        {member.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 leading-none mb-1">{member.username}</p>
                                        <p className="text-xs text-slate-500 lowercase">{member.email}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${member.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {member.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shared History */}
                <div className="lg:col-span-2 card">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <History className="w-5 h-5 text-indigo-600" />
                        Collaborative Spending History
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-xs uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4 font-bold">Member</th>
                                    <th className="pb-4 font-bold">Spent On</th>
                                    <th className="pb-4 font-bold">Date</th>
                                    <th className="pb-4 font-bold text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {familyExpenses.map((exp, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                        <td className="py-4 font-bold text-slate-700">{exp.spent_by}</td>
                                        <td className="py-4">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-black mr-2">
                                                {exp.category_name}
                                            </span>
                                            <span className="text-slate-500 italic">{exp.notes || exp.payment_mode}</span>
                                        </td>
                                        <td className="py-4 text-slate-400">{new Date(exp.expense_date).toLocaleDateString()}</td>
                                        <td className="py-4 text-right font-black text-slate-900">₹{parseFloat(exp.amount).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {familyExpenses.length === 0 && (
                            <div className="text-center py-10 text-slate-400 font-medium italic">No family expenses tracked yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FamilyPage;
