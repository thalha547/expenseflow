import { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, Filler } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, Filler);

const AnalyticsPage = () => {
    const [trends, setTrends] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trendsRes, predictRes] = await Promise.all([
                    axios.get('/api/analysis/trends'),
                    axios.get('/api/analysis/predict')
                ]);
                setTrends(trendsRes.data);
                setPrediction(predictRes.data.nextMonthPrediction);
                setPredictionData(predictRes.data);
            } catch (err) {
                console.error('Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const mainChartData = {
        labels: trends.map(t => `${months[t.month - 1]} ${t.year % 100}`),
        datasets: [{
            label: 'Actual Spending',
            data: trends.map(t => t.total),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            borderWidth: 3
        }]
    };

    const forecastLabels = predictionData?.forecast
        ? ['Current', 'Month 1', 'Month 2', 'Month 3']
        : [];

    const forecastChartData = {
        labels: forecastLabels,
        datasets: [{
            label: 'ML Projection',
            data: predictionData ? [trends[trends.length - 1]?.total, ...(predictionData.forecast || [])] : [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderDash: [5, 5],
            fill: true,
            tension: 0.4,
            pointRadius: 5
        }]
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Running Model Competition...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Executive Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Financial Intelligence</h1>
                    <p className="text-slate-500 text-lg mt-1 font-medium">Predictive analysis driven by Enterprise ML models.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold border border-indigo-100 italic">
                        Model: {predictionData?.model_used || 'Standard'} Optimized
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${predictionData?.confidence > 0.7 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {Math.round((predictionData?.confidence || 0) * 100)}% Confidence
                    </span>
                </div>
            </div>

            {/* Insights Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Forecast Card */}
                <div className="lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute  from-black-600 to-black-700 -z-10 group-hover:scale-105 transition-transform duration-700"></div>
                    <div className="p-8 text-black flex flex-col h-full justify-between min-h-[280px]">
                        <div>
                            <div className="bg-white/20 inline-block p-2 rounded-xl backdrop-blur-sm mb-4">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h4 className="text-indigo-700 font-semibold uppercase tracking-wider text-xs">AI Monthly Forecast</h4>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-5xl font-black">₹{prediction?.toLocaleString()}</span>
                                <span className="text-indigo-700 font-medium">/ month</span>
                            </div>
                            <p className="mt-4 text-indigo-700 font-medium text-sm leading-relaxed max-w-[80%]">
                                "{predictionData?.insight}"
                            </p>
                        </div>
                        {predictionData?.range && (
                            <div className="mt-6 flex justify-between items-center bg-black/10 rounded-2xl p-4 backdrop-blur-md">
                                <div className="text-xs">
                                    <span className="block text-indigo-700 opacity-80 uppercase font-bold">Estimated Low</span>
                                    <span className="font-bold text-base">₹{predictionData.range.min.toLocaleString()}</span>
                                </div>
                                <div className="h-6 w-px bg-white/20"></div>
                                <div className="text-xs text-right">
                                    <span className="block text-indigo-700 opacity-80 uppercase font-bold">Estimated High</span>
                                    <span className="font-bold text-base">₹{predictionData.range.max.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secondary Metrics */}
                <div className="card space-y-6 flex flex-col justify-center">
                    <div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Growth Trend</span>
                        <div className="text-2xl font-black text-slate-800 flex items-center gap-2 mt-1">
                            {predictionData?.confidence > 0.5 ? (
                                <>
                                    <span>High Momentum</span>
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
                                </>
                            ) : 'Developing'}
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">3-Month Outlook</span>
                        <div className="text-2xl font-black text-slate-800 mt-1">
                            ₹{predictionData?.forecast?.reduce((a, b) => a + b, 0).toLocaleString()} <span className="text-slate-400 text-sm font-medium">Total</span>
                        </div>
                    </div>
                </div>

                <div className="card bg-slate-900 text-white flex flex-col justify-center border-none shadow-indigo-100 shadow-2xl">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">System Status</span>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span className="text-sm font-medium">ML Service Connected</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                            <span className="text-sm font-medium">Feature Store Synced</span>
                        </div>
                        <div className="flex items-center gap-3 opacity-40">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                            <span className="text-sm font-medium">GPU Acceleration (NA)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card p-8 bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Historical Footprint</h3>
                            <p className="text-slate-400 text-xs font-medium uppercase mt-1 tracking-widest">Actual Spending (Past 24 Months)</p>
                        </div>
                    </div>
                    <div className="h-[300px]">
                        <Line
                            data={mainChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { border: { display: false }, grid: { color: '#f1f5f9' } },
                                    x: { border: { display: false }, grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="card p-8 bg-white border border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Forward Projections</h3>
                            <p className="text-slate-400 text-xs font-medium uppercase mt-1 tracking-widest">AI Future Estimations</p>
                        </div>
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">Probabilistic</span>
                    </div>
                    <div className="h-[300px]">
                        <Line
                            data={forecastChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    y: { border: { display: false }, grid: { color: '#f1f5f9' } },
                                    x: { border: { display: false }, grid: { display: false } }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
