import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ScanLine, X } from 'lucide-react';

const QRScanner = ({ onScanSuccess, onScanFailure }) => {
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let html5QrcodeScanner;

        if (isScanning) {
            // Configuration for the QR Scanner
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );

            html5QrcodeScanner.render(
                (decodedText, decodedResult) => {
                    setIsScanning(false);
                    html5QrcodeScanner.clear();
                    if (onScanSuccess) onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    if (onScanFailure) onScanFailure(errorMessage);
                }
            );
        }

        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [isScanning, onScanSuccess, onScanFailure]);

    return (
        <div className="w-full flex flex-col items-center">
            {!isScanning ? (
                <button
                    onClick={() => setIsScanning(true)}
                    className="glass-button w-full py-12 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-blue-400/50"
                >
                    <div className="p-4 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors relative overflow-hidden">
                        <ScanLine className="w-10 h-10 text-blue-400" />
                        <div className="absolute inset-0 bg-blue-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                    </div>
                    <span className="text-lg font-medium text-white/90">Click to Scan QR Code</span>
                    <p className="text-sm text-white/50">Ensure adequate lighting</p>
                </button>
            ) : (
                <div className="w-full max-w-sm relative glass-panel rounded-2xl p-4 flex flex-col items-center">
                    <div className="w-full flex justify-end mb-2">
                        <button
                            onClick={() => setIsScanning(false)}
                            className="p-2 glass-button rounded-full text-white/70 hover:text-red-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scanner Container */}
                    <div className="w-full rounded-xl overflow-hidden border-2 border-blue-500/30 relative">
                        <div id="qr-reader" className="w-full bg-black/50"></div>
                        {/* Animated scanning line overlay */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col">
                            <div className="w-full h-1 bg-blue-400/80 shadow-[0_0_15px_3px_rgba(59,130,246,0.6)] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-white/70 animate-pulse text-center">
                        Position the QR code within the frame...
                    </p>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(250px); }
          100% { transform: translateY(0); }
        }
        /* Override html5-qrcode default styling to match dark theme */
        #qr-reader { border: none !important; }
        #qr-reader-results { display: none; }
        #qr-reader__scan_region { background: transparent; }
        #qr-reader__dashboard_section_csr button {
          background: rgba(255,255,255,0.1);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        #qr-reader__dashboard_section_swaplink { color: #60a5fa !important; text-decoration: none; }
      `}} />
        </div>
    );
};

export default QRScanner;
