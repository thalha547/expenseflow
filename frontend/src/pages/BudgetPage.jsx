import { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Save, Plus } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';

const BudgetPage = () => {
    const { showSnackbar } = useSnackbar();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newBudget, setNewBudget] = useState({ category_id: '', amount: '' });

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [budgetRes, categoryRes] = await Promise.all([
                axios.get(`/api/budgets?month=${currentMonth}&year=${currentYear}`),
                axios.get('/api/categories')
            ]);
            setBudgets(budgetRes.data);
            setCategories(categoryRes.data);
        } catch (err) {
            console.error('Failed to fetch budget data');
        } finally {
            setLoading(false);
        }
    };

    const handleSetBudget = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/budgets', {
                ...newBudget,
                month: currentMonth,
                year: currentYear
            });
            setNewBudget({ category_id: '', amount: '' });
            fetchData();
            showSnackbar('Threshold locked and synchronized.', 'success');
        } catch (err) {
            showSnackbar('System error: Failed to lock threshold.', 'error');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 bg-indigo-100 rounded-full mb-4"></div>
            <p className="text-slate-400 font-medium">Calibrating Thresholds...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <header className="px-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Budget Infrastructure</h1>
                <p className="text-slate-500 font-medium mt-1">Set monthly thresholds for resource allocation.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Set Budget Form */}
                <div className="premium-card lg:col-span-1 h-fit sticky top-24">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <Plus className="w-6 h-6 text-indigo-600 bg-indigo-50 p-1 rounded-lg" />
                        Configure Threshold
                    </h3>
                    <form onSubmit={handleSetBudget} className="space-y-6">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Context / Category</label>
                            <select
                                className="input-field cursor-pointer font-bold"
                                value={newBudget.category_id}
                                onChange={(e) => setNewBudget({ ...newBudget, category_id: e.target.value })}
                                required
                            >
                                <option value="">Select Target...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id} className="font-bold">{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Monthly Limit (₹)</label>
                            <input
                                type="number"
                                className="input-field font-black !text-xl"
                                placeholder="5000"
                                value={newBudget.amount}
                                onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full !py-4.5 flex items-center justify-center gap-2 font-black shadow-2xl shadow-indigo-100 uppercase tracking-widest text-xs">
                            <Save className="w-5 h-5" />
                            Lock Budget
                        </button>
                    </form>
                </div>

                {/* Budget Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            Lifecycle Status: <span className="text-indigo-600">{now.toLocaleString('default', { month: 'long' })} {currentYear}</span>
                        </h3>
                    </div>

                    {budgets.length > 0 ? budgets.map((budget) => {
                        const spent = parseFloat(budget.spent || 0);
                        const limit = parseFloat(budget.amount);
                        const percent = Math.min((spent / limit) * 100, 100);
                        const isExceeded = spent > limit;

                        return (
                            <div key={budget.id} className="premium-card group hover:scale-[1.01] transition-transform duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">{budget.category_name}</h4>
                                        <p className="text-sm font-bold text-slate-400">
                                            Utilized <span className="text-slate-900">₹{spent.toLocaleString()}</span> of <span className="text-slate-900">₹{limit.toLocaleString()}</span>
                                        </p>
                                    </div>
                                    {isExceeded ? (
                                        <div className="flex items-center gap-2 text-red-600 font-black text-[10px] bg-red-50 px-4 py-1.5 rounded-full border border-red-100 uppercase tracking-widest ring-4 ring-red-50/50">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            Limit Violated
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest ring-4 ring-emerald-50/50">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Target Normal
                                        </div>
                                    )}
                                </div>

                                <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-100">
                                    <div
                                        className={`h-full transition-all duration-1000 ease-out rounded-full ${isExceeded ? 'bg-gradient-to-r from-red-500 to-rose-600' : percent > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-100'}`}
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>

                                <div className="flex justify-between mt-4 items-baseline">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        Intensity: <span className={isExceeded ? 'text-red-500' : 'text-indigo-600'}>{percent.toFixed(0)}%</span>
                                    </span>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Available Liquidity</span>
                                        <span className={`text-sm font-black ${isExceeded ? 'text-red-500 line-through' : 'text-slate-900'}`}>
                                            ₹{(limit - spent).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="premium-card text-center py-20 bg-slate-50/50 border-dashed">
                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-sm">
                                <AlertCircle className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No active thresholds detected for this cycle</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetPage;
