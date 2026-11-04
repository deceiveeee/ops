/**
 * The reviewed choices for each published puzzle, in the order they run.
 *
 * Reviewed by reading each company's draft (tmp/daily-puzzle-build/) and the
 * Business section it came from. What a review decides, and nothing else:
 *
 * - `industry`: the SEC's industry description, in sentence case. The SEC's
 *   wording is kept, however dated ("Video tape rental"), and spelled out where
 *   EDGAR abbreviates it.
 * - `mix`: which split of revenue the report gives that says most without
 *   naming the company. Labels stay the company's own terms; a review only
 *   lowers shouting capitals, spells out an abbreviation or drops a repeated
 *   "revenue". Shares are never edited; they come from the report.
 * - `quote`: the exact words to show from the Business section, which must
 *   appear there once. `cutBefore`/`cutAfter` mark an excerpt that starts or
 *   ends inside a sentence, so the page shows "…" there.
 *
 * Numbers are not reviewed here because they are not chosen here: finalize
 * reads them from the report and checks each against the report's data file.
 */
export type Review = {
  ticker: string;
  industry: string;
  mix: {
    kind: "products" | "regions" | "segments";
    labels?: Record<string, string>;
    /** Rows kept before the rest are added up as "Everything else". Default 6. */
    keep?: number;
  };
  quote: string;
  cutBefore?: boolean;
  cutAfter?: boolean;
};

