import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, canManageProducts } from '@/lib/auth';
import { slugify, generateSKU } from '@/lib/utils';

// Helper to determine country of origin for horological brands
function getOriginCountry(brandName: string): string {
  const lower = brandName.toLowerCase();
  if (lower.includes('casio') || lower.includes('seiko') || lower.includes('citizen') || lower.includes('orient')) {
    return 'Japan';
  }
  if (lower.includes('armani') || lower.includes('versace') || lower.includes('gucci') || lower.includes('panerai')) {
    return 'Italy';
  }
  if (lower.includes('hugo boss') || lower.includes('lange') || lower.includes('sinn') || lower.includes('nomos') || lower.includes('glashütte')) {
    return 'Germany';
  }
  if (lower.includes('guess') || lower.includes('fossil') || lower.includes('timex') || lower.includes('bulova') || lower.includes('hamilton')) {
    return 'United States';
  }
  if (lower.includes('grand seiko')) {
    return 'Japan';
  }
  return 'Switzerland';
}

// Robust RFC 4180 CSV parser handling quotes, escaped quotes (""), commas, and consecutive empty cells
function parseCsv(csvData: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  const text = csvData.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        currentCell += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      currentCell = '';
    } else if (char === '\n' && !inQuotes) {
      currentRow.push(currentCell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    if (currentRow.some((cell) => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Map column positions from header names with standard index fallbacks
function getColumnIndices(headerRow: string[]) {
  const normalize = (h: string) => (h || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const headers = headerRow.map(normalize);

  const findIdx = (names: string[], fallback: number) => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1) return idx;
    }
    return fallback;
  };

  return {
    sku: findIdx(['sku', 'reference', 'itemsku'], 0),
    name: findIdx(['name', 'title', 'productname', 'model'], 1),
    brand: findIdx(['brand', 'manufacturer', 'maison'], 2),
    category: findIdx(['category', 'collectiontype', 'type'], 3),
    price: findIdx(['price', 'retailprice', 'saleprice', 'sellingprice'], 4),
    mrp: findIdx(['mrp', 'listprice', 'originalprice'], 5),
    stock: findIdx(['stock', 'quantity', 'inventory', 'stockquantity', 'qty'], 6),
    movement: findIdx(['movement', 'caliber', 'mechanism'], 7),
    caseMaterial: findIdx(['casematerial', 'material', 'case'], 8),
    caseDiameter: findIdx(['casediameter', 'diameter', 'size', 'casesize'], 9),
    waterResistance: findIdx(['waterresistance', 'waterresistant', 'waterresist', 'wr'], 10),
    description: findIdx(['description', 'shortdescription', 'details', 'summary'], 11),
    imageUrl: findIdx(['imageurl', 'image', 'images', 'photo', 'photourl'], 12),
  };
}

// Validate price and MRP numeric integers
function parseAndValidatePrice(val: string | undefined | null, fieldName: 'Price' | 'MRP'): { value?: number; error?: string } {
  if (!val || val.trim() === '') {
    return { error: `${fieldName} is required` };
  }
  const clean = val.trim();
  if (/^-/.test(clean)) {
    return { error: `${fieldName} must be greater than zero` };
  }
  // Reject currency symbols (₹, $, €), commas, and non-numeric formats
  if (/[₹$,]/i.test(clean) || !/^\d+(\.\d+)?$/.test(clean)) {
    return { error: `Invalid ${fieldName.toLowerCase()} number (must be integer e.g. 49999)` };
  }
  const num = Number(clean);
  if (isNaN(num) || num <= 0) {
    return { error: `${fieldName} must be greater than zero` };
  }
  return { value: Math.round(num) };
}

// Validate HTTPS Image URL
function validateImageUrl(urlStr: string | undefined | null): { isValid: boolean; error?: string } {
  if (!urlStr || urlStr.trim() === '') {
    return { isValid: true }; // Optional if empty
  }
  const trimmed = urlStr.trim();
  if (!trimmed.startsWith('https://')) {
    return { isValid: false, error: 'Invalid ImageUrl (must be a valid HTTPS URL e.g. https://example.com/watch.jpg)' };
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Invalid ImageUrl (must use HTTPS protocol)' };
    }
    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: 'Invalid ImageUrl format' };
  }
}

