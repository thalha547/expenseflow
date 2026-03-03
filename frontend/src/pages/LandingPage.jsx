import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, PieChart, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="max-w-6xl mx-auto py-4">
            <div className="text-center mb-16 md:mb-24">
                <h1 className="text-5xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                    Manage your money <br />
                    <span className="text-primary-600">with intelligence.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                    ExpenseFlow helps you track, analyze, and visualize your monthly spending so you can make smarter financial decisions.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
                    <Link to="/register" className="btn-primary !px-10 !py-4 text-lg w-full sm:w-auto">
                        Start Tracking for Free <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/login" className="btn-secondary !px-10 !py-4 text-lg w-full sm:w-auto">
                        View Demo
                    </Link>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-10 mb-20 md:mb-32">
                <div className="card text-center p-10 flex flex-col items-center">
                    <div className="bg-primary-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8">
                        <TrendingUp className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Spending Trends</h3>
                    <p className="text-slate-600 leading-relaxed">Visualize your monthly spending patterns with interactive bar and line charts.</p>
                </div>
                <div className="card text-center p-10 flex flex-col items-center">
                    <div className="bg-emerald-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8">
                        <PieChart className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Categorization</h3>
                    <p className="text-slate-600 leading-relaxed">Break down your expenses by category to see exactly where your money goes.</p>
                </div>
                <div className="card text-center p-10 flex flex-col items-center">
                    <div className="bg-purple-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8">
                        <ShieldCheck className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Secure & Private</h3>
                    <p className="text-slate-600 leading-relaxed">Your data is encrypted and secure. We focus on privacy and data integrity.</p>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-20 text-center text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">Ready to take control?</h2>
                    <p className="text-slate-400 mb-12 max-w-xl mx-auto text-lg">Join thousands of users who are already saving more by tracking their expenses with ExpenseFlow.</p>
                    <Link to="/register" className="bg-white text-slate-900 px-12 py-4 rounded-2xl font-bold hover:bg-primary-50 transition-all inline-block active:scale-95">
                        Create Your Account
                    </Link>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-600/30 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/30 rounded-full blur-[100px]"></div>
            </div>
        </div>
    );
};

export default LandingPage;
