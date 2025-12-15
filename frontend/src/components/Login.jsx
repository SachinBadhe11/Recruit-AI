import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, createUserProfile } from '../lib/supabase';

const Login = ({ onLogin }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google'
                });
            });

            if (error) throw error;
            // OAuth will redirect, so we don't need to call onLogin here
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.message || 'Failed to sign in with Google. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validate email
        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        // Validate password
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                // Validate name for signup
                if (!formData.name || formData.name.trim().length < 2) {
                    setError('Please enter your full name');
                    setIsLoading(false);
                    return;
                }

                // Sign up with Supabase
                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            name: formData.name,
                            role: 'Talent Acquisition'
                        }
                    }
                });

                if (error) throw error;

                if (data.user) {
                    // Create profile in profiles table
                    await createUserProfile(data.user.id, {
                        name: formData.name,
                        email: formData.email,
                        role: 'Talent Acquisition'
                    });

                    // Create default settings
                    await supabase.from('settings').insert([{
                        user_id: data.user.id,
                        active_provider: 'openai',
                        provider_config: { providers: {} }
                    }]);

                    // Call onLogin with user data
                    onLogin({
                        id: data.user.id,
                        name: formData.name,
                        email: formData.email,
                        avatar: null,
                        role: 'Talent Acquisition'
                    });
                }
            } else {
                // Sign in with Supabase
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (error) throw error;

                if (data.user) {
                    // Fetch user profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single();

                    // Call onLogin with user data
                    onLogin({
                        id: data.user.id,
                        name: profile?.name || data.user.user_metadata?.name || 'User',
                        email: data.user.email,
                        avatar: profile?.avatar_url || null,
                        role: profile?.role || 'Talent Acquisition'
                    });
                }
            }
        } catch (err) {
            console.error('Auth error:', err);

            // Handle specific Supabase errors
            if (err.message.includes('User already registered')) {
                setError('An account with this email already exists. Please sign in.');
            } else if (err.message.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.');
            } else if (err.message.includes('Email not confirmed')) {
                setError('Please check your email and confirm your account before signing in.');
            } else {
                setError(err.message || 'An error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card rounded-3xl p-8 shadow-2xl">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-glow text-white font-bold text-2xl mx-auto mb-4">
                            RA
                        </div>
                        <h1 className="text-3xl font-display font-bold text-surface-900 mb-2">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <p className="text-surface-500">
                            {isSignUp ? 'Start screening candidates with AI' : 'Sign in to continue to Recruit-AI'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        type="button"
                        className="w-full mb-4 bg-white border-2 border-surface-200 text-surface-700 py-3 rounded-xl font-semibold hover:bg-surface-50 hover:border-surface-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    <div className="relative mb-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-surface-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    placeholder="Sarah Jenkins"
                                    required={isSignUp}
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    placeholder="sarah@company.com"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-surface-700 mb-2">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-10 pr-12 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {isSignUp && (
                                <p className="text-xs text-surface-500 mt-1">Minimum 6 characters</p>
                            )}
                        </div>

                        <motion.button
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Toggle */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                                setFormData({ name: '', email: '', password: '' });
                            }}
                            disabled={isLoading}
                            className="text-surface-600 hover:text-primary-600 font-medium transition-colors disabled:opacity-50"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
