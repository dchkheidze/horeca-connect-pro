// Mock data for suppliers and jobs

export interface Supplier {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  location: string;
  logo: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  services: string[];
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Seasonal";
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedAt: string;
  category: string;
}

export const suppliers: Supplier[] = [
  {
    id: "1",
    slug: "premium-foods-co",
    name: "Premium Foods Co.",
    category: "Food & Beverages",
    description: "Premium Foods Co. is a leading wholesale supplier of high-quality ingredients for restaurants and hotels. We specialize in fresh produce, artisanal dairy, and premium meats sourced from trusted farms across the region. Our commitment to quality and reliability has made us a preferred partner for over 500 establishments.",
    shortDescription: "Premium wholesale food supplier for restaurants and hotels",
    location: "New York, NY",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&h=400&fit=crop",
    rating: 4.8,
    reviewCount: 124,
    tags: ["Organic", "Local Sourcing", "Next-Day Delivery"],
    contact: {
      email: "contact@premiumfoods.com",
      phone: "+1 (555) 123-4567",
      website: "www.premiumfoods.com",
    },
    services: ["Bulk ordering", "Custom cuts", "Weekly delivery", "Menu consultation"],
  },
  {
    id: "2",
    slug: "kitchen-pro-equipment",
    name: "Kitchen Pro Equipment",
    category: "Equipment & Supplies",
    description: "Kitchen Pro Equipment provides commercial kitchen equipment and supplies to the hospitality industry. From industrial ovens to smallwares, we offer a comprehensive range of products backed by expert installation and maintenance services.",
    shortDescription: "Commercial kitchen equipment and maintenance",
    location: "Chicago, IL",
    logo: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
    rating: 4.6,
    reviewCount: 89,
    tags: ["Installation", "Maintenance", "Leasing"],
    contact: {
      email: "sales@kitchenpro.com",
      phone: "+1 (555) 234-5678",
      website: "www.kitchenpro.com",
    },
    services: ["Equipment sales", "Installation", "Maintenance", "24/7 Support"],
  },
  {
    id: "3",
    slug: "clean-service-solutions",
    name: "CleanService Solutions",
    category: "Cleaning & Sanitation",
    description: "CleanService Solutions specializes in commercial cleaning and sanitation services for restaurants, hotels, and food service establishments. Our trained professionals ensure your venue meets the highest hygiene standards.",
    shortDescription: "Professional cleaning and sanitation services",
    location: "Los Angeles, CA",
    logo: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop",
    rating: 4.9,
    reviewCount: 156,
    tags: ["Certified", "Eco-Friendly", "24/7 Service"],
    contact: {
      email: "info@cleanservice.com",
      phone: "+1 (555) 345-6789",
      website: "www.cleanservice.com",
    },
    services: ["Deep cleaning", "Daily maintenance", "Sanitization", "Pest control"],
  },
  {
    id: "4",
    slug: "beverage-masters",
    name: "Beverage Masters",
    category: "Food & Beverages",
    description: "Beverage Masters is your one-stop shop for premium beverages. We supply wines, craft beers, spirits, and non-alcoholic beverages to restaurants and bars. Our sommeliers can help curate the perfect beverage program for your establishment.",
    shortDescription: "Premium beverage supplier with sommelier services",
    location: "San Francisco, CA",
    logo: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=400&fit=crop",
    rating: 4.7,
    reviewCount: 98,
    tags: ["Wine Selection", "Craft Beers", "Consultation"],
    contact: {
      email: "orders@beveragemasters.com",
      phone: "+1 (555) 456-7890",
      website: "www.beveragemasters.com",
    },
    services: ["Beverage supply", "Menu pairing", "Staff training", "Event catering"],
  },
  {
    id: "5",
    slug: "tech-table-pos",
    name: "TechTable POS",
    category: "Technology",
    description: "TechTable POS offers modern point-of-sale and restaurant management solutions. Our cloud-based platform streamlines operations, from tableside ordering to inventory management and analytics.",
    shortDescription: "Modern POS and restaurant management software",
    location: "Austin, TX",
    logo: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
    rating: 4.5,
    reviewCount: 203,
    tags: ["Cloud-based", "Integrations", "24/7 Support"],
    contact: {
      email: "hello@techtable.com",
      phone: "+1 (555) 567-8901",
      website: "www.techtable.com",
    },
    services: ["POS systems", "Inventory management", "Analytics", "Online ordering"],
  },
  {
    id: "6",
    slug: "fresh-linens-plus",
    name: "Fresh Linens Plus",
    category: "Linens & Uniforms",
    description: "Fresh Linens Plus provides premium linen rental and laundry services for the hospitality industry. From tablecloths to chef uniforms, we ensure your establishment always looks its best.",
    shortDescription: "Linen rental and laundry services",
    location: "Miami, FL",
    logo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
    rating: 4.4,
    reviewCount: 67,
    tags: ["Eco-Friendly", "Same-Day Service", "Custom Embroidery"],
    contact: {
      email: "service@freshlinens.com",
      phone: "+1 (555) 678-9012",
      website: "www.freshlinens.com",
    },
    services: ["Linen rental", "Uniform supply", "Laundry service", "Custom design"],
  },
];

