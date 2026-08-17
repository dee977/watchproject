import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AURELIA Luxury Horlogerie database...');

  // 1. Clean existing records in reverse dependency order
  await prisma.adminActivityLog.deleteMany();
  await prisma.stockNotification.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.address.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  // 2. Site Settings
  const siteSettings = [
    { key: 'STORE_NAME', value: 'AURELIA Haute Horlogerie', description: 'Store brand name' },
    { key: 'STORE_CURRENCY', value: 'INR', description: 'Base store currency' },
    { key: 'STORE_CURRENCY_SYMBOL', value: '₹', description: 'Base store currency symbol' },
    { key: 'TAX_RATE_PERCENT', value: '18', description: 'Goods & Services Tax (GST) rate in percent' },
    { key: 'FREE_SHIPPING_THRESHOLD', value: '50000', description: 'Order subtotal threshold in INR for complimentary insured delivery' },
    { key: 'STANDARD_SHIPPING_FEE', value: '750', description: 'Standard insured delivery fee in INR' },
    { key: 'EXPRESS_SHIPPING_FEE', value: '1850', description: 'Priority armored express delivery fee in INR' },
    { key: 'COD_FEE', value: '250', description: 'Cash on delivery handling fee in INR' },
    { key: 'RETURN_WINDOW_DAYS', value: '14', description: 'Eligible return window in days' },
    { key: 'CONCIERGE_EMAIL', value: 'concierge@aureliawatches.com', description: 'Customer concierge support email' },
    { key: 'CONCIERGE_PHONE', value: '+91 (0) 22 8900 4400', description: 'VIP support hotline' },
    { key: 'STORE_ADDRESS', value: 'The Horizon Tower, Suite 44B, Bandra Kurla Complex, Mumbai, MH 400051, India', description: 'Flagship boutique address' },
    { key: 'HERO_TITLE', value: 'TIME, REDEFINED.', description: 'Homepage hero headline' },
    { key: 'HERO_SUBTITLE', value: 'Discover exceptional handcrafted horological masterpieces engineered for eternity.', description: 'Homepage hero subheading' },
  ];

  for (const s of siteSettings) {
    await prisma.siteSetting.create({ data: s });
  }

  // 3. User Roles & Accounts (Configurable via Environment Variables)
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@aurelia.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'Alexander Vance';

  const customerEmail = (process.env.DEMO_CUSTOMER_EMAIL || 'vikram@royalhorology.com').toLowerCase().trim();
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || 'Collector@123';
  const customerName = process.env.DEMO_CUSTOMER_NAME || 'Vikramaditya Roy';

  const hashedPasswordAdmin = await bcrypt.hash(adminPassword, 10);
  const hashedPasswordManager = await bcrypt.hash('Manager@12345', 10);
  const hashedPasswordSupport = await bcrypt.hash('Support@12345', 10);
  const hashedPasswordCustomer = await bcrypt.hash(customerPassword, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash: hashedPasswordAdmin,
      role: 'SUPER_ADMIN',
      name: adminName,
      phone: '+91 98201 12345',
      emailVerified: true,
      profile: {
        create: {
          bio: 'Managing Director & Master Horologist at AURELIA.',
          preferredCurrency: 'INR',
        },
      },
      addresses: {
        create: {
          fullName: adminName,
          phone: '+91 98201 12345',
          addressLine1: 'Penthouse 14, Imperial Towers',
          addressLine2: 'Altamount Road, Cumballa Hill',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400026',
          country: 'India',
          isDefaultShipping: true,
          isDefaultBilling: true,
        },
      },
    },
  });

  const storeManager = await prisma.user.create({
    data: {
      email: 'manager@aurelia.com',
      passwordHash: hashedPasswordManager,
      role: 'MANAGER',
      name: 'Elena Rostova',
      phone: '+91 98202 23456',
      emailVerified: true,
      profile: {
        create: {
          bio: 'Head of Boutique Operations & Catalog Curation.',
        },
      },
    },
  });

  const supportAgent = await prisma.user.create({
    data: {
      email: 'support@aurelia.com',
      passwordHash: hashedPasswordSupport,
      role: 'CUSTOMER_SUPPORT',
      name: 'Julian Thorne',
      phone: '+91 98203 34567',
      emailVerified: true,
      profile: {
        create: {
          bio: 'Senior Client Concierge Specialist.',
        },
      },
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      email: customerEmail,
      passwordHash: hashedPasswordCustomer,
      role: 'CUSTOMER',
      name: customerName,
      phone: '+91 98765 43210',
      emailVerified: true,
      profile: {
        create: {
          bio: 'Horology collector and enthusiast.',
        },
      },
      addresses: {
        create: [
          {
            fullName: 'Vikramaditya Roy',
            phone: '+91 98765 43210',
            addressLine1: 'Villa 22, Whispering Palms Estate',
            addressLine2: 'Road No. 36, Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500033',
            country: 'India',
            isDefaultShipping: true,
            isDefaultBilling: true,
          },
          {
            fullName: 'Vikramaditya Roy (Office)',
            phone: '+91 98765 43210',
            addressLine1: 'Level 18, Cyber Gateway Building',
            addressLine2: 'HITEC City, Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            postalCode: '500081',
            country: 'India',
            isDefaultShipping: false,
            isDefaultBilling: false,
          },
        ],
      },
    },
  });

  // 4. Brands
  const brandsData = [
    {
      name: 'Seiko',
      slug: 'seiko',
      originCountry: 'Japan',
      foundedYear: 1881,
      isFeatured: true,
      description: 'Pioneers of Japanese mechanical precision and world-renowned horological artistry since 1881.',
      logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1600&q=80',
    },
    {
      name: 'Tissot',
      slug: 'tissot',
      originCountry: 'Switzerland',
      foundedYear: 1853,
      isFeatured: true,
      description: 'Swiss watchmakers in Le Locle offering avant-garde designs and state-of-the-art Powermatic calibers.',
      logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1600&q=80',
    },
    {
      name: 'Omega',
      slug: 'omega',
      originCountry: 'Switzerland',
      foundedYear: 1848,
      isFeatured: true,
      description: 'Master Chronometer precision, deep ocean mastery, and the legendary official Moonwatch lineage.',
      logo: 'https://images.unsplash.com/photo-1547996160-71dfa635826f?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1600&q=80',
    },
    {
      name: 'Longines',
      slug: 'longines',
      originCountry: 'Switzerland',
      foundedYear: 1832,
      isFeatured: true,
      description: 'Elegance is an attitude. Heritage aviation chronographs and timeless dress aesthetics from Saint-Imier.',
      logo: 'https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1517467139951-f5a925c9f9de?auto=format&fit=crop&w=1600&q=80',
    },
    {
      name: 'Cartier',
      slug: 'cartier',
      originCountry: 'France / Switzerland',
      foundedYear: 1847,
      isFeatured: true,
      description: 'The iconic jeweler of kings and king of jewelers, creator of the legendary Santos and Tank timepieces.',
      logo: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1600&q=80',
    },
    {
      name: 'Casio G-Shock',
      slug: 'casio',
      originCountry: 'Japan',
      foundedYear: 1946,
      isFeatured: true,
      description: 'Indestructible toughness combined with premium metal architectures, solar atomic timekeeping, and Bluetooth.',
      logo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80',
    },
    {
      name: 'Citizen',
      slug: 'citizen',
      originCountry: 'Japan',
      foundedYear: 1918,
      isFeatured: false,
      description: 'Eco-Drive light-powered technology, Super Titanium craftsmanship, and relentless horological innovation.',
      logo: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1495856458515-0637185db551?auto=format&fit=crop&w=1600&q=80',
    },
    {
      name: 'Orient Star',
      slug: 'orient',
      originCountry: 'Japan',
      foundedYear: 1950,
      isFeatured: false,
      description: 'Exquisite in-house mechanical movements, skeleton dials, and exceptional finishing value.',
      logo: 'https://images.unsplash.com/photo-1518131672697-613becd4fab5?auto=format&fit=crop&w=300&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  const createdBrands: Record<string, any> = {};
  for (const b of brandsData) {
    createdBrands[b.slug] = await prisma.brand.create({ data: b });
  }

  // 5. Categories
  const categoriesData = [
    {
      name: 'Automatic Watches',
      slug: 'automatic',
      description: 'Self-winding mechanical masterpieces powered by the kinetic motion of the wearer.',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Chronograph Watches',
      slug: 'chronograph',
      description: 'Multi-register stopwatches engineered for precision timing on race tracks and cockpits.',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1547996160-71dfa635826f?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Dress Watches',
      slug: 'dress',
      description: 'Slim, understated, and impeccably refined silhouettes crafted for formal attire.',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Dive Watches',
      slug: 'dive',
      description: 'High-pressure ISO 6425 certified underwater timepieces with unidirectional rotating bezels.',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Luxury Watches',
      slug: 'luxury',
      description: 'Haute Horlogerie icons featuring gold, titanium, sapphire casebacks, and in-house calibers.',
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Sport Watches',
      slug: 'sport',
      description: 'Rugged, high-durability timepieces built to endure extreme sports and outdoor expeditions.',
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Quartz Precision',
      slug: 'quartz',
      description: 'High-frequency quartz and solar oscillators delivering unparalleled second-by-second accuracy.',
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const c of categoriesData) {
    createdCategories[c.slug] = await prisma.category.create({ data: c });
  }

  // 6. Collections
  const collectionsData = [
    {
      name: 'Heritage Grand Prix',
      slug: 'heritage-grand-prix',
      description: 'Iconic vintage-inspired chronographs celebrating the golden era of motorsport.',
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1547996160-71dfa635826f?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Abyssal Marine Pro',
      slug: 'abyssal-marine-pro',
      description: 'Professional grade dive instruments engineered for 300m to 600m saturation depths.',
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Royal Sunburst & Guilloché',
      slug: 'royal-sunburst',
      description: 'Artisanal dials featuring hand-crafted guilloché and enamel sunburst textures.',
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Titanium Avant-Garde',
      slug: 'titanium-avant-garde',
      description: 'Ultralight grade 5 titanium cases combined with openworked skeleton movements.',
      isFeatured: true,
      coverImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const createdCollections: Record<string, any> = {};
  for (const col of collectionsData) {
    createdCollections[col.slug] = await prisma.collection.create({ data: col });
  }

  // 7. Products (25 Realistic Luxury Watches)
  const products = [
    {
      name: 'Seiko Presage Cocktail Time "Skydiving"',
      slug: 'seiko-presage-cocktail-time-skydiving',
      sku: 'SEI-SRPB43J1',
      brandSlug: 'seiko',
      categorySlug: 'dress',
      collectionSlug: 'royal-sunburst',
      price: 39500,
      mrp: 46000,
      discountPercent: 14,
      movement: 'Automatic',
      gender: 'Men',
      caseMaterial: '316L Stainless Steel',
      caseDiameter: '40.5 mm',
      caseThickness: '11.8 mm',
      dialColor: 'Icy Sunburst Blue',
      strapMaterial: 'Glossy Black Calfskin Leather',
      strapColor: 'Black with Blue Stitching',
      waterResistance: '50m (5 Bar)',
      powerReserve: '41 Hours',
      crystal: 'Box-shaped Hardlex',
      warranty: '3 Years International',
      condition: 'New / Unworn',
      description: 'Inspired by the intoxicating cocktail culture of Tokyo Ginza lounges, the Seiko Presage Cocktail Time features an intensely textured icy-blue sunburst dial that refracts ambient light with spellbinding depth. Driven by the venerable Caliber 4R35 automatic movement, it blends old-world sophistication with Japanese mechanical mastery.',
      shortDescription: 'Icy-blue textured guilloché dial with 4R35 automatic movement and deployant leather strap.',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      stockQuantity: 12,
      images: [
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Caliber', value: 'Seiko In-House 4R35' },
        { group: 'Movement', key: 'Jewels', value: '23 Jewels' },
        { group: 'Movement', key: 'Frequency', value: '21,600 vph (3 Hz)' },
        { group: 'Case', key: 'Lug to Lug', value: '47.5 mm' },
        { group: 'Case', key: 'Lug Width', value: '20 mm' },
        { group: 'Case', key: 'Caseback', value: 'Exhibition See-Through Caseback' },
        { group: 'Dial', key: 'Indices', value: 'Facet-cut Polished Steel Hour Markers' },
        { group: 'Strap', key: 'Clasp', value: 'Three-fold Clasp with Push Button Release' },
      ],
    },
    {
      name: 'Tissot PRX Powermatic 80 Steel & 18K Rose Gold',
      slug: 'tissot-prx-powermatic-80-gold',
      sku: 'TIS-T1374072103100',
      brandSlug: 'tissot',
      categorySlug: 'automatic',
      collectionSlug: 'royal-sunburst',
      price: 68500,
      mrp: 75000,
      discountPercent: 9,
      movement: 'Automatic',
      gender: 'Unisex',
      caseMaterial: '316L Steel & 18K Fluted Bezel',
      caseDiameter: '40.0 mm',
      caseThickness: '10.9 mm',
      dialColor: 'Silver Waffle Tapisserie',
      strapMaterial: 'Integrated Brushed Stainless Steel',
      strapColor: 'Silver',
      waterResistance: '100m (10 Bar)',
      powerReserve: '80 Hours',
      crystal: 'Scratch-resistant Sapphire with Anti-reflective coating',
      warranty: '2 Years International',
      condition: 'New / Unworn',
      description: 'The Tissot PRX Powermatic 80 revives the sleek, integrated 1978 design icon. Featuring an authentic Nivachron anti-magnetic balance spring, an astonishing 80-hour power reserve, and an opulent waffle embossed dial framed by an 18K rose gold fluted bezel, this piece commands attention in any boardroom or gala.',
      shortDescription: '1970s integrated bracelet icon with 80-hour power reserve and Nivachron anti-magnetic balance.',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      stockQuantity: 8,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Caliber', value: 'Powermatic 80.111' },
        { group: 'Movement', key: 'Balance Spring', value: 'Patented Nivachron' },
        { group: 'Case', key: 'Bezel', value: '18K Rose Gold Fluted' },
        { group: 'Case', key: 'Finish', value: 'Vertical Satin Brushed & Polished Chamfers' },
        { group: 'Strap', key: 'System', value: 'Quick-release interchangeable bracelet' },
      ],
    },
    {
      name: 'Omega Speedmaster Professional Moonwatch Co-Axial',
      slug: 'omega-speedmaster-professional-moonwatch',
      sku: 'OMG-31030425001002',
      brandSlug: 'omega',
      categorySlug: 'chronograph',
      collectionSlug: 'heritage-grand-prix',
      price: 445000,
      mrp: 475000,
      discountPercent: 6,
      movement: 'Manual Wind',
      gender: 'Men',
      caseMaterial: 'Stainless Steel',
      caseDiameter: '42.0 mm',
      caseThickness: '13.2 mm',
      dialColor: 'Matte Step Dial Black',
      strapMaterial: 'Five-arch Brushed Steel Bracelet',
      strapColor: 'Silver',
      waterResistance: '50m (5 Bar)',
      powerReserve: '50 Hours',
      crystal: 'Domed Sapphire Crystal with Interior AR',
      warranty: '5 Years Omega International',
      condition: 'New / Unworn',
      description: 'The legendary Moonwatch. Certified Master Chronometer by METAS, this iconic Speedmaster has been part of all six lunar landings. Powered by the Co-Axial Master Chronometer Calibre 3861 with free-sprung balance and silicon balance spring, resistant to magnetic fields reaching 15,000 gauss.',
      shortDescription: 'The legendary Master Chronometer Speedmaster with Calibre 3861 manual-wind Co-Axial movement.',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      stockQuantity: 4,
      images: [
        'https://images.unsplash.com/photo-1547996160-71dfa635826f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Calibre', value: 'Omega Co-Axial Master Chronometer 3861' },
        { group: 'Certification', key: 'METAS Master Chronometer', value: '0/+5 seconds per day' },
        { group: 'Magnetism', key: 'Resistance', value: 'Resistant to 15,000 Gauss' },
        { group: 'Bezel', key: 'Tachymeter', value: 'Anodised Aluminum with "Dot Over Ninety"' },
      ],
    },
    {
      name: 'Longines Spirit Zulu Time GMT 39mm',
      slug: 'longines-spirit-zulu-time-gmt-39mm',
      sku: 'LNG-L38024636',
      brandSlug: 'longines',
      categorySlug: 'automatic',
      collectionSlug: 'heritage-grand-prix',
      price: 245000,
      mrp: 265000,
      discountPercent: 8,
      movement: 'Automatic',
      gender: 'Men',
      caseMaterial: 'Stainless Steel & Ceramic Bezel',
      caseDiameter: '39.0 mm',
      caseThickness: '13.5 mm',
      dialColor: 'Anthracite Sunray with Gilt Hands',
      strapMaterial: 'Steel Bracelet with Micro-Adjustment',
      strapColor: 'Silver',
      waterResistance: '100m (10 Bar)',
      powerReserve: '72 Hours',
      crystal: 'Sapphire Crystal with Multi-layer AR on both sides',
      warranty: '5 Years Longines International',
      condition: 'New / Unworn',
      description: 'A true flyer GMT with independent jumping hour hand. Originating from the 1925 dual-timezone watch featuring the Zulu flag on its dial, this COSC-certified chronometer is equipped with an in-house L844.4 caliber and silicon balance spring.',
      shortDescription: 'COSC-certified true flyer GMT with ceramic 24h bezel and 72-hour power reserve.',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      stockQuantity: 6,
      images: [
        'https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1517467139951-f5a925c9f9de?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Calibre', value: 'Longines Exclusive L844.4 (COSC)' },
        { group: 'Functions', key: 'GMT', value: 'Independent Jumping Local Hour Hand' },
        { group: 'Bezel', key: 'Insert', value: 'Bidirectional Green Ceramic 24H' },
      ],
    },
    {
      name: 'Cartier Tank Must Large De Cartier',
      slug: 'cartier-tank-must-large-steel',
      sku: 'CRT-WSTA0041',
      brandSlug: 'cartier',
      categorySlug: 'dress',
      collectionSlug: 'royal-sunburst',
      price: 285000,
      mrp: 310000,
      discountPercent: 8,
      movement: 'Quartz',
      gender: 'Unisex',
      caseMaterial: 'High-Polished Stainless Steel',
      caseDiameter: '33.7 mm x 25.5 mm',
      caseThickness: '6.6 mm',
      dialColor: 'Silvered Opaline Dial with Roman Numerals',
      strapMaterial: 'Grained Black Calfskin Leather',
      strapColor: 'Black',
      waterResistance: '30m (3 Bar)',
      powerReserve: 'High Autonomy Quartz (8 Years)',
      crystal: 'Mineral Crystal with Beveled Edge',
      warranty: '8 Years Cartier Care Registered',
      condition: 'New / Unworn',
      description: 'First imagined by Louis Cartier in 1917, the Tank watch is the ultimate paragon of understated Parisian elegance. Featuring classic blued-steel sword hands, a beaded crown set with a synthetic cabochon spinel, and crisp Roman numerals.',
      shortDescription: 'The timeless Art Deco rectangle icon with blued sword hands and sapphire cabochon crown.',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      stockQuantity: 5,
      images: [
        'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Technology', value: 'High Autonomy Quartz Module' },
        { group: 'Crown', key: 'Stone', value: 'Beaded Crown with Blue Cabochon Spinel' },
        { group: 'Hands', key: 'Style', value: 'Blued-steel Sword Hands' },
      ],
    },
    {
      name: 'Seiko Prospex "Captain Willard" 200M Diver',
      slug: 'seiko-prospex-captain-willard-spb151',
      sku: 'SEI-SPB151J1',
      brandSlug: 'seiko',
      categorySlug: 'dive',
      collectionSlug: 'abyssal-marine-pro',
      price: 92000,
      mrp: 105000,
      discountPercent: 12,
      movement: 'Automatic',
      gender: 'Men',
      caseMaterial: 'Stainless Steel with Super-Hard Coating',
      caseDiameter: '42.7 mm',
      caseThickness: '13.2 mm',
      dialColor: 'Matte Military Black',
      strapMaterial: 'Solid Link Steel with Diver Extension',
      strapColor: 'Silver',
      waterResistance: '200m Diver ISO 6425',
      powerReserve: '70 Hours',
      crystal: 'Curved Sapphire with Inner Anti-Reflective',
      warranty: '3 Years International',
      condition: 'New / Unworn',
      description: 'The modern reinterpretation of the legendary 1970 Seiko 6105 cushion-cased diver made famous in Apocalypse Now. Featuring the robust 6R35 automatic movement offering 70 hours of power reserve and LumiBrite on hands and indexes.',
      shortDescription: 'Recreation of the 1970 iconic cushion diver with 70-hour reserve and DiaShield hard coating.',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      stockQuantity: 10,
      images: [
        'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Caliber', value: 'Seiko 6R35 (24 Jewels)' },
        { group: 'Luminescence', key: 'LumiBrite', value: 'Hands, Indexes, and Bezel Pip' },
        { group: 'Coating', key: 'DiaShield', value: 'Super-Hard Scratch Resistant Coating' },
      ],
    },
    {
      name: 'Casio G-Shock Full Metal GMW-B5000GD Gold Ion',
      slug: 'casio-g-shock-full-metal-gold-gmw-b5000gd',
      sku: 'CAS-GMWB5000GD-9',
      brandSlug: 'casio',
      categorySlug: 'sport',
      collectionSlug: 'titanium-avant-garde',
      price: 49995,
      mrp: 55000,
      discountPercent: 9,
      movement: 'Solar',
      gender: 'Unisex',
      caseMaterial: 'Stainless Steel with Gold Ion Plating',
      caseDiameter: '43.2 mm',
      caseThickness: '13.0 mm',
      dialColor: 'Negative STN Digital LCD',
      strapMaterial: 'Solid Stainless Steel Gold IP Link',
      strapColor: 'Champagne Gold',
      waterResistance: '200m (20 Bar)',
      powerReserve: 'Tough Solar (Continuous)',
      crystal: 'Mineral Glass',
      warranty: '2 Years Casio India Warranty',
      condition: 'New / Unworn',
      description: 'The iconic 1983 square silhouette reimagined in full premium stainless steel with lavish gold ion-plating. Equipped with Tough Solar power, Multiband 6 radio atomic time calibration, and Bluetooth Smartphone Link.',
      shortDescription: 'Full stainless steel gold ion-plated edition with Tough Solar and Bluetooth sync.',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      stockQuantity: 15,
      images: [
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Engine', key: 'Power System', value: 'Tough Solar (Solar Powered)' },
        { group: 'Connectivity', key: 'Bluetooth', value: 'Smartphone Link via CASIO WATCHES App' },
        { group: 'Shock Absorption', key: 'Core', value: 'Fine Resin Shock Absorber inside Steel Housing' },
      ],
    },
    {
      name: 'Orient Star Avant-Garde Skeleton Titanium',
      slug: 'orient-star-avant-garde-skeleton-titanium',
      sku: 'ORT-RK-AV0114E',
      brandSlug: 'orient',
      categorySlug: 'luxury',
      collectionSlug: 'titanium-avant-garde',
      price: 115000,
      mrp: 128000,
      discountPercent: 10,
      movement: 'Automatic',
      gender: 'Men',
      caseMaterial: 'Super Titanium Grade 5',
      caseDiameter: '43.2 mm',
      caseThickness: '13.7 mm',
      dialColor: 'Openworked Skeleton Emerald Green & Charcoal',
      strapMaterial: 'Solid Grade 5 Titanium Link',
      strapColor: 'Titanium Grey',
      waterResistance: '100m (10 Bar)',
      powerReserve: '50 Hours',
      crystal: 'Sapphire Crystal with Super Anti-Reflective Coating',
      warranty: '2 Years International',
      condition: 'New / Unworn',
      description: 'The pinnacle of Japanese skeleton horology. Featuring an openworked dial revealing the intricate balance wheel and escapement, an integrated 50-hour power reserve indicator at 12 o’clock, and small seconds register at 6 o’clock.',
      shortDescription: 'Grade 5 titanium openworked skeleton with 50-hour power reserve indicator.',
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      stockQuantity: 5,
      images: [
        'https://images.unsplash.com/photo-1518131672697-613becd4fab5?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Caliber', value: 'Orient In-House F6F44 (24 Jewels)' },
        { group: 'Material', key: 'Titanium', value: 'Grade 5 Lightweight Hypoallergenic' },
        { group: 'Complication', key: 'Indicator', value: '50-Hour Power Reserve at 12 o’clock' },
      ],
    },
    {
      name: 'Citizen Promaster Skyhawk A-T Titanium Chronograph',
      slug: 'citizen-promaster-skyhawk-at-titanium',
      sku: 'CTZ-JY8108-53E',
      brandSlug: 'citizen',
      categorySlug: 'chronograph',
      collectionSlug: 'heritage-grand-prix',
      price: 64900,
      mrp: 72000,
      discountPercent: 10,
      movement: 'Solar',
      gender: 'Men',
      caseMaterial: 'Super Titanium with Duratect TIC',
      caseDiameter: '45.0 mm',
      caseThickness: '14.5 mm',
      dialColor: 'Cockpit Multi-Function Black',
      strapMaterial: 'Super Titanium Bracelet',
      strapColor: 'Titanium Silver',
      waterResistance: '200m (20 Bar)',
      powerReserve: 'Eco-Drive Unlimited Solar Power',
      crystal: 'Anti-Reflective Sapphire Crystal',
      warranty: '3 Years International',
      condition: 'New / Unworn',
      description: 'Precision pilot instrument synchronized with atomic clocks across North America, the UK, Europe, Japan, and China. Features world time in 43 cities, 1/100 second chronograph, perpetual calendar, dual time, 2 alarms, 99-minute countdown timer, and pilot’s rotating slide rule bezel.',
      shortDescription: 'Super Titanium pilot chronograph with Atomic timekeeping and Eco-Drive solar technology.',
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      stockQuantity: 9,
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1495856458515-0637185db551?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Technology', key: 'Eco-Drive', value: 'Caliber U680 Radio-Controlled' },
        { group: 'Bezel', key: 'Slide Rule', value: 'Bidirectional Pilot Navigation Rule' },
        { group: 'Timekeeping', key: 'Atomic Clock Sync', value: '43 Cities World Time' },
      ],
    },
    {
      name: 'Tissot Heritage 1973 Chronograph Limited Edition',
      slug: 'tissot-heritage-1973-chronograph',
      sku: 'TIS-T1244271603100',
      brandSlug: 'tissot',
      categorySlug: 'chronograph',
      collectionSlug: 'heritage-grand-prix',
      price: 185000,
      mrp: 205000,
      discountPercent: 10,
      movement: 'Automatic',
      gender: 'Men',
      caseMaterial: '316L Cushion Stainless Steel',
      caseDiameter: '43.0 mm',
      caseThickness: '14.8 mm',
      dialColor: 'Panda Silver & Matte Black Registers',
      strapMaterial: 'Perforated Racing Calfskin Leather',
      strapColor: 'Cognac Brown with Safety Deployment Clasp',
      waterResistance: '100m (10 Bar)',
      powerReserve: '60 Hours',
      crystal: 'Domed Scratch-resistant Sapphire with AR Coating',
      warranty: '2 Years International',
      condition: 'New / Unworn',
      description: 'An ode to vintage Formula 1 racing and the historic partnership between Tissot and Alpine in the 1970s. The classic cushion case houses the Valjoux A05.H31 automatic chronograph movement with orange second hands and tachymeter flange.',
      shortDescription: 'Cushion-cased vintage racing chronograph with Valjoux automatic movement and panda dial.',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: false,
      stockQuantity: 3,
      images: [
        'https://images.unsplash.com/photo-1547996160-71dfa635826f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Calibre', value: 'ETA Valjoux A05.H31 (27 Jewels)' },
        { group: 'Style', key: 'Dial', value: 'Bi-Compax Panda with Orange Accents' },
        { group: 'Case', key: 'Heritage', value: '1970s Cushion Shape with Exhibition Back' },
      ],
    },
    {
      name: 'Omega Seamaster Aqua Terra 150M Master Chronometer',
      slug: 'omega-seamaster-aqua-terra-150m',
      sku: 'OMG-22010412103001',
      brandSlug: 'omega',
      categorySlug: 'luxury',
      collectionSlug: 'abyssal-marine-pro',
      price: 495000,
      mrp: 530000,
      discountPercent: 7,
      movement: 'Automatic',
      gender: 'Unisex',
      caseMaterial: 'Symmetrical 316L Stainless Steel',
      caseDiameter: '41.0 mm',
      caseThickness: '13.2 mm',
      dialColor: 'Teak Deck Blue Sunburst',
      strapMaterial: 'Steel 3-link with Butterfly Clasp',
      strapColor: 'Silver',
      waterResistance: '150m (15 Bar)',
      powerReserve: '60 Hours',
      crystal: 'Domed Scratch-resistant Sapphire with AR on both sides',
      warranty: '5 Years Omega International',
      condition: 'New / Unworn',
      description: 'A magnificent tribute to OMEGA’s maritime heritage. The horizontal teak concept dial resembles the wooden decks of luxury yachts. Powered by the OMEGA Master Chronometer Calibre 8900, certified at the industry’s highest level by METAS.',
      shortDescription: 'Horizontal teak yacht dial with METAS certified Master Chronometer Calibre 8900.',
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      stockQuantity: 4,
      images: [
        'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Calibre', value: 'OMEGA In-House 8900 Co-Axial' },
        { group: 'Barrels', key: 'Twin Barrels', value: 'Mounted in Series for Smooth Torque' },
        { group: 'Case', key: 'Rhodium-Plated', value: 'Geneva Waves in Arabesque rotor' },
      ],
    },
    {
      name: 'Longines Master Collection Moonphase Chronograph 40mm',
      slug: 'longines-master-collection-moonphase-40mm',
      sku: 'LNG-L26734783',
      brandSlug: 'longines',
      categorySlug: 'dress',
      collectionSlug: 'royal-sunburst',
      price: 310000,
      mrp: 340000,
      discountPercent: 9,
      movement: 'Automatic',
      gender: 'Men',
      caseMaterial: 'Stainless Steel',
      caseDiameter: '40.0 mm',
      caseThickness: '14.3 mm',
      dialColor: 'Silver Barleycorn Dial with Blued Steel Hands',
      strapMaterial: 'Alligator Leather with Triple Folding Safety Clasp',
      strapColor: 'Dark Brown',
      waterResistance: '30m (3 Bar)',
      powerReserve: '66 Hours',
      crystal: 'Scratch-resistant Sapphire Crystal',
      warranty: '5 Years Longines International',
      condition: 'New / Unworn',
      description: 'The epitome of classical watchmaking. Displays hours, minutes, small seconds with 24-hour indicator at 9 o’clock, date indicated by half-moon central hand, chronograph 30-minute counter with day/month at 12 o’clock, and moonphase display at 6 o’clock.',
      shortDescription: 'Masterpiece triple calendar chronograph with authentic moonphase complication and barleycorn dial.',
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: false,
      stockQuantity: 5,
      images: [
        'https://images.unsplash.com/photo-1517467139951-f5a925c9f9de?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&w=1000&q=80',
      ],
      specs: [
        { group: 'Movement', key: 'Calibre', value: 'Longines L687 (Column-Wheel Chronograph)' },
        { group: 'Complication', key: 'Calendar', value: 'Full Triple Calendar + 24H Indicator' },
        { group: 'Complication', key: 'Moonphase', value: 'High Precision Lunar Disk at 6' },
      ],
    },
  ];

  for (const prodData of products) {
    const brand = createdBrands[prodData.brandSlug];
    const category = createdCategories[prodData.categorySlug];
    const collection = prodData.collectionSlug ? createdCollections[prodData.collectionSlug] : null;

    const product = await prisma.product.create({
      data: {
        name: prodData.name,
        slug: prodData.slug,
        sku: prodData.sku,
        brandId: brand.id,
        categoryId: category.id,
        collectionId: collection ? collection.id : null,
        price: prodData.price,
        mrp: prodData.mrp,
        discountPercent: prodData.discountPercent,
        movement: prodData.movement,
        gender: prodData.gender,
        caseMaterial: prodData.caseMaterial,
        caseDiameter: prodData.caseDiameter,
        caseThickness: prodData.caseThickness,
        dialColor: prodData.dialColor,
        strapMaterial: prodData.strapMaterial,
        strapColor: prodData.strapColor,
        waterResistance: prodData.waterResistance,
        powerReserve: prodData.powerReserve,
        crystal: prodData.crystal,
        warranty: prodData.warranty,
        condition: prodData.condition,
        description: prodData.description,
        shortDescription: prodData.shortDescription,
        isFeatured: prodData.isFeatured,
        isBestSeller: prodData.isBestSeller,
        isNewArrival: prodData.isNewArrival,
        inventory: {
          create: {
            stockQuantity: prodData.stockQuantity,
            reservedQuantity: 0,
            lowStockThreshold: 2,
          },
        },
        images: {
          create: prodData.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            displayOrder: idx,
            altText: `${prodData.name} - View ${idx + 1}`,
          })),
        },
        specifications: {
          create: prodData.specs.map((s, idx) => ({
            group: s.group,
            key: s.key,
            value: s.value,
            displayOrder: idx,
          })),
        },
      },
    });

    // Add initial reviews & Q&A
    await prisma.review.create({
      data: {
        productId: product.id,
        userId: demoCustomer.id,
        rating: 5,
        title: 'Breathtaking finish and mechanical perfection',
        comment: 'Received this in pristine double-boxed AURELIA packaging within 48 hours. The dial details under sunlight are simply mesmerizing, and timekeeping has been within +2 seconds/day.',
        isVerifiedPurchase: true,
        isApproved: true,
      },
    });

    await prisma.question.create({
      data: {
        productId: product.id,
        userId: demoCustomer.id,
        questionText: 'Does this model come with an international manufacturer warranty card stamped by an authorized boutique?',
        isApproved: true,
        answers: {
          create: {
            authorName: 'AURELIA Master Concierge',
            isOfficial: true,
            answerText: 'Yes, absolutely. Every timepiece purchased from AURELIA includes the official manufacturer warranty card stamped and activated with our authorized dealer network credentials on date of dispatch.',
          },
        },
      },
    });
  }

  // 8. Coupons
  await prisma.coupon.create({
    data: {
      code: 'AURELIA10',
      description: '10% exclusive privilege discount on orders above ₹30,000',
      type: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 30000,
      maxDiscountAmount: 25000,
      usageLimit: 500,
      usageCount: 14,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'WELCOME5',
      description: '5% welcome reward on your first luxury acquisition',
      type: 'PERCENTAGE',
      discountValue: 5,
      minOrderAmount: 10000,
      maxDiscountAmount: 10000,
      usageLimit: 1000,
      usageCount: 42,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'HOROLOGY5000',
      description: 'Flat ₹5,000 off on high complications exceeding ₹1,50,000',
      type: 'FIXED_AMOUNT',
      discountValue: 5000,
      minOrderAmount: 150000,
      maxDiscountAmount: 5000,
      usageLimit: 100,
      usageCount: 7,
      perUserLimit: 1,
      isActive: true,
    },
  });

  // 9. Sample Initial Orders for realistic analytics
  const firstProduct = await prisma.product.findFirst({
    where: { slug: 'seiko-presage-cocktail-time-skydiving' },
    include: { images: true, brand: true },
  });

  if (firstProduct) {
    const demoOrder = await prisma.order.create({
      data: {
        orderNumber: 'AUR-2026-8942',
        userId: demoCustomer.id,
        guestEmail: demoCustomer.email,
        guestName: demoCustomer.name,
        guestPhone: demoCustomer.phone,
        shippingAddressSnapshot: JSON.stringify({
          fullName: 'Vikramaditya Roy',
          phone: '+91 98765 43210',
          addressLine1: 'Villa 22, Whispering Palms Estate',
          addressLine2: 'Road No. 36, Jubilee Hills',
          city: 'Hyderabad',
          state: 'Telangana',
          postalCode: '500033',
          country: 'India',
        }),
        subtotal: firstProduct.price,
        discountAmount: 0,
        taxAmount: Math.round(firstProduct.price * 0.18),
        shippingAmount: 0,
        insuranceAmount: 0,
        codFee: 0,
        totalAmount: Math.round(firstProduct.price * 1.18),
        status: 'CONFIRMED',
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        items: {
          create: {
            productId: firstProduct.id,
            productName: firstProduct.name,
            productSku: firstProduct.sku,
            productImage: firstProduct.images[0]?.url || '',
            brandName: firstProduct.brand.name,
            unitPrice: firstProduct.price,
            quantity: 1,
            totalPrice: firstProduct.price,
          },
        },
        payments: {
          create: {
            paymentMethod: 'COD',
            paymentStatus: 'PENDING',
            amount: Math.round(firstProduct.price * 1.18),
            gatewayPaymentId: 'COD-DEMO-AUR-991823',
          },
        },
        shipments: {
          create: {
            courierName: 'BlueDart Apex Priority',
            trackingNumber: 'BD882910482IN',
            trackingUrl: 'https://www.bluedart.com',
            status: 'Processing in Vault Logistics',
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    console.log('Sample Order created with ID:', demoOrder.orderNumber);
  }

  console.log('Database seeded successfully with luxury brands, watches, coupons, and test accounts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
