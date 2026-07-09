/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // pure static: no server, no functions, no cost
  images: { unoptimized: true },
};
export default nextConfig;
