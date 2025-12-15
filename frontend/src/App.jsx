import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './components/Login';
import Profile from './components/Profile';
import FileUpload from './components/FileUpload';
import CandidateCard from './components/CandidateCard';
import BulkUpload from './components/BulkUpload';
import ScreeningHistory from './components/ScreeningHistory';
import SettingsPanel from './components/SettingsPanel';
import { analyzeCandidate } from './services/api';
import { supabase, getUserProfile } from './lib/supabase';
import { Sparkles, Users, Clock } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [activeView, setActiveView] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch user profile
          const profile = await getUserProfile(session.user.id);

          setUser({
            id: session.user.id,
            name: profile?.name || session.user.user_metadata?.name || 'User',
            email: session.user.email,
            avatar: profile?.avatar_url || null,
            role: profile?.role || 'Talent Acquisition'
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile
        const profile = await getUserProfile(session.user.id);

        setUser({
          id: session.user.id,
          name: profile?.name || session.user.user_metadata?.name || 'User',
          email: session.user.email,
          avatar: profile?.avatar_url || null,
          role: profile?.role || 'Talent Acquisition'
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setActiveView('dashboard');
        setActiveTab('single');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setActiveView('dashboard');
      setActiveTab('single');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleAnalyze = async (jdText, resumeText) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeCandidate(jdText, resumeText);
      console.log('Analysis Result:', data);
      setResult(data);
      return data;
    } catch (err) {
      setError("Failed to analyze candidate. Please try again.");
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNavigation = (view) => {
    setActiveView(view);
    if (view === 'dashboard') {
      setActiveTab('single');
    }
  };

  const tabs = [
    { id: 'single', label: 'Single Screening', icon: <Sparkles size={18} /> },
    { id: 'bulk', label: 'Bulk Upload', icon: <Users size={18} /> },
    { id: 'history', label: 'History', icon: <Clock size={18} /> }
  ];

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-glow text-white font-bold text-2xl mx-auto mb-4 animate-pulse">
            RA
          </div>
          <p className="text-surface-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <Layout
        activeView={activeView}
        onNavigate={handleNavigation}
        user={user}
        onProfileClick={() => setShowProfile(true)}
        onLogout={handleLogout}
      >
        <div className="max-w-5xl mx-auto pt-4">
          {/* Show different content based on activeView */}
          {activeView === 'dashboard' && (
            <>
              {/* Tab Navigation */}
              <div className="mb-8 glass rounded-2xl p-2 inline-flex gap-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all
                      ${activeTab === tab.id
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'text-surface-600 hover:bg-surface-50'}
                    `}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'single' && (
                <div>
                  <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-display font-bold text-surface-900 mb-3 tracking-tight">
                      AI Screening Agent
                    </h1>
                    <p className="text-lg text-surface-500 max-w-2xl">
                      Upload a Job Description and a Candidate Resume. The agent will analyze fit, detect key criteria, and provide a hiring recommendation in seconds.
                    </p>
                  </div>

                  <FileUpload onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />

                  {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 flex items-center justify-center font-medium">
                      {error}
                    </div>
                  )}

                  {result && <CandidateCard result={result} />}
                </div>
              )}

              {activeTab === 'bulk' && (
                <div>
                  <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-display font-bold text-surface-900 mb-3 tracking-tight">
                      Bulk Candidate Screening
                    </h1>
                    <p className="text-lg text-surface-500 max-w-2xl">
                      Upload one Job Description and multiple resumes. The agent will process them all and rank candidates by fit.
                    </p>
                  </div>
                  <BulkUpload onAnalyze={handleAnalyze} />
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-display font-bold text-surface-900 mb-3 tracking-tight">
                      Screening History
                    </h1>
                    <p className="text-lg text-surface-500 max-w-2xl">
                      View all past screenings, track candidate progress, and export reports.
                    </p>
                  </div>
                  <ScreeningHistory />
                </div>
              )}
            </>
          )}

          {activeView === 'candidates' && (
            <div>
              <div className="mb-10">
                <h1 className="text-4xl font-display font-bold text-surface-900 mb-3 tracking-tight">
                  All Candidates
                </h1>
                <p className="text-lg text-surface-500">
                  Manage and review all candidates in your pipeline.
                </p>
              </div>
              <ScreeningHistory />
            </div>
          )}

          {activeView === 'settings' && (
            <div>
              <div className="mb-10">
                <h1 className="text-4xl font-display font-bold text-surface-900 mb-3 tracking-tight">
                  Settings
                </h1>
                <p className="text-lg text-surface-500 mb-8">
                  Configure your Recruit-AI preferences and integrations.
                </p>
              </div>
              <SettingsPanel />
            </div>
          )}
        </div>
      </Layout>

      {/* Profile Modal */}
      {showProfile && (
        <Profile
          user={user}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowProfile(false)}
        />
      )}
    </>
  );
}

export default App;
