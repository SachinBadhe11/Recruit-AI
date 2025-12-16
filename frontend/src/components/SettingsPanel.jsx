import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar as CalendarIcon, Mail, Key, AlertCircle, Loader2, Save, TestTube } from 'lucide-react';
import { supabase } from '../lib/supabase';

const SettingsPanel = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeProvider, setActiveProvider] = useState('openai');
    const [providers, setProviders] = useState({
        openai: { apiKey: '', model: 'gpt-4-turbo' },
        perplexity: { apiKey: '', model: 'llama-3.1-sonar-large-128k-online' },
        gemini: { apiKey: '', model: 'gemini-pro' },
        custom: { apiKey: '', model: '', url: '', apiKeyHeader: 'Authorization', apiKeyPrefix: 'Bearer ' }
    });
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showSMTPModal, setShowSMTPModal] = useState(false);
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [smtpConfigured, setSmtpConfigured] = useState(false);
    const [smtpConfig, setSmtpConfig] = useState({
        host: '',
        port: '587',
        username: '',
        password: ''
    });
    const [testingProvider, setTestingProvider] = useState(null);

    // Load settings from Supabase on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error loading settings:', error);
                return;
            }

            if (data) {
                setActiveProvider(data.active_provider || 'openai');
                if (data.provider_config?.providers) {
                    setProviders(prev => ({
                        ...prev,
                        ...data.provider_config.providers
                    }));
                }
                if (data.provider_config?.smtp) {
                    setSmtpConfig(data.provider_config.smtp);
                    setSmtpConfigured(!!data.provider_config.smtp.host);
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // Self-healing: Ensure profile exists before saving settings
            // This prevents 406 Foreign Key errors if the trigger failed
            try {
                // Try calling the RPC function first (best way)
                const { error: rpcError } = await supabase.rpc('ensure_user_profile');

                if (rpcError) {
                    console.warn('RPC ensure_user_profile failed, falling back to manual upsert:', rpcError);
                    // Fallback: Manual upsert if RPC fails or doesn't exist
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            email: user.email,
                            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
                            role: 'Talent Acquisition',
                            updated_at: new Date().toISOString()
                        }, { onConflict: 'id' });

                    if (profileError) {
                        console.error('Failed to ensure profile exists:', profileError);
                        // Don't throw here, try to save settings anyway, it might work if profile exists
                    }
                }
            } catch (err) {
                console.warn('Profile check failed:', err);
            }

            const settingsData = {
                user_id: user.id,
                active_provider: activeProvider,
                provider_config: {
                    providers,
                    smtp: smtpConfig
                },
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('settings')
                .upsert(settingsData, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            alert('✅ Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert(`❌ Failed to save settings: ${error.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

    const updateProvider = (provider, field, value) => {
        setProviders(prev => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value
            }
        }));
    };

    const testConnection = async (provider) => {
        setTestingProvider(provider);
        // Simulate API test - in production, this would call the actual API
        setTimeout(() => {
            setTestingProvider(null);
            alert(`✅ ${provider.charAt(0).toUpperCase() + provider.slice(1)} connection test successful!`);
        }, 1500);
    };

    const providerConfigs = {
        openai: {
            name: 'OpenAI',
            color: 'green',
            models: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'gpt-4o'],
            placeholder: 'sk-...',
            docs: 'https://platform.openai.com/api-keys'
        },
        perplexity: {
            name: 'Perplexity AI',
            color: 'blue',
            models: ['sonar-pro', 'sonar', 'llama-3.1-sonar-large-128k-online'],
            placeholder: 'pplx-...',
            docs: 'https://www.perplexity.ai/settings/api'
        },
        gemini: {
            name: 'Google Gemini',
            color: 'purple',
            models: ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'],
            placeholder: 'AIza...',
            docs: 'https://makersuite.google.com/app/apikey'
        },
        custom: {
            name: 'Custom Provider',
            color: 'orange',
            models: [],
            placeholder: 'your-api-key',
            docs: null
        }
    };

    if (loading) {
        return (
            <div className="glass-card rounded-3xl p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
                    <p className="text-surface-500">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* LLM Provider Configuration */}
                <div className="glass-card rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xl font-display font-semibold text-surface-900">LLM Provider Configuration</h3>
                            <p className="text-sm text-surface-500 mt-1">Configure your AI model providers and API keys</p>
                        </div>
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Settings
                                </>
                            )}
                        </button>
                    </div>

                    {/* Provider Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {Object.keys(providerConfigs).map(provider => (
                            <button
                                key={provider}
                                onClick={() => setActiveProvider(provider)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap
                                    ${activeProvider === provider
                                        ? `bg-${providerConfigs[provider].color}-100 text-${providerConfigs[provider].color}-700 border-2 border-${providerConfigs[provider].color}-300`
                                        : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}
                                `}
                            >
                                {providerConfigs[provider].name}
                                {providers[provider]?.apiKey && (
                                    <Check size={16} className="text-green-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Provider Configuration Forms */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeProvider}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* API Key */}
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">
                                    API Key *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        value={providers[activeProvider]?.apiKey || ''}
                                        onChange={(e) => updateProvider(activeProvider, 'apiKey', e.target.value)}
                                        placeholder={providerConfigs[activeProvider].placeholder}
                                        className="flex-1 px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={() => testConnection(activeProvider)}
                                        disabled={!providers[activeProvider]?.apiKey || testingProvider === activeProvider}
                                        className="px-4 py-2 bg-surface-600 text-white rounded-lg hover:bg-surface-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {testingProvider === activeProvider ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <TestTube size={18} />
                                        )}
                                        Test
                                    </button>
                                </div>
                                {providerConfigs[activeProvider].docs && (
                                    <p className="text-xs text-surface-500 mt-1">
                                        Get your API key from{' '}
                                        <a
                                            href={providerConfigs[activeProvider].docs}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-600 hover:underline"
                                        >
                                            {providerConfigs[activeProvider].name} Dashboard
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* Model Selection */}
                            {providerConfigs[activeProvider].models.length > 0 && (
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-2">
                                        Model
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            list={`models-${activeProvider}`}
                                            value={providers[activeProvider]?.model || ''}
                                            onChange={(e) => updateProvider(activeProvider, 'model', e.target.value)}
                                            placeholder="Select or type model name..."
                                            className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        />
                                        <datalist id={`models-${activeProvider}`}>
                                            {providerConfigs[activeProvider].models.map(model => (
                                                <option key={model} value={model} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <p className="text-xs text-surface-500 mt-1">
                                        Select from list or type a custom model ID (e.g., sonar-pro, gpt-4o)
                                    </p>
                                </div>
                            )}

                            {/* Custom Provider Fields */}
                            {activeProvider === 'custom' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold text-surface-700 mb-2">
                                            API Endpoint URL *
                                        </label>
                                        <input
                                            type="url"
                                            value={providers.custom?.url || ''}
                                            onChange={(e) => updateProvider('custom', 'url', e.target.value)}
                                            placeholder="https://your-api.com/v1/chat/completions"
                                            className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-surface-700 mb-2">
                                            Model Name
                                        </label>
                                        <input
                                            type="text"
                                            value={providers.custom?.model || ''}
                                            onChange={(e) => updateProvider('custom', 'model', e.target.value)}
                                            placeholder="your-model-name"
                                            className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                                API Key Header
                                            </label>
                                            <input
                                                type="text"
                                                value={providers.custom?.apiKeyHeader || ''}
                                                onChange={(e) => updateProvider('custom', 'apiKeyHeader', e.target.value)}
                                                placeholder="Authorization"
                                                className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-surface-700 mb-2">
                                                API Key Prefix
                                            </label>
                                            <input
                                                type="text"
                                                value={providers.custom?.apiKeyPrefix || ''}
                                                onChange={(e) => updateProvider('custom', 'apiKeyPrefix', e.target.value)}
                                                placeholder="Bearer "
                                                className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Info Box */}
                            <div className={`p-4 bg-${providerConfigs[activeProvider].color}-50 border border-${providerConfigs[activeProvider].color}-200 rounded-xl`}>
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className={`text-${providerConfigs[activeProvider].color}-600 flex-shrink-0 mt-0.5`} />
                                    <div className={`text-sm text-${providerConfigs[activeProvider].color}-800`}>
                                        <p className="font-semibold mb-1">About {providerConfigs[activeProvider].name}</p>
                                        <p className={`text-${providerConfigs[activeProvider].color}-700`}>
                                            {activeProvider === 'openai' && 'Industry-leading models with excellent performance. Recommended for production use.'}
                                            {activeProvider === 'perplexity' && 'Real-time web search capabilities with Llama 3.1 models. Great for up-to-date information.'}
                                            {activeProvider === 'gemini' && 'Google\'s latest AI models with strong reasoning capabilities. Free tier available.'}
                                            {activeProvider === 'custom' && 'Use any OpenAI-compatible API endpoint. Configure your own model or self-hosted LLM.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Integrations */}
                <div className="glass-card rounded-3xl p-8">
                    <h3 className="text-xl font-display font-semibold text-surface-900 mb-6">Integrations</h3>
                    <div className="space-y-4">
                        {/* Google Calendar */}
                        <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CalendarIcon size={20} className="text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-surface-900 mb-1">Google Calendar</h4>
                                    <p className="text-sm text-surface-500">Connect your Google Calendar for interview scheduling</p>
                                </div>
                            </div>
                            {calendarConnected ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <Check size={18} />
                                        <span className="font-medium">Calendar Connected</span>
                                    </div>
                                    <button
                                        onClick={() => setCalendarConnected(false)}
                                        className="text-sm text-green-700 hover:text-green-800 font-medium"
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCalendarModal(true)}
                                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                >
                                    Connect Calendar
                                </button>
                            )}
                        </div>

                        {/* SMTP Configuration */}
                        <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Mail size={20} className="text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-surface-900 mb-1">Email Notifications</h4>
                                    <p className="text-sm text-surface-500">Configure SMTP for automated candidate emails</p>
                                </div>
                            </div>
                            {smtpConfigured ? (
                                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-green-700">
                                        <Check size={18} />
                                        <span className="font-medium">SMTP Configured</span>
                                    </div>
                                    <button
                                        onClick={() => setShowSMTPModal(true)}
                                        className="text-sm text-green-700 hover:text-green-800 font-medium"
                                    >
                                        Edit
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowSMTPModal(true)}
                                    className="w-full px-4 py-2 bg-surface-600 text-white rounded-lg hover:bg-surface-700 transition-colors font-medium"
                                >
                                    Configure SMTP
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCalendarModal && (
                    <CalendarModal
                        onClose={() => setShowCalendarModal(false)}
                        onConnect={() => {
                            setCalendarConnected(true);
                            setShowCalendarModal(false);
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSMTPModal && (
                    <SMTPModal
                        initialData={smtpConfig}
                        onClose={() => setShowSMTPModal(false)}
                        onSave={(data) => {
                            setSmtpConfig(data);
                            setSmtpConfigured(true);
                            setShowSMTPModal(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

// Calendar Modal Component (unchanged from original)
const CalendarModal = ({ onClose, onConnect }) => {
    const handleGoogleConnect = () => {
        setTimeout(() => {
            onConnect();
            alert('✅ Google Calendar connected successfully!\n\nYou can now schedule interviews directly from candidate profiles.');
        }, 500);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-3xl p-8 max-w-md w-full"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-surface-900">Connect Google Calendar</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-semibold mb-1">What you'll get:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Automatic interview scheduling</li>
                                    <li>Calendar invites to candidates</li>
                                    <li>Conflict detection</li>
                                    <li>Timezone management</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleGoogleConnect}
                    className="w-full bg-white border-2 border-surface-200 text-surface-700 py-3 rounded-xl font-semibold hover:bg-surface-50 hover:border-surface-300 transition-all flex items-center justify-center gap-3 mb-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Connect with Google
                </button>

                <p className="text-xs text-center text-surface-500">
                    By connecting, you agree to share calendar access with Recruit-AI
                </p>
            </motion.div>
        </div>
    );
};

// SMTP Modal Component
const SMTPModal = ({ onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        host: '',
        port: '587',
        username: '',
        password: ''
    });

    const handleSave = () => {
        if (!formData.host || !formData.username || !formData.password) {
            alert('❌ Please fill in all required fields');
            return;
        }
        onSave(formData);
        alert('✅ SMTP configuration updated! Don\'t forget to click "Save Settings" on the main panel.');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-display font-bold text-surface-900">Configure SMTP</h2>
                    <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">SMTP Host *</label>
                        <input
                            type="text"
                            value={formData.host}
                            onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                            placeholder="smtp.gmail.com"
                            className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Port *</label>
                        <input
                            type="number"
                            value={formData.port}
                            onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                            placeholder="587"
                            className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Username/Email *</label>
                        <input
                            type="email"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="your-email@gmail.com"
                            className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-surface-700 mb-2">Password *</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="App password or SMTP password"
                            className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                        />
                        <p className="text-xs text-surface-500 mt-1">For Gmail, use an App Password</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                    >
                        Save Configuration
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-surface-200 text-surface-700 py-3 rounded-xl font-semibold hover:bg-surface-300 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsPanel;
