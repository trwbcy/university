/* =========================================================================
   KONFIGURASI SUPABASE
   -------------------------------------------------------------------------
   Isi dua nilai di bawah dengan punyamu sendiri dari dashboard Supabase:
   Settings > API > "Project URL" dan "anon public" key.

   Selama masih kosong, aplikasi otomatis jalan dalam MODE LOKAL
   (data tersimpan di browser saja). Begitu diisi benar, aplikasi
   otomatis pindah ke MODE CLOUD (login + sync antar-perangkat).

   File ini aman dibuat publik di GitHub: anon key memang dirancang
   untuk dipakai di sisi browser, dan data tetap terlindungi oleh
   Row Level Security (RLS) yang kamu pasang lewat file SQL.
   ========================================================================= */

window.SUPABASE_CONFIG = {
  url: 'https://cvepcazkropqihazpmpc.supabase.co',      // contoh: 'https://abcdxyz.supabase.co'
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2ZXBjYXprcm9wcWloYXpwbXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODIwNDMsImV4cCI6MjA5NzU1ODA0M30.kFpNsgzEoUHPP90hETUBfvdvL90YGS5zhtEWVYWfFbA'   // contoh: 'eyJhbGciOiateLONGstring...'
};