export const REVIEWED: Review[] = [
  {
    ticker: "CMG",
    industry: "Eating places",
    mix: { kind: "products", labels: { "Food and beverage revenue": "Food and beverage", "Delivery service revenue": "Delivery service" } },
    quote: "owns and operates Chipotle Mexican Grill restaurants, which feature a relevant menu of burritos, burrito bowls (a burrito without the tortilla), quesadillas, tacos, and salads.",
    cutBefore: true,
  },
  {
    ticker: "AAPL",
    industry: "Electronic computers",
    mix: { kind: "products", labels: { "Wearables, Home and Accessories": "Wearables, home and accessories" } },
    quote: "The Company designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services.",
  },
  {
    ticker: "NFLX",
    industry: "Video tape rental",
    mix: {
      kind: "regions",
      labels: {
        "United States and Canada (UCAN)": "United States and Canada",
        "Europe, Middle East, and Africa (EMEA)": "Europe, Middle East and Africa",
        "Latin America (LATAM)": "Latin America",
        "Asia-Pacific (APAC)": "Asia-Pacific",
      },
    },
    quote: "is one of the world's leading entertainment services offering TV series, films, games and live programming across a wide variety of genres and languages.",
    cutBefore: true,
  },
  {
    ticker: "COST",
    industry: "Variety stores",
    mix: {
      kind: "products",
      labels: {
        "Food and Sundries": "Food and sundries",
        "Non-Foods": "Non-foods",
        "Fresh Foods": "Fresh foods",
      },
    },
    quote: "We are principally engaged in the operation of membership warehouses in the United States (U.S.) and Puerto Rico, Canada, Mexico, Japan, the United Kingdom (U.K.), Korea, Australia, Taiwan, China, Spain, France, Sweden, Iceland, and New Zealand.",
  },
  {
    ticker: "NVDA",
    industry: "Semiconductors and related devices",
    mix: { kind: "products", labels: { "Professional Visualization": "Professional visualization", "OEM and Other": "Other" } },
    quote: "NVIDIA pioneered accelerated computing to help solve the most challenging computational problems.",
  },
  {
    ticker: "HSY",
    industry: "Sugar and confectionery products",
    mix: {
      kind: "segments",
      labels: {
        "North America Confectionery": "North America confectionery",
        "North America Salty Snacks": "North America salty snacks",
      },
    },
    quote: "We are the largest producer of quality chocolate in North America, a leading snack maker in the United States and a global leader in chocolate and non-chocolate confectionery.",
  },
  {
    ticker: "TSLA",
    industry: "Motor vehicles and passenger car bodies",
    mix: { kind: "products" },
    quote: "we design, develop, manufacture, sell and lease high-performance fully electric vehicles and energy generation and storage systems",
    cutBefore: true,
    cutAfter: true,
  },
  {
    ticker: "SBUX",
    industry: "Eating and drinking places",
    mix: { kind: "regions", labels: { CHINA: "China", "Other Countries": "Other countries" } },
    quote: "Starbucks is the premier roaster, marketer, and retailer of specialty coffee in the world, operating in 89 markets.",
  },
  {
    ticker: "MSFT",
    industry: "Prepackaged software",
    mix: {
      kind: "segments",
      labels: {
        "Productivity and Business Processes": "Productivity and business processes",
        "Intelligent Cloud": "Intelligent cloud",
        "More Personal Computing": "More personal computing",
      },
    },
    quote: "Founded in 1975, we develop and support software, services, devices, and solutions that deliver new value for customers and help people and businesses realize their full potential.",
  },
  {
    ticker: "MAT",
    industry: "Dolls and stuffed toys",
    mix: { kind: "segments" },
    quote: "Mattel is a leading global play and family entertainment company and owner of one of the most iconic brand portfolios in the world.",
  },
  {
    ticker: "KO",
    industry: "Beverages",
    mix: { kind: "products" },
    quote: "We make our branded beverage products available to consumers throughout the world through our network of independent bottling partners, distributors, wholesalers and retailers as well as our consolidated bottling and distribution operations.",
  },
  {
    ticker: "AMZN",
    industry: "Catalog and mail-order houses",
    mix: { kind: "segments" },
    quote: "We are guided by four principles: customer obsession rather than competitor focus, passion for invention, commitment to operational excellence, and long-term thinking.",
  },
  {
    ticker: "YETI",
    industry: "Sporting and athletic goods",
    mix: { kind: "products", labels: { "Coolers & Equipment": "Coolers and equipment" } },
    quote: "By utilizing forward-thinking designs and advanced manufacturing techniques, they developed a nearly indestructible hard cooler with superior ice retention.",
  },
  {
    ticker: "DUOL",
    industry: "Prepackaged software",
    mix: { kind: "products", labels: { IAPs: "In-app purchases" } },
    quote: "Our mission is to develop the best education in the world and make it universally available.",
  },
  {
    ticker: "MCD",
    industry: "Eating places",
    mix: {
      kind: "segments",
      labels: {
        "International Operated Markets": "International operated markets",
        "International Developmental Licensed Markets & Corporate": "International developmental licensed markets and corporate",
      },
    },
    quote: "The Company franchises and owns and operates McDonald's restaurants, which serve a locally relevant menu of quality food and beverages in communities across more than 100 countries.",
  },
  {
    ticker: "META",
    industry: "Computer programming and data processing",
    mix: { kind: "segments" },
    quote: "We build technology that helps people connect and share, find and build communities, and grow businesses.",
  },
  {
    ticker: "TGT",
    industry: "Variety stores",
    mix: {
      kind: "products",
      keep: 7,
      labels: {
        "Apparel And Accessories": "Apparel and accessories",
        "Food & beverage": "Food and beverage",
        "Home Furnishings and Decor": "Home furnishings and decor",
      },
    },
    quote: "We offer our customers, referred to as \"guests,\" fashionable, differentiated merchandise and everyday essentials at discounted prices.",
  },
  {
    ticker: "SNAP",
    industry: "Computer programming and data processing",
    mix: { kind: "products", labels: { "Advertising Revenue": "Advertising", "Other Revenue": "Other" } },
    quote: "Visual messaging is a fast, fun way to communicate with friends and family using augmented reality, video, voice, messaging, and creative tools.",
  },
  {
    ticker: "DIS",
    industry: "Amusement and recreation services",
    mix: { kind: "regions" },
    quote: "The Walt Disney Company, together with the subsidiaries through which businesses are conducted (the Company), is a diversified worldwide entertainment company with operations in three segments: Entertainment, Sports and Experiences.",
  },
  {
    ticker: "LULU",
    industry: "Apparel and other finished fabric products",
    mix: { kind: "products", labels: { "Accessories and other categories": "Accessories and other" } },
    quote: "is principally a designer, distributor, and retailer of technical athletic apparel, footwear, and accessories.",
    cutBefore: true,
  },
  {
    ticker: "UBER",
    industry: "Business services not classified elsewhere",
    mix: { kind: "segments" },
    quote: "is a technology platform that uses a massive network, leading technology, operational excellence and product expertise to power movement from point A to point B.",
    cutBefore: true,
  },
  {
    ticker: "HAS",
    industry: "Games, toys and children's vehicles (except dolls and bicycles)",
    mix: {
      kind: "segments",
      labels: { "Consumer Products": "Consumer products", "[[name]] and Digital Gaming": "[[name]] and digital gaming" },
    },
    quote: "With over 100 years of expertise, we deliver play experiences to kids, families, and fans around the world, through physical and digital games, video games, toys, licensed consumer products, location-based entertainment, film, TV and more.",
  },
  {
    ticker: "DPZ",
    industry: "Groceries and related products (wholesale)",
    mix: { kind: "segments", labels: { "U S Stores": "U.S. stores", "Supply Chain": "Supply chain", "International Franchise": "International franchise" } },
    quote: "Domino's is the largest pizza company in the world with more than 22,100 locations in over 90 markets around the world as of December 28, 2025, and operates two distinct service models within its stores, with a significant business in both delivery and carryout.",
  },
  {
    ticker: "BBY",
    industry: "Radio, TV and consumer electronics stores",
    mix: { kind: "products", labels: { "Computing and Mobile Phones": "Computing and mobile phones", "Consumer Electronics": "Consumer electronics" } },
    quote: "We are driven by our purpose to enrich lives through technology and our vision to personalize and humanize technology solutions for every stage of life.",
  },
  {
    ticker: "F",
    industry: "Motor vehicles and passenger car bodies",
    mix: {
      kind: "products",
      labels: { "Services and other revenue": "Services and other" },
    },
    quote: "Ford develops and delivers innovative, must-have Ford trucks, sport utility vehicles, commercial vans and cars, and Lincoln luxury vehicles",
    cutAfter: true,
  },
  {
    ticker: "ETSY",
    industry: "Business services not classified elsewhere",
    mix: { kind: "regions", labels: { "All Other": "All other" } },
    quote: "Etsy operates two-sided online marketplaces that connect millions of creative entrepreneurs with buyers around the world.",
  },
  {
    ticker: "GME",
    industry: "Computer and computer software stores",
    mix: { kind: "products" },
    quote: "offers games, collectibles, and entertainment products through its stores and ecommerce platforms.",
    cutBefore: true,
  },
  {
    ticker: "CROX",
    industry: "Rubber and plastics footwear",
    mix: { kind: "segments", labels: { "[[name]] Brand": "[[name]] brand" } },
    quote: "Our Classic Clog is our icon, and we continue to grow our broader clog silhouette with new designs, colors, graphics, licensed properties, and collaborations.",
  },
  {
    ticker: "PEP",
    industry: "Beverages",
    mix: {
      kind: "regions",
      keep: 6,
      labels: {
        "UNITED STATES": "United States",
        MEXICO: "Mexico",
        "RUSSIAN FEDERATION": "Russia",
        CANADA: "Canada",
        CHINA: "China",
      },
    },
    quote: "we make, market, distribute and sell a wide variety of beverages and convenient foods, serving customers and consumers in more than 200 countries and territories.",
    cutBefore: true,
  },
  {
    ticker: "TTWO",
    industry: "Prepackaged software",
    mix: { kind: "regions" },
    quote: "We are a leading developer, publisher, and marketer of interactive entertainment for consumers around the globe.",
  },
  {
    ticker: "HD",
    industry: "Lumber and other building materials dealers",
    mix: { kind: "regions" },
    quote: "We offer our customers a wide assortment of home improvement products, building materials, lawn and garden products, décor products",
    cutAfter: true,
  },
  {
    ticker: "ELF",
    industry: "Perfumes, cosmetics and other toilet preparations",
    mix: { kind: "regions" },
    quote: "is a multi-brand beauty company that offers inclusive, accessible, clean, vegan and cruelty free cosmetics and skin care products.",
    cutBefore: true,
  },
  {
    ticker: "DECK",
    industry: "Rubber and plastics footwear",
    mix: { kind: "segments", labels: { "Other Brands Segment": "Other brands" } },
    quote: "We are a global leader in designing, marketing, and distributing innovative footwear, apparel, and accessories developed for both everyday casual lifestyle use and high-performance activities.",
  },
  {
    ticker: "MNST",
    industry: "Bottled and canned soft drinks",
    mix: {
      kind: "regions",
      labels: {
        "U.S. and Canada": "United States and Canada",
        EMEA: "Europe, Middle East and Africa",
        "Asia Pacific (including Oceania)": "Asia-Pacific",
        "Latin America and Caribbean": "Latin America and the Caribbean",
      },
    },
    quote: "In some cases, we sell ready-to-drink packaged drinks directly to retail grocery and specialty chains, wholesalers, club stores, mass merchandisers, convenience and gas chains, drug stores, foodservice customers, value stores, e-commerce retailers and the military.",
  },
  {
    ticker: "ANF",
    industry: "Family clothing stores",
    mix: { kind: "regions", labels: { EMEA: "Europe, Middle East and Africa", "Asia Pacific": "Asia-Pacific" } },
    quote: "The Company offers a broad assortment of apparel, personal care products and accessories for men, women and kids, which are sold primarily through its Company-owned stores and digital channels, as well as through various third-party arrangements.",
  },
];
