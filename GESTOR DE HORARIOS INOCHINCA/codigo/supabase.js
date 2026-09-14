// Configuración de Supabase
const SUPABASE_URL = "https://crdlpylvxwcewfredjrw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZGxweWx2eHdjZXdmcmVkanJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MTEwMDIsImV4cCI6MjEwNDk4NzAwMn0.Y7BH5B9781k4Fm23opp83NGQUqSP_FayQTpCYXbM8T4";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