// Safe idempotent Brand lookup and auto-creation
async function resolveBrand(brandName: string): Promise<{ id: string; name: string; slug: string; isNew: boolean }> {
  const trimmed = brandName.trim();

  // 1. Case-insensitive lookup
  const existing = await prisma.brand.findFirst({
    where: { name: { equals: trimmed, mode: 'insensitive' } },
  });

  if (existing) {
    return { id: existing.id, name: existing.name, slug: existing.slug, isNew: false };
  }

  // 2. Generate unique slug
  let baseSlug = slugify(trimmed) || 'brand';
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.brand.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  // 3. Upsert
  const created = await prisma.brand.upsert({
    where: { name: trimmed },
    update: {},
    create: {
      name: trimmed,
      slug,
      originCountry: getOriginCountry(trimmed),
      isFeatured: false,
    },
  });

  return { id: created.id, name: created.name, slug: created.slug, isNew: true };
}

// Safe idempotent Category lookup and auto-creation
async function resolveCategory(categoryName: string): Promise<{ id: string; name: string; slug: string; isNew: boolean }> {
  const trimmed = categoryName.trim();

  // 1. Case-insensitive lookup
  const existing = await prisma.category.findFirst({
    where: { name: { equals: trimmed, mode: 'insensitive' } },
  });

  if (existing) {
    return { id: existing.id, name: existing.name, slug: existing.slug, isNew: false };
  }

  // 2. Generate unique slug
  let baseSlug = slugify(trimmed) || 'category';
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.category.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  // 3. Upsert
  const created = await prisma.category.upsert({
    where: { name: trimmed },
    update: {},
    create: {
      name: trimmed,
      slug,
      description: `Curated collection of ${trimmed}.`,
      isFeatured: false,
    },
  });

  return { id: created.id, name: created.name, slug: created.slug, isNew: true };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Only administrators can export catalog data.' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        inventory: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'SKU',
      'Name',
      'Brand',
      'Category',
      'Price',
      'MRP',
      'Stock',
      'Movement',
      'CaseMaterial',
      'CaseDiameter',
      'WaterResistance',
      'Description',
      'ImageUrl',
    ];

    const rows = products.map((p) => [
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand.name.replace(/"/g, '""')}"`,
      `"${p.category.name.replace(/"/g, '""')}"`,
      p.price,
      p.mrp,
      p.inventory?.stockQuantity ?? 0,
      `"${p.movement}"`,
      `"${(p.caseMaterial || '').replace(/"/g, '""')}"`,
      `"${(p.caseDiameter || '').replace(/"/g, '""')}"`,
      `"${(p.waterResistance || '').replace(/"/g, '""')}"`,
      `"${(p.shortDescription || p.description || '').replace(/"/g, '""')}"`,
      `"${p.images[0]?.url || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="kshan_catalog_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json({ error: 'Failed to export catalog CSV' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Strict Server-Side Admin Role Verification
    const session = await getSessionUser(req);
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Only administrators (ADMIN / SUPER_ADMIN) can execute bulk product ingestion.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const { csvData, dryRun = false } = body;

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json({ error: 'CSV data string is required' }, { status: 400 });
    }

    const parsedRows = parseCsv(csvData);
    if (parsedRows.length < 2) {
      return NextResponse.json(
        { error: 'CSV file must contain at least a header row and one valid data row.' },
        { status: 400 }
      );
    }

    const headerRow = parsedRows[0];
    const dataRows = parsedRows.slice(1);
    const colIdx = getColumnIndices(headerRow);

    // Pre-fetch all existing brands and categories from DB for case-insensitive lookup
    let existingBrands: any[] = [];
    let existingCategories: any[] = [];
    try {
      existingBrands = await prisma.brand.findMany();
      existingCategories = await prisma.category.findMany();
    } catch (e) {
      // In dryRun/preview or if offline, continue with empty initial cache
    }

    // In-memory lookup maps (lowercase name -> Record)
    const brandMap = new Map<string, { id: string; name: string; slug: string }>();
    existingBrands.forEach((b) => brandMap.set(b.name.trim().toLowerCase(), b));

    const categoryMap = new Map<string, { id: string; name: string; slug: string }>();
    existingCategories.forEach((c) => categoryMap.set(c.name.trim().toLowerCase(), c));

    // Track newly discovered brands and categories during dry run / preview
    const pendingNewBrands = new Set<string>();
    const pendingNewCategories = new Set<string>();

    interface RowEvaluation {
      rowNumber: number;
      isValid: boolean;
      data: {
        sku: string;
        name: string;
        brandName: string;
        categoryName: string;
        price: number;
        mrp: number;
        stock: number;
        movement: string;
        caseMaterial: string;
        caseDiameter: string;
        waterResistance: string;
        description: string;
        imageUrl: string;
      };
      errors: string[];
      notices: string[];
    }

    const evaluatedRows: RowEvaluation[] = [];

    dataRows.forEach((rowValues, idx) => {
      const rowNumber = idx + 2;
      const errors: string[] = [];
      const notices: string[] = [];

      const rawSku = (rowValues[colIdx.sku] || '').trim();
      const rawName = (rowValues[colIdx.name] || '').trim();
      const rawBrand = (rowValues[colIdx.brand] || '').trim();
      const rawCategory = (rowValues[colIdx.category] || '').trim();
      const rawPrice = rowValues[colIdx.price];
      const rawMrp = rowValues[colIdx.mrp];
      const rawStock = (rowValues[colIdx.stock] || '').trim();
      const rawMovement = (rowValues[colIdx.movement] || '').trim() || 'Automatic';
      const rawCaseMaterial = (rowValues[colIdx.caseMaterial] || '').trim() || 'Stainless Steel';
      const rawCaseDiameter = (rowValues[colIdx.caseDiameter] || '').trim() || '40 mm';
      const rawWaterResistance = (rowValues[colIdx.waterResistance] || '').trim() || '100m';
      const rawDescription = (rowValues[colIdx.description] || '').trim() || `${rawName || 'Luxury'} timepiece engineered with haute horlogerie precision.`;
      const rawImageUrl = (rowValues[colIdx.imageUrl] || '').trim();

      // Validation 1: Name
      if (!rawName) {
        errors.push('Product name is required');
      }

      // Validation 2: Brand Handling (Auto-creation if missing)
      if (!rawBrand) {
        errors.push('Brand name is required');
      } else {
        const brandKey = rawBrand.toLowerCase();
        if (brandMap.has(brandKey)) {
          // Existing brand found
        } else {
          pendingNewBrands.add(rawBrand);
          notices.push(`Brand "${rawBrand}" will be created automatically`);
        }
      }

      // Validation 3: Category Handling (Auto-creation if missing)
      if (!rawCategory) {
        errors.push('Category name is required');
      } else {
        const categoryKey = rawCategory.toLowerCase();
        if (categoryMap.has(categoryKey)) {
          // Existing category found
        } else {
          pendingNewCategories.add(rawCategory);
          notices.push(`Category "${rawCategory}" will be created automatically`);
        }
      }

      // Validation 4: Price
      const priceVal = parseAndValidatePrice(rawPrice, 'Price');
      if (priceVal.error) {
        errors.push(priceVal.error);
      }

      // Validation 5: MRP
      const mrpVal = parseAndValidatePrice(rawMrp, 'MRP');
      if (mrpVal.error) {
        errors.push(mrpVal.error);
      }

      // Validation 6: ImageUrl
      const imgVal = validateImageUrl(rawImageUrl);
      if (!imgVal.isValid && imgVal.error) {
        errors.push(imgVal.error);
      }

      // Stock
      let stock = 5;
      if (rawStock) {
        const parsedStock = Number(rawStock);
        if (!isNaN(parsedStock) && parsedStock >= 0) {
          stock = Math.floor(parsedStock);
        }
      }

      const isValid = errors.length === 0;

      evaluatedRows.push({
        rowNumber,
        isValid,
        data: {
          sku: rawSku || (rawBrand && rawName ? generateSKU(rawBrand, rawName) : `KSH-${Math.floor(10000 + Math.random() * 90000)}`),
          name: rawName,
          brandName: rawBrand,
          categoryName: rawCategory,
          price: priceVal.value ?? 0,
          mrp: mrpVal.value ?? (priceVal.value ?? 0),
          stock,
          movement: rawMovement,
          caseMaterial: rawCaseMaterial,
          caseDiameter: rawCaseDiameter,
          waterResistance: rawWaterResistance,
          description: rawDescription,
          imageUrl: rawImageUrl,
        },
        errors,
        notices,
      });
    });

    const validRows = evaluatedRows.filter((r) => r.isValid);
    const invalidRows = evaluatedRows.filter((r) => !r.isValid);

    // ==========================================
    // DRY RUN PREVIEW RESPONSE
    // ==========================================
    if (dryRun) {
      return NextResponse.json({
        totalRows: evaluatedRows.length,
        validCount: validRows.length,
        invalidCount: invalidRows.length,
        newBrands: Array.from(pendingNewBrands),
        newCategories: Array.from(pendingNewCategories),
        rows: evaluatedRows.map((r) => ({
          rowNumber: r.rowNumber,
          isValid: r.isValid,
          name: r.data.name,
          brand: r.data.brandName,
          category: r.data.categoryName,
          price: r.data.price,
          mrp: r.data.mrp,
          stock: r.data.stock,
          sku: r.data.sku,
          imageUrl: r.data.imageUrl,
          errors: r.errors,
          notices: r.notices,
        })),
      });
    }

    // ==========================================
    // EXECUTE INGESTION & SAVE
    // ==========================================
    if (validRows.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid rows found to import. Please fix all validation errors before executing ingestion.',
          totalRows: evaluatedRows.length,
          validCount: 0,
          invalidCount: invalidRows.length,
          errors: invalidRows.map((r) => ({ rowNumber: r.rowNumber, errors: r.errors })),
        },
        { status: 400 }
      );
    }

    const createdBrandNames: string[] = [];
    const createdCategoryNames: string[] = [];
    const resolvedBrandMap = new Map<string, { id: string; name: string }>();
    const resolvedCategoryMap = new Map<string, { id: string; name: string }>();

    // Step 1: Pre-resolve/create all required Brands idempotently
    const uniqueBrandNames = Array.from(new Set(validRows.map((r) => r.data.brandName.trim())));
    for (const bName of uniqueBrandNames) {
      const bKey = bName.toLowerCase();
      const resolved = await resolveBrand(bName);
      resolvedBrandMap.set(bKey, resolved);
      if (resolved.isNew && !createdBrandNames.includes(resolved.name)) {
        createdBrandNames.push(resolved.name);
      }
    }

    // Step 2: Pre-resolve/create all required Categories idempotently
    const uniqueCategoryNames = Array.from(new Set(validRows.map((r) => r.data.categoryName.trim())));
    for (const cName of uniqueCategoryNames) {
      const cKey = cName.toLowerCase();
      const resolved = await resolveCategory(cName);
      resolvedCategoryMap.set(cKey, resolved);
      if (resolved.isNew && !createdCategoryNames.includes(resolved.name)) {
        createdCategoryNames.push(resolved.name);
      }
    }

    // Step 3: Insert / Upsert all valid products
    let createdCount = 0;
    let updatedCount = 0;
    const failedRows: Array<{ rowNumber: number; sku: string; error: string }> = [];

    for (const item of validRows) {
      try {
        const brand = resolvedBrandMap.get(item.data.brandName.trim().toLowerCase())!;
        const category = resolvedCategoryMap.get(item.data.categoryName.trim().toLowerCase())!;

        const discountPercent =
          item.data.mrp > item.data.price
            ? Math.round(((item.data.mrp - item.data.price) / item.data.mrp) * 100)
            : 0;

        // Check if a product with this SKU already exists
        const existingProduct = await prisma.product.findUnique({
          where: { sku: item.data.sku },
          include: { inventory: true, images: true },
        });

        if (existingProduct) {
          // Update existing product to prevent duplicate collisions
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: item.data.name,
              brandId: brand.id,
              categoryId: category.id,
              price: item.data.price,
              mrp: item.data.mrp,
              discountPercent,
              movement: item.data.movement,
              caseMaterial: item.data.caseMaterial,
              caseDiameter: item.data.caseDiameter,
              waterResistance: item.data.waterResistance,
              description: item.data.description,
              shortDescription: item.data.description.substring(0, 180),
              isPublished: true,
            },
          });

          // Sync inventory
          if (existingProduct.inventory) {
            await prisma.inventory.update({
              where: { productId: existingProduct.id },
              data: { stockQuantity: item.data.stock },
            });
          } else {
            await prisma.inventory.create({
              data: {
                productId: existingProduct.id,
                stockQuantity: item.data.stock,
                lowStockThreshold: 2,
              },
            });
          }

          // Sync image
          if (item.data.imageUrl) {
            if (existingProduct.images.length > 0) {
              await prisma.productImage.update({
                where: { id: existingProduct.images[0].id },
                data: { url: item.data.imageUrl },
              });
            } else {
              await prisma.productImage.create({
                data: {
                  productId: existingProduct.id,
                  url: item.data.imageUrl,
                  isPrimary: true,
                  displayOrder: 0,
                },
              });
            }
          }

          updatedCount++;
        } else {
          // New product creation: ensure unique slug
          let baseSlug = slugify(item.data.name) || 'timepiece';
          let slug = baseSlug;
          let slugSuffix = 1;
          while (await prisma.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${slugSuffix++}`;
          }

          await prisma.product.create({
            data: {
              name: item.data.name,
              slug,
              sku: item.data.sku,
              brandId: brand.id,
              categoryId: category.id,
              price: item.data.price,
              mrp: item.data.mrp,
              discountPercent,
              movement: item.data.movement,
              caseMaterial: item.data.caseMaterial,
              caseDiameter: item.data.caseDiameter,
              waterResistance: item.data.waterResistance,
              description: item.data.description,
              shortDescription: item.data.description.substring(0, 180),
              isPublished: true,
              inventory: {
                create: {
                  stockQuantity: item.data.stock,
                  lowStockThreshold: 2,
                },
              },
              ...(item.data.imageUrl
                ? {
                    images: {
                      create: {
                        url: item.data.imageUrl,
                        isPrimary: true,
                        displayOrder: 0,
                      },
                    },
                  }
                : {}),
            },
          });

          createdCount++;
        }
      } catch (rowErr: any) {
        console.error(`Error importing row ${item.rowNumber} (${item.data.sku}):`, rowErr);
        failedRows.push({
          rowNumber: item.rowNumber,
          sku: item.data.sku,
          error: rowErr?.message || 'Database write error',
        });
      }
    }

    const totalProcessed = createdCount + updatedCount;

    // Step 4: Record Audit Log
    try {
      await prisma.adminActivityLog.create({
        data: {
          userId: session.userId,
          action: 'BULK_CSV_IMPORT',
          entityType: 'PRODUCT',
          details: `Imported ${totalProcessed} products (${createdCount} created, ${updatedCount} updated), created ${createdBrandNames.length} brands (${createdBrandNames.join(', ')}), created ${createdCategoryNames.length} categories (${createdCategoryNames.join(', ')})`,
        },
      });
    } catch (logErr) {
      console.warn('AdminActivityLog failed to record:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${totalProcessed} timepieces (${createdCount} new created, ${updatedCount} updated).`,
      importedCount: totalProcessed,
      createdCount,
      updatedCount,
      skippedCount: invalidRows.length + failedRows.length,
      createdBrands: createdBrandNames,
      createdCategories: createdCategoryNames,
      failedRows,
      invalidRows: invalidRows.map((r) => ({
        rowNumber: r.rowNumber,
        errors: r.errors,
      })),
    });
  } catch (error: any) {
    console.error('CSV ingestion error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV import: ' + (error?.message || 'Unknown database error') },
      { status: 500 }
    );
  }
}
