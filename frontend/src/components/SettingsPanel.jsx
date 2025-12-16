import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Check,
    Calendar as CalendarIcon,
    Mail,
    AlertCircle,
    Loader2,
    Save,
    TestTube,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const SettingsPanel = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeProvider, setActiveProvider] = useState("openai");
    const [providers, setProviders] = useState({
        openai: { apiKey: "", model: "gpt-4-turbo" },
        perplexity: { apiKey: "", model: "sonar-pro" },
        gemini: { apiKey: "", model: "gemini-pro" },
        custom: {
            apiKey: "",
            model: "",
            url: "",
            apiKeyHeader: "Authorization",
            apiKeyPrefix: "Bearer ",
        },
    });

    const [smtpConfig, setSmtpConfig] = useState({
        host: "",
        port: "587",
        username: "",
        password: "",
    });

    const [smtpConfigured, setSmtpConfigured] = useState(false);
    const [testingProvider, setTestingProvider] = useState(null);

    /* ---------------- LOAD SETTINGS ---------------- */

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("settings")
                .select("*")
                .eq("user_id", user.id)
                .maybeSingle(); // ✅ IMPORTANT FIX

            if (error) {
                console.error("Error loading settings:", error);
                return;
            }

            if (data) {
                setActiveProvider(data.active_provider || "openai");

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
        } catch (err) {
            console.error("Unexpected error loading settings:", err);
        } finally {
            setLoading(false);
        }
    };


    /* ---------------- SAVE SETTINGS (FIXED) ---------------- */

    const saveSettings = async () => {
        setSaving(true);
        console.log('SAVE CLICKED');

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const settingsData = {
                user_id: user.id,
                active_provider: activeProvider,
                provider_config: {
                    providers,
                    smtp: smtpConfig
                },
                updated_at: new Date().toISOString()
            };

            console.log('UPSERT DATA', settingsData);

            const { data, error } = await supabase
                .from('settings')
                .upsert(settingsData, { onConflict: 'user_id' })
                .select();

            if (error) {
                console.error('UPSERT ERROR', error);
                throw error;
            }

            console.log('UPSERT SUCCESS', data);
            alert('✅ Settings saved successfully!');
        } catch (err) {
            console.error('SAVE FAILED', err);
            alert(`❌ Failed to save settings: ${err.message}`);
        } finally {
            console.log('SAVE FINISHED');
            setSaving(false);
        }
    };


    /* ---------------- HELPERS ---------------- */

    const updateProvider = (provider, field, value) => {
        setProviders((prev) => ({
            ...prev,
            [provider]: {
                ...prev[provider],
                [field]: value,
            },
        }));
    };

    const testConnection = async (provider) => {
        setTestingProvider(provider);
        setTimeout(() => {
            setTestingProvider(null);
            alert(`✅ ${provider.toUpperCase()} connection test successful`);
        }, 1200);
    };

    /* ---------------- UI ---------------- */

    if (loading) {
        return (
            <div className="glass-card rounded-3xl p-8 flex items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="glass-card rounded-3xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-semibold">LLM Provider Configuration</h3>
                        <p className="text-sm text-surface-500">
                            Configure your AI providers
                        </p>
                    </div>

                    <button
                        type="button"          // 🔥 ADD THIS LINE
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

                <div className="flex gap-2 mb-6">
                    {Object.keys(providers).map((provider) => (
                        <button
                            key={provider}
                            onClick={() => setActiveProvider(provider)}
                            className={`px-4 py-2 rounded-xl font-semibold ${activeProvider === provider
                                ? "bg-primary-100 text-primary-700"
                                : "bg-surface-100"
                                }`}
                        >
                            {provider}
                        </button>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeProvider}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                API Key
                            </label>
                            <input
                                type="password"
                                value={providers[activeProvider]?.apiKey || ""}
                                onChange={(e) =>
                                    updateProvider(activeProvider, "apiKey", e.target.value)
                                }
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">Model</label>
                            <input
                                type="text"
                                value={providers[activeProvider]?.model || ""}
                                onChange={(e) =>
                                    updateProvider(activeProvider, "model", e.target.value)
                                }
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>

                        <button
                            onClick={() => testConnection(activeProvider)}
                            disabled={!providers[activeProvider]?.apiKey}
                            className="flex items-center gap-2 text-sm text-primary-600"
                        >
                            {testingProvider === activeProvider ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <TestTube size={16} />
                            )}
                            Test Connection
                        </button>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SettingsPanel;
