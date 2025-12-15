// src/services/api.js
import { supabase } from '../lib/supabase';

// Mock Data for "Mock Mode"
const MOCK_RESPONSE = {
    score: 88,
    summary: "Candidate shows strong alignment with the Product Manager role. Key strengths include 5+ years of Agile experience and a background in SaaS. However, they lack specific experience with SQL as requested in the JD.",
    recommendation: "Interview",
    details: [
        { criteria: "Experience", status: "match", reason: "7 years in Product Management" },
        { criteria: "Tech Stack", status: "partial", reason: "Familiar with Jira, but no SQL" },
        { criteria: "Education", status: "match", reason: "MBA from Top Tier University" }
    ],
    candidateName: "John Doe",
    candidateEmail: "john.doe@example.com"
};

// Environment variables
// Environment variables
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || "http://localhost:5678/webhook/recruit-ai-action";

/**
 * Get user's active provider and settings from Supabase
 */
const getUserSettings = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
            .from('settings')
            .select('active_provider, provider_config')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user settings:', error);
            return { userId: user.id, provider: 'openai', providerConfig: null };
        }

        return {
            userId: user.id,
            provider: data?.active_provider || 'openai',
            providerConfig: data?.provider_config || null
        };
    } catch (error) {
        console.error('Error getting user settings:', error);
        throw error;
    }
};

/**
 * Get auth token for n8n validation
 */
const getAuthToken = async () => {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token || null;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

/**
 * Analyze candidate resume against job description
 * @param {string} jdText - Job description text
 * @param {string} resumeText - Resume text
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeCandidate = async (jdText, resumeText) => {
    // TOGGLE THIS FOR REAL INTEGRATION
    const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false;

    if (USE_MOCK) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MOCK_RESPONSE);
            }, 2000); // Simulate network delay
        });
    }

    try {
        // Get user settings and auth token
        const { userId, provider } = await getUserSettings();
        const authToken = await getAuthToken();

        // Make request to n8n webhook
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authToken && { "Authorization": `Bearer ${authToken}` })
            },
            body: JSON.stringify({
                action: 'analyze',
                jd: jdText,
                resume: resumeText,
                provider: provider,
                userId: userId,
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: Failed to analyze candidate`);
        }

        let result = await response.json();
        console.log('Raw n8n response:', result);

        // Handle n8n array response
        if (Array.isArray(result)) {
            console.log('Unwrapping array response');
            result = result[0];
        }

        // Handle n8n standard "json" wrapper
        if (result && result.json) {
            console.log('Unwrapping json property');
            result = result.json;
        }

        console.log('Final unwrapped result:', result);

        // Validate that we have essential data
        if (!result || typeof result.score === 'undefined' || !result.summary) {
            console.error('Invalid analysis result:', result);
            throw new Error('Analysis completed but returned incomplete data. Please try again.');
        }

        // Save screening result to Supabase
        await saveScreening(result, jdText, resumeText);

        return result;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

/**
 * Save screening result to Supabase
 * @param {Object} result - Analysis result
 * @param {string} jdText - Job description text
 * @param {string} resumeText - Resume text
 */
export const saveScreening = async (result, jdText, resumeText) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('screenings')
            .insert([{
                user_id: user.id,
                candidate_name: result.candidateName || 'Unknown',
                candidate_email: result.candidateEmail || null,
                position_title: extractPositionTitle(jdText),
                score: result.score,
                recommendation: result.recommendation,
                summary: result.summary,
                details: result.details || [],
                raw_jd: jdText,
                raw_resume: resumeText
            }]);

        if (error) {
            console.error('Error saving screening:', error);
        }
    } catch (error) {
        console.error('Error saving screening:', error);
    }
};

/**
 * Get screening history from Supabase
 * @param {Object} filters - Filter options (status, sortBy, limit)
 * @returns {Promise<Array>} Screening history
 */
export const getScreenings = async (filters = {}) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        let query = supabase
            .from('screenings')
            .select('*')
            .eq('user_id', user.id);

        // Apply filters
        if (filters.status && filters.status !== 'all') {
            query = query.eq('recommendation', filters.status === 'interview' ? 'Interview' : 'Reject');
        }

        // Apply sorting
        const sortBy = filters.sortBy || 'date';
        if (sortBy === 'date') {
            query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'score') {
            query = query.order('score', { ascending: false });
        }

        // Apply limit
        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching screenings:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching screenings:', error);
        return [];
    }
};

/**
 * Send email to candidate
 * @param {string} screeningId - Screening ID
 * @param {string} type - Email type ('interview' or 'rejection')
 * @returns {Promise<Object>} Email send result
 */
export const sendEmail = async (screeningId, type) => {
    try {
        const { userId } = await getUserSettings();
        const authToken = await getAuthToken();

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authToken && { "Authorization": `Bearer ${authToken}` })
            },
            body: JSON.stringify({
                action: 'send_email',
                userId,
                screeningId,
                type,
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to send email");
        }

        return await response.json();
    } catch (error) {
        console.error("Email API Error:", error);
        throw error;
    }
};

/**
 * Schedule interview on calendar
 * @param {string} screeningId - Screening ID
 * @param {string} datetime - Interview datetime (ISO 8601)
 * @returns {Promise<Object>} Calendar event result
 */
export const scheduleInterview = async (screeningId, datetime) => {
    try {
        const { userId } = await getUserSettings();
        const authToken = await getAuthToken();

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(authToken && { "Authorization": `Bearer ${authToken}` })
            },
            body: JSON.stringify({
                action: 'schedule_interview',
                userId,
                screeningId,
                datetime,
                timestamp: new Date().toISOString()
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to schedule interview");
        }

        return await response.json();
    } catch (error) {
        console.error("Calendar API Error:", error);
        throw error;
    }
};

/**
 * Helper function to extract position title from JD
 * @param {string} jdText - Job description text
 * @returns {string} Position title
 */
const extractPositionTitle = (jdText) => {
    // Simple extraction - look for common patterns
    const lines = jdText.split('\n');
    const firstLine = lines[0]?.trim();

    // If first line looks like a title (short, no special chars)
    if (firstLine && firstLine.length < 100 && !firstLine.includes(':')) {
        return firstLine;
    }

    // Look for "Position:", "Role:", "Title:" patterns
    for (const line of lines) {
        const match = line.match(/(?:position|role|title|job):\s*(.+)/i);
        if (match) {
            return match[1].trim();
        }
    }

    return 'Unknown Position';
};

/**
 * Update user settings
 * @param {Object} settings - Settings object
 */
export const updateSettings = async (settings) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('settings')
            .upsert({
                user_id: user.id,
                ...settings,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) throw error;
    } catch (error) {
        console.error('Error updating settings:', error);
        throw error;
    }
};

/**
 * Get user settings
 * @returns {Promise<Object>} User settings
 */
export const getSettings = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching settings:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
};
