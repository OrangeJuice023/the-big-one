/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: `output: 'export'` was removed to enable the /api/ask route.
  //
  // Static export produces no server, so API routes do not exist in the
  // deployed output — /api/ask would 404 on Vercel. The RAG query layer needs
  // a server-side function to hold the GROQ_API_KEY (it must never reach the
  // browser) and to run retrieval.
  //
  // Cost impact on Vercel Hobby is negligible: the endpoint is a single
  // lightweight function, retrieval is pure JS over a bundled ~160KB corpus,
  // and the free tier covers far more invocations than a research demo needs.
  // Every other page in the app is still statically rendered.
  //
  // If you ever need pure static again, delete web/src/app/api/ and
  // web/src/app/ask/, then restore `output: 'export'`.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
