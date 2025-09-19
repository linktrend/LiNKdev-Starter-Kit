/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'http',  hostname: '127.0.0.1', port: '64321' }, // Supabase Studio
      { protocol: 'https', hostname: '**.supabase.co' }
    ],
  },
};
export default config;
