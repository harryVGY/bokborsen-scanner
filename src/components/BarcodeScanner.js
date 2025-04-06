import React, { useState, useEffect } from 'react';
// Quagga is more reliable than BarcodeDetector which has limited browser support
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ onScan }) => {
    const [error, setError] = useState(null);
    const [scanning, setScanning] = useState(false);
    const scannerRef = React.useRef(null);

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = () => {
        if (scanning) return;

        setError(null);
        setScanning(true);

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerRef.current,
                constraints: {
                    facingMode: "environment", // Use back camera
                }
            },
            decoder: {
                readers: [
                    "ean_reader",
                    "ean_8_reader",
                    "code_39_reader",
                    "code_128_reader"
                ]
            }
        }, (err) => {
            if (err) {
                console.error('Scanner initialization error:', err);
                setError('Kunde inte starta kameran. Kontrollera att du har gett kamerabehörighet.');
                setScanning(false);
                return;
            }
            
            Quagga.start();
            
            // Listen for scan results
            Quagga.onDetected((result) => {
                if (result && result.codeResult) {
                    const isbn = result.codeResult.code;
                    if (isbn) {
                        stopScanner();
                        onScan(isbn);
                    }
                }
            });
        });
    };

    const stopScanner = () => {
        if (Quagga) {
            Quagga.stop();
        }
        setScanning(false);
    };

    return (
        <div className="barcode-scanner">
            {error && <p className="scanner-error">{error}</p>}
            <div className="video-container" ref={scannerRef}>
                <div className="scanner-overlay">
                    <div className="scanner-target"></div>
                </div>
            </div>
            <p className="scanner-instruction">
                Centrera streckkoden i rutan
            </p>
        </div>
    );
};

export default BarcodeScanner;