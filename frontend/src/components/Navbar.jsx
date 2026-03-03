import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Receipt, BarChart3, Wallet, LogOut, PlusCircle, Users, Menu, X, ChevronRight } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        showSnackbar('Session terminated securely.', 'info');
        navigate('/');
        setIsMenuOpen(false);
    };

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Expenses', path: '/expenses', icon: Receipt },
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Budgets', path: '/budgets', icon: Wallet },
        { label: 'Family', path: '/family', icon: Users },
    ];

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="group flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform duration-300">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">Expense<span className="text-indigo-600">Flow</span></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        {user ? (
                            <>
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`nav-link ${location.pathname === item.path ? 'nav-link-active' : ''}`}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                ))}
                                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-100">
                                    <Link to="/add-expense" className="btn-primary !px-5 !py-2.5 !rounded-2xl text-sm whitespace-nowrap">
                                        <PlusCircle className="w-4 h-4" />
                                        <span>Add Expense</span>
                                    </Link>
                                    <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="px-5 py-2.5 text-slate-600 hover:text-indigo-600 font-bold transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary !px-6 !py-2.5">Start Tracking</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden flex items-center gap-4">
                        {user && (
                            <Link to="/add-expense" className="p-2 text-indigo-600 bg-indigo-50 rounded-xl">
                                <PlusCircle className="w-6 h-6" />
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-2xl"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`lg:hidden absolute inset-x-0 top-20 bg-white border-b border-slate-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-[90vh] py-6' : 'max-h-0'}`}>
                <div className="px-4 space-y-2">
                    {user ? (
                        <>
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center justify-between p-4 rounded-2xl ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-4 font-bold">
                                        <div className={`p-2 rounded-xl ${location.pathname === item.path ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'}`}>
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        {item.label}
                                    </div>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 p-4 text-red-600 bg-red-50 rounded-2xl font-bold mt-4"
                            >
                                <div className="p-2 bg-red-600 text-white rounded-xl">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                Sign Out Account
                            </button>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <Link to="/login" className="block w-full text-center py-4 text-slate-900 font-bold bg-slate-50 rounded-2xl">Login</Link>
                            <Link to="/register" className="block w-full text-center py-4 bg-indigo-600 text-white font-bold rounded-2xl">Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
