import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://xolhlpyafbnhvsuxebgg.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImY5MjQzMzUwLTBhNGYtNGRiZi04MDI1LWQ3N2U0YzRmNDIxNiJ9.eyJwcm9qZWN0SWQiOiJ4b2xobHB5YWZibmh2c3V4ZWJnZyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY5MTczNTg0LCJleHAiOjIwODQ1MzM1ODQsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.AHaVC6salZVYx6pN2qSXIIoE6hlt1u1pKVmj4ADsxJM';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };