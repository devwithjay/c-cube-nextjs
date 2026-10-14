import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateTemplate from './CertificateTemplate';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function CertificateDownloadModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [prn, setPrn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [certData, setCertData] = useState<{ participantName: string, prn: string, submittedAt: string } | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setPrn('');
    setCertData(null);
    setError('');
    onClose();
  };

  const checkEligibility = async () => {
    if (!prn) {
      setError('Please enter a valid PRN.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/3q/certificate-check/${encodeURIComponent(prn)}`);
      const data = await response.json();
      if (data.success && data.data.eligible) {
        setCertData(data.data);
      } else {
        setError(data.message || 'PRN not found or test not submitted.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!certRef.current) return;
    setLoading(true);
    try {
      // Cinzel / Great Vibes must be loaded before rasterising, or the PDF falls back to system fonts.
      await document.fonts.ready;
      const canvas = await html2canvas(certRef.current, { scale: 2, useCORS: true, backgroundColor: null });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1122, 793]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 1122, 793);
      pdf.save(`CCube_Certificate_${certData?.participantName.replace(/\s+/g, '_')}.pdf`);
      handleClose();
    } catch (err) {
      setError('Failed to generate PDF. Make sure you are on a modern browser.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">Download Certificate</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your PRN to check your eligibility and download your certificate.
          </DialogDescription>
        </DialogHeader>
        {!certData ? (
          <div className="flex flex-col gap-4 py-4">
            <input
              type="text"
              placeholder="Enter your PRN (e.g. 12345678)"
              value={prn}
              onChange={(e) => setPrn(e.target.value)}
              className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-muted/50 text-foreground"
            />
            {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            <button
              onClick={checkEligibility}
              disabled={loading}
              className="bg-foreground text-background px-4 py-3 rounded-lg font-bold hover:bg-foreground/90 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? 'Checking...' : 'Check Eligibility'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 py-4 items-center">
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-4 py-2 rounded-full font-bold">
              Eligibility Confirmed!
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Participant</p>
              <p className="text-2xl font-bold text-foreground">{certData.participantName}</p>
            </div>
            <button
              onClick={downloadPDF}
              disabled={loading}
              className="bg-foreground text-background px-6 py-3 rounded-lg font-bold hover:bg-foreground/90 disabled:opacity-50 w-full transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? 'Generating PDF...' : 'Download Certificate PDF'}
            </button>
          </div>
        )}
      </DialogContent>

      {/* Hidden Certificate for Rendering */}
      {certData && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -1 }}>
          <CertificateTemplate ref={certRef} {...certData} />
        </div>
      )}
    </Dialog>
  );
}
