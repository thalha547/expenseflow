import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Edit2, Trash2, Calendar, CreditCard, Banknote, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generatePDFReport } from '../services/reportService';
import { useSnackbar } from '../context/SnackbarContext';

const ExpenseListPage = () => {
    const { showSnackbar } = useSnackbar();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await axios.get('/api/expenses');
                setExpenses(res.data);
            } catch (err) {
                console.error('Failed to fetch expenses');
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you certain you wish to purge this transaction record?')) return;
        try {
            await axios.delete(`/api/expenses/${id}`);
            setExpenses(expenses.filter(e => e.id !== id));
            showSnackbar('Transaction record purged from archives.', 'success');
        } catch (err) {
            showSnackbar('Matrix failure: Purge operation aborted.', 'error');
        }
    };

    const filteredExpenses = expenses.filter(e =>
        e.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPaymentIcon = (mode) => {
        switch (mode) {
            case 'Cash': return <Banknote className="w-4 h-4 text-emerald-600" />;
            case 'Card': return <CreditCard className="w-4 h-4 text-indigo-600" />;
            default: return <CreditCard className="w-4 h-4 text-violet-600" />;
        }
    };

    const handleDownloadReport = () => {
        const now = new Date();
        const currentMonthExpenses = expenses.filter(e => {
            const date = new Date(e.expense_date);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });
        generatePDFReport(currentMonthExpenses, now.getMonth() + 1, now.getFullYear());
        showSnackbar('Financial intelligence brief generated.', 'success');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 bg-indigo-100 rounded-full mb-4"></div>
            <p className="text-slate-400 font-medium">Downloading Ledger...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Transaction Log</h1>
                    <p className="text-slate-500 font-medium mt-1">Audit and manage your historical financial data.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative group flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            className="input-field !pl-12 !py-3 w-full lg:w-80 shadow-sm"
                            placeholder="Filter records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="btn-secondary !bg-white !shadow-sm !px-6"
                    >
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                </div>
            </header>

            {/* Desktop Table: Hidden on smaller mobile screens */}
            <div className="hidden md:block premium-card overflow-hidden !p-0 border-slate-100 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date/Time</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Information</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Value</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredExpenses.length > 0 ? filteredExpenses.map((expense) => (
                                <tr key={expense.id} className="group hover:bg-slate-50/80 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">
                                                {new Date(expense.expense_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-[11px] font-black uppercase tracking-tight ring-1 ring-indigo-100/50">
                                            {expense.category_name}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm">
                                        <div className="flex items-center gap-2.5 font-bold text-slate-600">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100">
                                                {getPaymentIcon(expense.payment_mode)}
                                            </div>
                                            {expense.payment_mode}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-slate-500 font-medium truncate max-w-[200px]">
                                        {expense.notes || <span className="text-slate-300 italic">No notes recorded</span>}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-base font-black text-slate-900">₹{parseFloat(expense.amount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link to={`/edit-expense/${expense.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                                <Edit2 className="w-4.5 h-4.5" />
                                            </Link>
                                            <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                                                <Filter className="w-8 h-8" />
                                            </div>
                                            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic">No matching records identified</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Cards: Visible on mobile screens */}
            <div className="md:hidden space-y-4 px-2">
                {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="premium-card !p-5 relative overflow-hidden">
                        {/* Status bar */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter block mb-1">
                                    {new Date(expense.expense_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                                <h4 className="font-black text-slate-900">{expense.category_name}</h4>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black text-slate-900">₹{parseFloat(expense.amount).toLocaleString()}</span>
                                <div className="flex items-center gap-1 justify-end mt-1">
                                    {getPaymentIcon(expense.payment_mode)}
                                    <span className="text-[10px] font-black uppercase text-slate-500">{expense.payment_mode}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
                            {expense.notes || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-end gap-2 border-t border-slate-50 pt-4 mt-2">
                            <Link to={`/edit-expense/${expense.id}`} className="flex-1 text-center py-2.5 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs">
                                Edit
                            </Link>
                            <button onClick={() => handleDelete(expense.id)} className="flex-1 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
                {filteredExpenses.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs">No records</div>
                )}
            </div>
        </div>
    );
};

export default ExpenseListPage;
