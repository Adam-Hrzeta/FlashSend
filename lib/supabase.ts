import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ptdujbqrnhyigzvqspww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZHVqYnFybmh5aWd6dnFzcHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2OTcyMzYsImV4cCI6MjA1NDI3MzIzNn0._a0EYQrrLngvzfphM_lo_c9sfapUXqp8LeG3FgKxjQ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
