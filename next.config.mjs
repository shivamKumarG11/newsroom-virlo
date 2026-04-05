/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Turbopack alias: force jsPDF to use its browser UMD build.
  // The default Node build uses Worker/fflate which breaks SSR.
  turbopack: {
    resolveAlias: {
      jspdf: 'jspdf/dist/jspdf.umd.min.js',
    },
  },
}

export default nextConfig
