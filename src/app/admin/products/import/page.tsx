'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  Eye,
  Sparkles,
  Layers,
  Tag,
} from 'lucide-react';

const sampleCsv = `SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl
AUR-ROLEX-SUB01,"Oyster Perpetual Submariner Date","Rolex","Luxury Watches",850000,900000,3,"Automatic","Oystersteel","41 mm","300m","Iconic saturation diving chronometer instrument with ceramic Cerachrom unidirectional bezel.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-TAG-CA21,"Monaco Gulf Chronograph Calibre 11","TAG Heuer","Chronograph Watches",425000,450000,4,"Automatic","Fine-Brushed Steel","39 mm","100m","Square racing chronograph honoring the legendary Gulf motorsport livery and Steve McQueen.","https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"
AUR-BRT-NAV01,"Navitimer B01 Chronograph 43","Breitling","Chronograph Watches",620000,650000,2,"Automatic","Stainless Steel","43 mm","30m","Legendary aviation instrument featuring the circular slide rule and manufacture B01 movement.","https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80"`;

export default function BulkImportPage() {
  const router = useRouter();
  const [csvContent, setCsvContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [executionResult, setExecutionResult] = useState<any>(null);

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kshan_product_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvContent(evt.target?.result as string);
      setPreviewResult(null);
      setExecutionResult(null);
      setErrorMessage('');
      setSuccessMessage('');
    };
    reader.readAsText(file);
  };

  const handleProcessCsv = async (dryRunMode: boolean) => {
    if (!csvContent.trim()) {
      setErrorMessage('Please upload a file or paste CSV data first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setExecutionResult(null);

    try {
      const res = await fetch('/api/admin/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvContent, dryRun: dryRunMode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process CSV.');
      }

      if (dryRunMode) {
        setPreviewResult(data);
      } else {
        setExecutionResult(data);
        setSuccessMessage(data.message || `Successfully imported ${data.importedCount} products.`);
        setPreviewResult(null);
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing CSV.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian-800 pb-6">
        <div>
          <span className="text-xs uppercase tracking-luxury text-gold-400 font-cinzel font-semibold">
            Catalog Ingestion
          </span>
          <h1 className="text-2xl font-cinzel font-bold text-white mt-0.5">
            Bulk Product CSV Ingestion & Validation
          </h1>
        </div>

        <button
          onClick={handleDownloadSample}
          className="btn-outline-gold px-4 py-2 rounded text-xs font-semibold uppercase tracking-luxury flex items-center gap-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload & Editor Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* File drop area */}
          <div className="p-8 rounded-xl bg-obsidian-900/40 border border-dashed border-obsidian-700 text-center space-y-4 hover:border-gold-500/40 transition-colors">
            <FileSpreadsheet className="w-12 h-12 text-gold-400 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-sm font-cinzel font-bold text-white">Upload Catalog Spreadsheet (.csv)</h2>
              <p className="text-xs text-gray-400">Select standard comma-separated timepiece data file</p>
            </div>

            <label className="btn-outline-gold px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-luxury inline-block cursor-pointer">
              <span>Select File from Computer</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Raw Text Area */}
          <div className="p-6 rounded-xl bg-obsidian-900/40 border border-obsidian-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 font-medium block">Or Paste CSV Data Directly:</label>
              {csvContent && (
                <button
                  type="button"
                  onClick={() => {
                    setCsvContent('');
                    setPreviewResult(null);
                    setExecutionResult(null);
                  }}
                  className="text-[11px] text-gray-500 hover:text-red-400"
                >
                  Clear Editor
                </button>
              )}
            </div>
            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded p-3 text-white font-mono text-[11px] placeholder-gray-600 focus:border-gold-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => handleProcessCsv(true)}
              disabled={isLoading || !csvContent.trim()}
              className="btn-outline-gold px-6 py-3 rounded text-xs font-bold uppercase tracking-luxury flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              <span>Validate & Preview (Dry Run)</span>
            </button>

            <button
              onClick={() => handleProcessCsv(false)}
              disabled={isLoading || !csvContent.trim()}
              className="btn-gold px-6 py-3 rounded text-xs font-bold uppercase tracking-luxury flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              <span>Execute Ingestion & Save</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
              {executionResult?.createdBrands?.length > 0 && (
                <p className="text-[11px] text-gray-300">
                  <strong>New Brands Created:</strong> {executionResult.createdBrands.join(', ')}
                </p>
              )}
              {executionResult?.createdCategories?.length > 0 && (
                <p className="text-[11px] text-gray-300">
                  <strong>New Categories Created:</strong> {executionResult.createdCategories.join(', ')}
                </p>
              )}
              <p className="text-[10px] text-gray-400">Redirecting to Admin Product Catalog...</p>
            </div>
          )}
        </div>

        {/* Validation Preview Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-4 text-xs">
            <h2 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Admin Bulk Import Rules</span>
            </h2>
            <ul className="space-y-2 text-gray-300 text-[11px]">
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold">•</span>
                <span><strong>Brands:</strong> Auto-created if they don't exist yet (e.g. TAG Heuer, Rolex, Omega, Breitling, Casio, etc.).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold">•</span>
                <span><strong>Categories:</strong> Auto-created if they don't exist yet (e.g. Chronograph Watches, Luxury Watches, etc.).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold">•</span>
                <span><strong>Price & MRP:</strong> Required numeric integers without currency symbols or commas (e.g. <code className="text-gold-400">49999</code>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 font-bold">•</span>
                <span><strong>ImageUrl:</strong> Valid HTTPS direct image URL.</span>
              </li>
            </ul>
          </div>

          {previewResult && (
            <div className="p-6 rounded-xl bg-obsidian-900/60 border border-gold-500/30 space-y-5 text-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-obsidian-800 pb-3">
                <h3 className="font-cinzel font-bold text-white uppercase tracking-luxury">
                  Dry Run Validation Telemetry
                </h3>
                <span className="text-[11px] text-gray-400">
                  Total Rows: <strong className="text-white">{previewResult.totalRows}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded bg-obsidian-950 border border-emerald-500/30 text-emerald-400 text-center">
                  <span className="text-[9px] uppercase block text-gray-400">Valid</span>
                  <strong className="text-lg">{previewResult.validCount}</strong>
                </div>

                <div className="p-3 rounded bg-obsidian-950 border border-rose-500/30 text-rose-400 text-center">
                  <span className="text-[9px] uppercase block text-gray-400">Invalid</span>
                  <strong className="text-lg">{previewResult.invalidCount}</strong>
                </div>

                <div className="p-3 rounded bg-obsidian-950 border border-gold-500/30 text-gold-400 text-center">
                  <span className="text-[9px] uppercase block text-gray-400">New Brands</span>
                  <strong className="text-lg">{previewResult.newBrands?.length || 0}</strong>
                </div>

                <div className="p-3 rounded bg-obsidian-950 border border-blue-500/30 text-blue-400 text-center">
                  <span className="text-[9px] uppercase block text-gray-400">New Categories</span>
                  <strong className="text-lg">{previewResult.newCategories?.length || 0}</strong>
                </div>
              </div>

              {/* Auto-creation badges */}
              {(previewResult.newBrands?.length > 0 || previewResult.newCategories?.length > 0) && (
                <div className="p-3.5 rounded bg-gold-500/5 border border-gold-500/20 space-y-2 text-[11px]">
                  {previewResult.newBrands?.length > 0 && (
                    <div className="flex items-start gap-2 text-gold-300">
                      <Tag className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Brands to be created:</strong> {previewResult.newBrands.join(', ')}
                      </div>
                    </div>
                  )}
                  {previewResult.newCategories?.length > 0 && (
                    <div className="flex items-start gap-2 text-blue-300">
                      <Layers className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Categories to be created:</strong> {previewResult.newCategories.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Row Breakdown */}
              <div className="space-y-2 pt-2 border-t border-obsidian-800">
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-gold-400" />
                  <span>Row-by-Row Ingestion Analysis:</span>
                </span>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {previewResult.rows.map((row: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border text-[11px] space-y-1.5 ${
                        row.isValid
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-gray-300'
                          : 'bg-rose-950/20 border-rose-800/40 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-white">
                          Row {row.rowNumber}: {row.name || 'Unnamed Product'}
                        </strong>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                            row.isValid
                              ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                              : 'bg-rose-900/60 text-rose-300 border border-rose-700'
                          }`}
                        >
                          {row.isValid ? 'Valid' : 'Errors'}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>Brand: <strong className="text-gray-200">{row.brand || 'None'}</strong></span>
                        <span>Category: <strong className="text-gray-200">{row.category || 'None'}</strong></span>
                        <span>Price: <strong className="text-gold-400">{row.price ? `₹${row.price}` : 'Missing'}</strong></span>
                        <span>MRP: <strong className="text-gray-200">{row.mrp ? `₹${row.mrp}` : 'Missing'}</strong></span>
                      </div>

                      {/* Errors */}
                      {row.errors?.length > 0 && (
                        <ul className="list-disc pl-4 text-rose-400 space-y-0.5">
                          {row.errors.map((err: string, eIdx: number) => (
                            <li key={eIdx}>{err}</li>
                          ))}
                        </ul>
                      )}

                      {/* Auto creation notices */}
                      {row.notices?.length > 0 && (
                        <ul className="list-disc pl-4 text-gold-400/90 space-y-0.5">
                          {row.notices.map((note: string, nIdx: number) => (
                            <li key={nIdx}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
