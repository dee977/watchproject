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
} from 'lucide-react';

const sampleCsv = `SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl
AUR-ROLEX-SUB01,"Oyster Perpetual Submariner Date","Omega","Diver Watches",850000,900000,3,"Automatic","Oystersteel","41 mm","300m","Iconic saturation diving chronometer instrument with ceramic Cerachrom unidirectional bezel.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
AUR-TAG-CA21,"Monaco Gulf Chronograph Calibre 11","Tissot","Chronograph Watches",425000,450000,4,"Automatic","Fine-Brushed Steel","39 mm","100m","Square racing chronograph honoring the legendary Gulf motorsport livery and Steve McQueen.","https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80"`;

export default function BulkImportPage() {
  const router = useRouter();
  const [csvContent, setCsvContent] = useState('');
  const [isDryRun, setIsDryRun] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aurelia_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvContent(evt.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleProcessCsv = async (dryRunMode: boolean) => {
    if (!csvContent.trim()) {
      setErrorMessage('Please upload or paste CSV data first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

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
        setSuccessMessage(data.message);
        setPreviewResult(null);
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 1500);
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
            <label className="text-gray-400 font-medium block">Or Paste CSV Data Directly:</label>
            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="SKU,Name,Brand,Category,Price,MRP,Stock,Movement,CaseMaterial,CaseDiameter,WaterResistance,Description,ImageUrl"
              className="w-full bg-obsidian-950 border border-obsidian-800 rounded p-3 text-white font-mono text-[11px] placeholder-gray-600 focus:border-gold-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
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
            <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Validation Preview Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl bg-obsidian-900/60 border border-obsidian-800 space-y-4 text-xs">
            <h2 className="font-cinzel text-xs uppercase tracking-luxury text-gold-400 font-semibold">
              Schema Specifications & Requirements
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
              <li><strong>Brand:</strong> Must match an existing brand in the vault (e.g. Omega, Cartier, Longines, Tissot, Seiko, Casio, Grand Seiko).</li>
              <li><strong>Category:</strong> Must match an existing category (e.g. Diver Watches, Chronograph, Automatic, Dress, Haute Horlogerie).</li>
              <li><strong>Price & MRP:</strong> Numerical integer values without commas or currency symbols.</li>
              <li><strong>ImageUrl:</strong> Valid HTTPS image URL.</li>
            </ul>
          </div>

          {previewResult && (
            <div className="p-6 rounded-xl bg-obsidian-900/60 border border-gold-500/30 space-y-4 text-xs animate-fadeIn">
              <h3 className="font-cinzel font-bold text-white uppercase tracking-luxury">
                Dry Run Telemetry
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded bg-obsidian-950 border border-emerald-500/30 text-emerald-400">
                  <span className="text-[10px] uppercase block text-gray-400">Valid Rows</span>
                  <strong className="text-lg">{previewResult.validCount}</strong>
                </div>

                <div className="p-3 rounded bg-obsidian-950 border border-rose-500/30 text-rose-400">
                  <span className="text-[10px] uppercase block text-gray-400">Rejected Rows</span>
                  <strong className="text-lg">{previewResult.errorCount}</strong>
                </div>
              </div>

              {previewResult.errorRows.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-obsidian-800">
                  <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Errors Detected:</span>
                  </span>
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {previewResult.errorRows.map((err: any, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-obsidian-950 border border-obsidian-800 text-[11px] text-gray-400">
                        <strong>Row {err.rowNumber}:</strong> {err.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
