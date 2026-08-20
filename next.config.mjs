/** @type {import('next').NextConfig} */
const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let dynamicSupabaseHost = 'regucynzyykcqhjvreiw.supabase.co';
if (envSupabaseUrl) {
  try {
    dynamicSupabaseHost = new URL(envSupabaseUrl).hostname;
  } catch {}
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'regucynzyykcqhjvreiw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'regucynzyykcqhjvreiw.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: dynamicSupabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: dynamicSupabaseHost,
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;

