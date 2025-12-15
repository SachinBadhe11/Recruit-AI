import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Users, Filter, Download, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getScreenings } from '../services/api';

const ScreeningHistory = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [screenings, setScreenings] = useState([]);
    const [showFilter, setShowFilter] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    // Load screenings on mount
    useEffect(() => {
        loadScreenings();
    }, []);

    const loadScreenings = async () => {
        try {
            setLoading(true);
            const data = await getScreenings({ sortBy });
            setScreenings(data);
        } catch (error) {
            console.error('Error loading screenings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            const data = await getScreenings({ sortBy });
            setScreenings(data);
        } catch (error) {
            console.error('Error refreshing screenings:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSortChange = async (newSortBy) => {
        setSortBy(newSortBy);
        try {
            const data = await getScreenings({ sortBy: newSortBy });
            setScreenings(data);
        } catch (error) {
            console.error('Error sorting screenings:', error);
        }
    };

    const filteredScreenings = filterStatus === 'all'
        ? screenings
        : screenings.filter(s => {
            if (filterStatus === 'interview') return s.recommendation === 'Interview';
            if (filterStatus === 'reject') return s.recommendation === 'Reject';
            return true;
        });

    const stats = screenings.length > 0 ? {
        totalScreenings: screenings.length,
        avgScore: Math.round(screenings.reduce((acc, s) => acc + s.score, 0) / screenings.length),
        interviewRate: Math.round((screenings.filter(s => s.recommendation === "Interview").length / screenings.length) * 100)
    } : {
        totalScreenings: 0,
        avgScore: 0,
        interviewRate: 0
    };

    const handleExport = () => {
        if (filteredScreenings.length === 0) {
            alert('No screenings to export');
            return;
        }

        // Create CSV content
        const headers = ['Candidate', 'Email', 'Position', 'Score', 'Recommendation', 'Date'];
        const rows = filteredScreenings.map(s => [
            s.candidate_name || 'Unknown',
            s.candidate_email || 'N/A',
            s.position_title || 'Unknown Position',
            s.score,
            s.recommendation,
            new Date(s.created_at).toLocaleDateString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recruit-ai-screenings-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="glass-card rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                    <p className="text-surface-500">Loading screening history...</p>
                </div>
            </div>
        );
    }

    if (screenings.length === 0) {
        return (
            <div className="glass-card rounded-3xl p-12 text-center">
                <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-surface-400" />
                </div>
                <h3 className="text-xl font-display font-bold text-surface-900 mb-2">No Screenings Yet</h3>
                <p className="text-surface-500 mb-6">Start screening candidates to see your history here.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                    icon={<Users />}
                    label="Total Screenings"
                    value={stats.totalScreenings}
                    color="blue"
                />
                <StatCard
                    icon={<TrendingUp />}
                    label="Avg Match Score"
                    value={`${stats.avgScore}%`}
                    color="green"
                />
                <StatCard
                    icon={<Clock />}
                    label="Interview Rate"
                    value={`${stats.interviewRate}%`}
                    color="purple"
                />
            </div>

            {/* History Table */}
            <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-surface-200/50 flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h3 className="text-xl font-display font-bold text-surface-900">Screening History</h3>
                        <p className="text-sm text-surface-500 mt-1">{filteredScreenings.length} screenings</p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-xl text-surface-700 font-medium transition-colors border-none focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="date">Sort by Date</option>
                            <option value="score">Sort by Score</option>
                        </select>

                        {/* Filter Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                className="flex items-center gap-2 px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-xl text-surface-700 font-medium transition-colors"
                            >
                                <Filter size={18} />
                                Filter
                                {filterStatus !== 'all' && (
                                    <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">1</span>
                                )}
                            </button>
                            {showFilter && (
                                <div className="absolute right-0 mt-2 w-48 glass rounded-xl p-2 shadow-xl z-10">
                                    <button
                                        onClick={() => { setFilterStatus('all'); setShowFilter(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors ${filterStatus === 'all' ? 'bg-primary-50 text-primary-700 font-semibold' : ''}`}
                                    >
                                        All Candidates
                                    </button>
                                    <button
                                        onClick={() => { setFilterStatus('interview'); setShowFilter(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors ${filterStatus === 'interview' ? 'bg-primary-50 text-primary-700 font-semibold' : ''}`}
                                    >
                                        Interview
                                    </button>
                                    <button
                                        onClick={() => { setFilterStatus('reject'); setShowFilter(false); }}
                                        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-surface-100 transition-colors ${filterStatus === 'reject' ? 'bg-primary-50 text-primary-700 font-semibold' : ''}`}
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2 bg-surface-100 hover:bg-surface-200 rounded-xl text-surface-700 font-medium transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>

                        {/* Export Button */}
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                        >
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface-50">
                            <tr>
                                <th className="text-left p-4 font-semibold text-surface-700 text-sm">Candidate</th>
                                <th className="text-left p-4 font-semibold text-surface-700 text-sm">Position</th>
                                <th className="text-left p-4 font-semibold text-surface-700 text-sm">Score</th>
                                <th className="text-left p-4 font-semibold text-surface-700 text-sm">Recommendation</th>
                                <th className="text-left p-4 font-semibold text-surface-700 text-sm">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredScreenings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-surface-500">
                                        No screenings match your filter
                                    </td>
                                </tr>
                            ) : (
                                filteredScreenings.map((screening, index) => (
                                    <motion.tr
                                        key={screening.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium text-surface-900">{screening.candidate_name || 'Unknown'}</p>
                                                <p className="text-sm text-surface-500">{screening.candidate_email || 'No email'}</p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-surface-600">{screening.position_title || 'Unknown Position'}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full font-bold ${screening.score >= 80 ? 'bg-green-100 text-green-700' :
                                                screening.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {screening.score}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${screening.recommendation === 'Interview'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {screening.recommendation}
                                            </span>
                                        </td>
                                        <td className="p-4 text-surface-600 text-sm">{formatDate(screening.created_at)}</td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600'
    };

    return (
        <div className="glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
                    {React.cloneElement(icon, { size: 24 })}
                </div>
            </div>
            <p className="text-surface-500 text-sm font-medium mb-1">{label}</p>
            <p className="text-3xl font-display font-bold text-surface-900">{value}</p>
        </div>
    );
};

export default ScreeningHistory;
