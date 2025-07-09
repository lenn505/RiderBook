import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
    'https://jdvjuwuxzmdnsntsvimg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkdmp1d3V4em1kbnNudHN2aW1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MDY2OTMsImV4cCI6MjA2NzE4MjY5M30.-gbsY3APqTfvPzH5itxPQvGO0OS4bbYThU7flVtv5mU'
);
