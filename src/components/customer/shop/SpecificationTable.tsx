import React from 'react';

interface SpecificationItem {
  group?: string;
  key: string;
  value: string;
}

interface SpecificationTableProps {
  specifications: SpecificationItem[];
  productData?: {
    movement?: string;
    caseMaterial?: string | null;
    caseDiameter?: string | null;
    caseThickness?: string | null;
    dialColor?: string | null;
    strapMaterial?: string | null;
    strapColor?: string | null;
    waterResistance?: string | null;
    powerReserve?: string | null;
    crystal?: string | null;
    warranty?: string | null;
    condition?: string;
    gender?: string;
  };
}

export const SpecificationTable: React.FC<SpecificationTableProps> = ({
  specifications = [],
  productData,
}) => {
  // Merge base product fields with custom specs
  const allSpecs: SpecificationItem[] = [...specifications];

  if (productData) {
    if (productData.movement && !allSpecs.some((s) => s.key === 'Movement Type')) {
      allSpecs.unshift({ group: 'Movement', key: 'Movement Type', value: productData.movement });
    }
    if (productData.powerReserve && !allSpecs.some((s) => s.key === 'Power Reserve')) {
      allSpecs.push({ group: 'Movement', key: 'Power Reserve', value: productData.powerReserve });
    }
    if (productData.caseMaterial && !allSpecs.some((s) => s.key === 'Case Material')) {
      allSpecs.push({ group: 'Case', key: 'Case Material', value: productData.caseMaterial });
    }
    if (productData.caseDiameter && !allSpecs.some((s) => s.key === 'Case Diameter')) {
      allSpecs.push({ group: 'Case', key: 'Case Diameter', value: productData.caseDiameter });
    }
    if (productData.caseThickness && !allSpecs.some((s) => s.key === 'Case Thickness')) {
      allSpecs.push({ group: 'Case', key: 'Case Thickness', value: productData.caseThickness });
    }
    if (productData.waterResistance && !allSpecs.some((s) => s.key === 'Water Resistance')) {
      allSpecs.push({ group: 'Case', key: 'Water Resistance', value: productData.waterResistance });
    }
    if (productData.crystal && !allSpecs.some((s) => s.key === 'Crystal Glass')) {
      allSpecs.push({ group: 'Case', key: 'Crystal Glass', value: productData.crystal });
    }
    if (productData.dialColor && !allSpecs.some((s) => s.key === 'Dial Finish')) {
      allSpecs.push({ group: 'Dial', key: 'Dial Finish', value: productData.dialColor });
    }
    if (productData.strapMaterial && !allSpecs.some((s) => s.key === 'Strap Material')) {
      allSpecs.push({ group: 'Strap / Bracelet', key: 'Strap Material', value: productData.strapMaterial });
    }
    if (productData.warranty && !allSpecs.some((s) => s.key === 'Manufacturer Warranty')) {
      allSpecs.push({ group: 'General', key: 'Manufacturer Warranty', value: productData.warranty });
    }
    if (productData.condition && !allSpecs.some((s) => s.key === 'Piece Condition')) {
      allSpecs.push({ group: 'General', key: 'Piece Condition', value: productData.condition });
    }
  }

  // Group by category group
  const grouped = allSpecs.reduce((acc, spec) => {
    const g = spec.group || 'General';
    if (!acc[g]) acc[g] = [];
    acc[g].push(spec);
    return acc;
  }, {} as Record<string, SpecificationItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([groupName, items]) => (
        <div key={groupName} className="bg-obsidian-900/40 border border-obsidian-800 rounded-lg overflow-hidden">
          <div className="bg-obsidian-900/80 px-5 py-3 border-b border-obsidian-800 flex items-center justify-between">
            <h4 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
              {groupName} Specifications
            </h4>
            <span className="text-[10px] text-gray-500 font-mono">{items.length} Parameters</span>
          </div>

          <div className="divide-y divide-obsidian-800/60">
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 px-5 py-3 text-xs hover:bg-obsidian-900/30 transition-colors">
                <div className="col-span-5 md:col-span-4 text-gray-400 font-medium">
                  {item.key}
                </div>
                <div className="col-span-7 md:col-span-8 text-white font-medium">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
