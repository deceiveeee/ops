/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // "Dossier" was the old name for the page that gathers every saved decision.
  // Learner feedback said the word taught nothing, so the surface is now
  // "your plan"; the old path keeps working for anyone holding a link to it.
  async redirects() {
    return [
      { source: "/dossier", destination: "/plan", permanent: false },
      // Company reports moved inside Studio's Research section on 2026-09-10.
      // Old links, including bookmarked reports, land on the same page there.
      { source: "/filings", destination: "/studio/filings", permanent: true },
      { source: "/filings/:cik/:accession", destination: "/studio/filings/:cik/:accession", permanent: true },
    ];
  },
};

module.exports = nextConfig;
