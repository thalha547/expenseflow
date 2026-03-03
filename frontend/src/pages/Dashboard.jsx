import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, ArrowRight, Wallet, PlusCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const Dashboard = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get('/api/analysis/summary');
                setSummary(res.data);
            } catch (err) {
                console.error('Failed to fetch summary');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 bg-indigo-100 rounded-full mb-4"></div>
            <p className="text-slate-400 font-medium">Synchronizing Ledger...</p>
        </div>
    );

    const pieData = {
        labels: summary?.categoryTotals.map(c => c.name) || [],
        datasets: [{
            data: summary?.categoryTotals.map(c => c.total) || [],
            backgroundColor: [
                '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#64748b'
            ],
            hoverOffset: 20,
            borderWidth: 4,
            borderColor: '#ffffff',
        }]
    };

    const barData = {
        labels: ['Previous Month', 'Current Month'],
        datasets: [{
            label: 'Total Expenses',
            data: [summary?.prevTotal || 0, summary?.currentTotal || 0],
            backgroundColor: ['#f1f5f9', '#6366f1'],
            borderRadius: 12,
            maxBarThickness: 50,
        }]
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time financial visibility for {summary?.username || 'your account'}.</p>
                </div>
                <Link to="/add-expense" className="btn-primary group !py-3.5 !px-8 shadow-indigo-100 shadow-xl">
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    Record Transaction
                </Link>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="premium-card group">
                    <div className="flex items-center justify-between mb-6">
                        <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            <Wallet className="w-6 h-6" />
                        </div>
                        {summary?.currentTotal > (summary?.prevTotal || 0) ? (
                            <div className="flex items-center gap-1 font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs">
                                <TrendingUp className="w-3 h-3" /> Peak
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-xs">
                                <TrendingDown className="w-3 h-3" /> Optimizing
                            </div>
                        )}
                    </div>
                    <div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Active Month Spending</span>
                        <h3 className="text-4xl font-black text-slate-900 mt-2">₹{summary?.currentTotal.toLocaleString()}</h3>
                        <p className="text-slate-500 text-xs mt-3 font-medium flex items-center gap-1 italic">
                            "{summary?.insight}"
                        </p>
                    </div>
                </div>

                <div className="premium-card group bg-indigo-600 border-none text-white shadow-indigo-200">
                    <div className="flex items-center justify-between mb-6 text-white">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                            <PieChartIcon className="w-6 h-6" />
                        </div>
                        <span className="text-indigo-100/60 text-[10px] font-black uppercase tracking-tighter ring-1 ring-white/20 px-2 py-1 rounded">Dominant Category</span>
                    </div>
                    <div>
                        <span className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest">Top Outflow</span>
                        <h3 className="text-4xl font-black text-white mt-2">{summary?.highestCategory?.name || '---'}</h3>
                        <p className="text-indigo-100/60 text-xs mt-3 font-medium">
                            Significant concentration in {summary?.highestCategory?.name || 'none'}.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-between items-baseline border-t border-white/10 pt-4">
                        <span className="text-indigo-100 font-bold">₹{summary?.highestCategory?.total.toLocaleString() || 0}</span>
                        <span className="text-white/40 text-[10px] font-bold uppercase">Total Vol.</span>
                    </div>
                </div>

                <div className="premium-card flex flex-col justify-between border-slate-200 border-dashed bg-slate-50/50">
                    <div>
                        <div className="flex items-center justify-between mb-6 text-slate-400">
                            <div className="bg-white p-3 rounded-2xl shadow-sm">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Comparative (Last Mo)</span>
                        <h3 className="text-4xl font-black text-slate-800 mt-2">₹{summary?.prevTotal.toLocaleString()}</h3>
                    </div>
                    <Link to="/expenses" className="mt-8 flex items-center justify-between group p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all font-bold text-slate-600 text-sm">
                        Audit Transaction Log
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Visualization Layer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="premium-card">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Resource Allocation</h3>
                            <p className="text-slate-400 text-xs font-medium uppercase mt-1 tracking-widest">Category Distribution</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        {summary?.categoryTotals.length > 0 ? (
                            <Pie
                                data={pieData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { weight: 'bold', family: 'Inter' } } } }
                                }}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full animate-bounce"></div>
                                <span className="text-xs font-bold uppercase italic">Insufficient Data for Mapping</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="premium-card">
                    <div className="flex items-center justify-between mb-8 text-slate-900 font-bold">
                        <div>
                            <h3 className="text-xl font-bold">Temporal Velocity</h3>
                            <p className="text-slate-400 text-xs font-medium uppercase mt-1 tracking-widest">Comparison vs. Previous Cycle</p>
                        </div>
                        <Link to="/analytics" className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                            <BarChart3 className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="h-[300px]">
                        <Bar
                            data={barData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { grid: { display: false }, border: { display: false } },
                                    x: { grid: { display: false }, border: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
