/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "Dossier" was the old name for the page that gathers every saved decision.
  // Learner feedback said the word taught nothing, so the surface is now
  // "your plan"; the old path keeps working for anyone holding a link to it.
  async redirects() {
    return [{ source: "/dossier", destination: "/plan", permanent: false }];
  },
};

module.exports = nextConfig;
