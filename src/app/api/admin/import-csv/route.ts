import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser, canManageProducts } from '@/lib/auth';
import { slugify, generateSKU } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        brand: true,
        category: true,
        inventory: true,
        images: true,
      },
    });

    // Generate CSV String
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
      `"${p.brand.name}"`,
      `"${p.category.name}"`,
      p.price,
      p.mrp,
      p.inventory?.stockQuantity ?? 0,
      `"${p.movement}"`,
      `"${p.caseMaterial || ''}"`,
      `"${p.caseDiameter || ''}"`,
      `"${p.waterResistance || ''}"`,
      `"${(p.shortDescription || p.description).replace(/"/g, '""')}"`,
      `"${p.images[0]?.url || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="aurelia_catalog_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !canManageProducts(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { csvData, dryRun = false } = await req.json();

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json({ error: 'CSV data string is required' }, { status: 400 });
    }

    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain at least a header row and one data row.' }, { status: 400 });
    }

    const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1);

    const validRows: any[] = [];
    const errorRows: Array<{ rowNumber: number; data: string; errors: string[] }> = [];

    // Pre-fetch brands and categories for matching
    const allBrands = await prisma.brand.findMany();
    const allCategories = await prisma.category.findMany();

    rows.forEach((line, index) => {
      if (!line.trim()) return;
      const rowNumber = index + 2;
      // Simple CSV split matching quotes
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));

      const rowErrors: string[] = [];
      const name = values[1];
      const brandName = values[2];
      const categoryName = values[3];
      const price = Number(values[4]);
      const mrp = Number(values[5]) || price;
      const stock = Number(values[6]) || 5;
      const movement = values[7] || 'Automatic';
      const caseMaterial = values[8] || 'Stainless Steel';
      const caseDiameter = values[9] || '40 mm';
      const waterResistance = values[10] || '100m';
      const description = values[11] || `${name} luxury timepiece.`;
      const imageUrl = values[12] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

      if (!name) rowErrors.push('Missing product name');
      if (!brandName) rowErrors.push('Missing brand name');
      if (isNaN(price) || price <= 0) rowErrors.push('Invalid price number');

      const matchedBrand = allBrands.find(
        (b) => b.name.toLowerCase() === (brandName || '').toLowerCase()
      );
      if (!matchedBrand) {
        rowErrors.push(`Brand "${brandName}" not found in system`);
      }

      const matchedCategory = allCategories.find(
        (c) => c.name.toLowerCase().includes((categoryName || '').toLowerCase())
      );
      if (!matchedCategory) {
        rowErrors.push(`Category "${categoryName}" not found in system`);
      }

      if (rowErrors.length > 0) {
        errorRows.push({ rowNumber, data: line, errors: rowErrors });
      } else {
        validRows.push({
          sku: values[0] || generateSKU(brandName, name),
          name,
          brandId: matchedBrand!.id,
          categoryId: matchedCategory!.id,
          price,
          mrp,
          stock,
          movement,
          caseMaterial,
          caseDiameter,
          waterResistance,
          description,
          imageUrl,
        });
      }
    });

    // If dry run, return preview summary
    if (dryRun) {
      return NextResponse.json({
        totalRows: rows.length,
        validCount: validRows.length,
        errorCount: errorRows.length,
        validPreview: validRows.slice(0, 5),
        errorRows,
      });
    }

    // Execute actual import
    let importedCount = 0;
    for (const item of validRows) {
      let slug = slugify(item.name);
      const existing = await prisma.product.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const discountPercent = item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : 0;

      await prisma.product.create({
        data: {
          name: item.name,
          slug,
          sku: item.sku,
          brandId: item.brandId,
          categoryId: item.categoryId,
          price: item.price,
          mrp: item.mrp,
          discountPercent,
          movement: item.movement,
          caseMaterial: item.caseMaterial,
          caseDiameter: item.caseDiameter,
          waterResistance: item.waterResistance,
          description: item.description,
          isPublished: true,
          inventory: {
            create: {
              stockQuantity: item.stock,
              lowStockThreshold: 2,
            },
          },
          images: {
            create: {
              url: item.imageUrl,
              isPrimary: true,
              displayOrder: 0,
            },
          },
        },
      });
      importedCount++;
    }

    await prisma.adminActivityLog.create({
      data: {
        userId: session.userId,
        action: 'BULK_CSV_IMPORT',
        entityType: 'PRODUCT',
        details: `Imported ${importedCount} products via CSV upload`,
      },
    });

    return NextResponse.json({
      message: `Successfully imported ${importedCount} timepieces.`,
      importedCount,
      skippedCount: errorRows.length,
      errors: errorRows,
    });
  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ error: 'Failed to process CSV import' }, { status: 500 });
  }
}