export const jobs: Job[] = [
  {
    id: "1",
    slug: "executive-chef-fine-dining",
    title: "Executive Chef",
    company: "The Grand Restaurant",
    companyLogo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop",
    location: "New York, NY",
    type: "Full-time",
    salary: "$85,000 - $120,000",
    description: "We are seeking an experienced Executive Chef to lead our kitchen team at our award-winning fine dining establishment. The ideal candidate will bring creativity, leadership, and a passion for culinary excellence.",
    requirements: [
      "10+ years of culinary experience",
      "5+ years in a leadership role",
      "Culinary degree preferred",
      "Experience with fine dining cuisine",
      "Strong team management skills",
    ],
    benefits: [
      "Competitive salary",
      "Health insurance",
      "Paid time off",
      "Professional development",
      "Meal allowance",
    ],
    postedAt: "2024-01-15",
    category: "Kitchen",
  },
  {
    id: "2",
    slug: "restaurant-general-manager",
    title: "General Manager",
    company: "Urban Bistro Group",
    companyLogo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop",
    location: "Chicago, IL",
    type: "Full-time",
    salary: "$70,000 - $90,000",
    description: "Urban Bistro Group is looking for a dynamic General Manager to oversee daily operations of our flagship location. You'll be responsible for staff management, customer satisfaction, and achieving financial targets.",
    requirements: [
      "5+ years restaurant management experience",
      "Strong financial acumen",
      "Excellent communication skills",
      "Experience with POS systems",
      "Food safety certification",
    ],
    benefits: [
      "Performance bonuses",
      "Health and dental insurance",
      "401(k) matching",
      "Flexible schedule",
      "Career advancement opportunities",
    ],
    postedAt: "2024-01-18",
    category: "Management",
  },
  {
    id: "3",
    slug: "line-cook-italian-kitchen",
    title: "Line Cook",
    company: "Bella Cucina",
    companyLogo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$45,000 - $55,000",
    description: "Join our passionate kitchen team at Bella Cucina, an authentic Italian restaurant. We're looking for skilled line cooks who share our love for traditional Italian cuisine.",
    requirements: [
      "2+ years cooking experience",
      "Knowledge of Italian cuisine",
      "Ability to work in fast-paced environment",
      "Food handler certification",
      "Team player attitude",
    ],
    benefits: [
      "Competitive hourly rate",
      "Tips pool",
      "Staff meals",
      "Flexible scheduling",
      "Growth opportunities",
    ],
    postedAt: "2024-01-20",
    category: "Kitchen",
  },
  {
    id: "4",
    slug: "head-bartender-cocktail-bar",
    title: "Head Bartender",
    company: "The Copper Room",
    companyLogo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100&h=100&fit=crop",
    location: "Los Angeles, CA",
    type: "Full-time",
    salary: "$50,000 - $65,000 + tips",
    description: "The Copper Room, a speakeasy-style cocktail bar, is seeking a creative Head Bartender to lead our bar program. If you're passionate about craft cocktails and guest experiences, we want to meet you.",
    requirements: [
      "3+ years bartending experience",
      "Craft cocktail expertise",
      "Wine and spirits knowledge",
      "Leadership experience",
      "Excellent customer service",
    ],
    benefits: [
      "Competitive base + tips",
      "Creative freedom",
      "Health benefits",
      "Industry event access",
      "Continuing education",
    ],
    postedAt: "2024-01-22",
    category: "Bar",
  },
  {
    id: "5",
    slug: "hotel-front-desk-manager",
    title: "Front Desk Manager",
    company: "Seaside Resort & Spa",
    companyLogo: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&h=100&fit=crop",
    location: "Miami, FL",
    type: "Full-time",
    salary: "$55,000 - $70,000",
    description: "Seaside Resort & Spa is looking for an experienced Front Desk Manager to lead our guest services team. You'll ensure exceptional guest experiences and smooth front office operations.",
    requirements: [
      "3+ years hotel front desk experience",
      "Management experience preferred",
      "Excellent communication skills",
      "PMS system proficiency",
      "Bilingual Spanish a plus",
    ],
    benefits: [
      "Hotel discounts worldwide",
      "Health and wellness benefits",
      "Paid vacation",
      "Professional development",
      "Employee recognition program",
    ],
    postedAt: "2024-01-25",
    category: "Hospitality",
  },
  {
    id: "6",
    slug: "sous-chef-seasonal",
    title: "Sous Chef (Seasonal)",
    company: "Mountain Peak Lodge",
    companyLogo: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=100&h=100&fit=crop",
    location: "Aspen, CO",
    type: "Seasonal",
    salary: "$60,000 - $75,000 (seasonal)",
    description: "Join our culinary team for the winter season at Mountain Peak Lodge. As Sous Chef, you'll support the Executive Chef in delivering memorable dining experiences to our resort guests.",
    requirements: [
      "5+ years culinary experience",
      "Previous sous chef experience",
      "High-volume experience",
      "Leadership skills",
      "Flexibility with hours",
    ],
    benefits: [
      "Staff housing available",
      "Ski pass included",
      "Meals provided",
      "End of season bonus",
      "Networking opportunities",
    ],
    postedAt: "2024-01-28",
    category: "Kitchen",
  },
];

export const supplierCategories = [
  "All Categories",
  "Food & Beverages",
  "Equipment & Supplies",
  "Cleaning & Sanitation",
  "Technology",
  "Linens & Uniforms",
  "Furniture & Decor",
];

export const jobCategories = [
  "All Categories",
  "Kitchen",
  "Management",
  "Bar",
  "Hospitality",
  "Service",
];

export const jobTypes = ["All Types", "Full-time", "Part-time", "Contract", "Seasonal"];
