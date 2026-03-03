import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ExpenseListPage from './pages/ExpenseListPage';
import AddExpensePage from './pages/AddExpensePage';
import AnalyticsPage from './pages/AnalyticsPage';
import BudgetPage from './pages/BudgetPage';
import FamilyPage from './pages/FamilyPage';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return children;
};

function AppRoutes() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-grow">
                <Routes>
                    <Route path="/" element={<div className="container mx-auto px-4 py-8 md:py-16"><LandingPage /></div>} />
                    <Route path="/login" element={<div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4"><LoginPage /></div>} />
                    <Route path="/register" element={<div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4"><RegisterPage /></div>} />
                    <Route path="/dashboard" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><Dashboard /></div></ProtectedRoute>} />
                    <Route path="/expenses" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><ExpenseListPage /></div></ProtectedRoute>} />
                    <Route path="/add-expense" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><AddExpensePage /></div></ProtectedRoute>} />
                    <Route path="/edit-expense/:id" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><AddExpensePage /></div></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><AnalyticsPage /></div></ProtectedRoute>} />
                    <Route path="/budgets" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><BudgetPage /></div></ProtectedRoute>} />
                    <Route path="/family" element={<ProtectedRoute><div className="container mx-auto px-4 py-8"><FamilyPage /></div></ProtectedRoute>} />
                </Routes>
            </main>
        </div>
    );
}

import { SnackbarProvider } from './context/SnackbarContext';

function App() {
    return (
        <AuthProvider>
            <SnackbarProvider>
                <AppRoutes />
            </SnackbarProvider>
        </AuthProvider>
    );
}

export default App;
