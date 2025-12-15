// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Helper function to get current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting current user:', error);
        return null;
    }
    return user;
};

// Helper function to get user profile
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
};

// Helper function to create user profile
export const createUserProfile = async (userId, userData) => {
    const { data, error } = await supabase
        .from('profiles')
        .insert([
            {
                id: userId,
                name: userData.name,
                email: userData.email,
                avatar_url: userData.avatar_url || null,
                role: userData.role || 'Talent Acquisition'
            }
        ])
        .select()
        .single();

    if (error) {
        console.error('Error creating user profile:', error);
        return null;
    }
    return data;
};

// Helper function to update user profile
export const updateUserProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user profile:', error);
        return null;
    }
    return data;
};
