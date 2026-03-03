import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Save, Loader2, Plus } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';

const AddExpensePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [formData, setFormData] = useState({
        amount: '',
        category_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_mode: 'UPI',
        notes: ''
    });

    useEffect(() => {
        fetchCategories();
        if (id) fetchExpense();
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Failed to fetch categories');
        }
    };

    const fetchExpense = async () => {
        try {
            const res = await axios.get('/api/expenses');
            const expense = res.data.find(e => e.id === parseInt(id));
            if (expense) {
                setFormData({
                    amount: expense.amount,
                    category_id: expense.category_id,
                    expense_date: expense.expense_date.split('T')[0],
                    payment_mode: expense.payment_mode,
                    notes: expense.notes
                });
            }
        } catch (err) {
            console.error('Failed to fetch expense');
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) return;
        try {
            await axios.post('/api/categories', { name: newCategoryName });
            setNewCategoryName('');
            setShowNewCategory(false);
            fetchCategories();
            showSnackbar('Custom resource identifier created.', 'success');
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Matrix failure: Category creation failed', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (id) {
                await axios.put(`/api/expenses/${id}`, formData);
                showSnackbar('Transaction record updated successfully.', 'success');
            } else {
                await axios.post('/api/expenses', formData);
                showSnackbar('Transaction successfully synchronized.', 'success');
            }
            navigate('/expenses');
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Sync failure: Transaction rejected', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-10 transition-all font-bold group bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm w-fit"
            >
                <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                Back to Archives
            </button>

            <div className="premium-card !p-8 md:!p-14">
                <h2 className="text-4xl font-black text-slate-900 mb-10 tracking-tight">
                    {id ? 'Refine Transaction' : 'Record Transaction'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Asset Value (₹)</label>
                            <input
                                type="number"
                                className="input-field !text-2xl font-black"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Timeline</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.expense_date}
                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400">Resource Category</label>
                            <button
                                type="button"
                                onClick={() => setShowNewCategory(!showNewCategory)}
                                className="text-indigo-600 text-xs font-black hover:text-indigo-700 flex items-center gap-1 uppercase tracking-tighter"
                            >
                                <Plus className="w-3.5 h-3.5" /> Initialize New
                            </button>
                        </div>

                        {showNewCategory && (
                            <div className="flex gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Enter identifier..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCategory}
                                    className="btn-primary !px-8"
                                >
                                    Log
                                </button>
                            </div>
                        )}

                        <select
                            className="input-field appearance-none cursor-pointer"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            required
                        >
                            <option value="">Matrix Mapping - Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Fulfillment Vector (Mode)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Cash', 'UPI', 'Card', 'Bank Transfer'].map(mode => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payment_mode: mode })}
                                    className={`px-4 py-4 rounded-2xl text-[11px] font-black border-2 transition-all uppercase tracking-widest ${formData.payment_mode === mode
                                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-lg shadow-indigo-100'
                                        : 'bg-white border-slate-50 text-slate-400 hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Meta Data / Intelligence</label>
                        <textarea
                            className="input-field min-h-[140px] resize-none"
                            placeholder="Describe the nature of this transaction..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full !py-5 text-lg flex items-center justify-center gap-3 mt-10 shadow-2xl shadow-indigo-100"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Save className="w-6 h-6" /> Synchronize Ledger</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExpensePage;
