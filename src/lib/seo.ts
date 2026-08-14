export function generateProductJsonLd(product: {
  name: string;
  description: string;
  sku: string;
  brand: string;
  price: number;
  currency?: string;
  images: string[];
  inStock: boolean;
  ratingValue?: number;
  reviewCount?: number;
  slug: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureliawatches.com';
  const productUrl = `${siteUrl}/product/${product.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: product.currency || 'INR',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'AURELIA Haute Horlogerie',
      },
    },
    ...(product.ratingValue && product.reviewCount
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingValue.toFixed(1),
            reviewCount: product.reviewCount,
            bestRating: '5',
            worstRating: '1',
          },
        }
      : {}),
  };
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureliawatches.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

export function generateOrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aureliawatches.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: 'AURELIA Haute Horlogerie',
    url: siteUrl,
    logo: `${siteUrl}/images/aurelia-logo.png`,
    description:
      'Purveyors of exceptional luxury timepieces, authorized horology boutique, and Master Chronometer heritage collections.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'The Horizon Tower, Suite 44B, Bandra Kurla Complex',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      postalCode: '400051',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-22-8900-4400',
      contactType: 'customer service',
      areaServed: ['IN', 'AE', 'GB', 'SG', 'US'],
      availableLanguage: ['English', 'Hindi', 'French'],
    },
  };
}
