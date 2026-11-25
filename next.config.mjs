import './scripts/reference.mjs';

function storagePattern() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    if (url.protocol !== 'https:') return [];
    return [{ protocol: 'https', hostname: url.hostname, port: url.port, pathname: '/storage/v1/object/**' }];
  } catch {
    return [];
  }
}

export default {
  poweredByHeader: false,
  skipTrailingSlashRedirect: true,
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  images: {
    remotePatterns: [
      ...storagePattern(),
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/v1/object/**' },
      { protocol: 'https', hostname: 'upload.wikimedia.org', pathname: '/wikipedia/**' },
      { protocol: 'https', hostname: 'cabinetsbay.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'hrksumon.chatgpt.site', pathname: '/**' }
    ]
  }
};
