/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",            // static HTML export → drag the /out folder to Netlify
  images: { unoptimized: true },
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;
