import { router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/app/supabase';
export default function IndexPage() {
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.replace('/(tabs)');
            } else {
                router.replace('/(auth)/login');
            }
        });
    }, []);

    return null;
}
