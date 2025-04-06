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
        
        console.log("Attempting to start scanner...");

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerRef.current,
                constraints: {
                    facingMode: "environment", // Use back camera
                    width: { min: 640 },
                    height: { min: 480 },
                    aspectRatio: { min: 1, max: 2 }
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: navigator.hardwareConcurrency || 4,
            frequency: 10,
            decoder: {
                readers: [
                    "ean_reader",
                    "ean_8_reader",
                    "isbn_reader",
                    "code_39_reader",
                    "code_128_reader"
                ],
                debug: {
                    showCanvas: true,
                    showPatches: true,
                    showFoundPatches: true
                }
            }
        }, (err) => {
            if (err) {
                console.error('Scanner initialization error:', err);
                setError('Kunde inte starta kameran. Kontrollera att du har gett kamerabehörighet.');
                setScanning(false);
                return;
            }
            
            console.log("Scanner initialized successfully");
            Quagga.start();
            
            // Listen for scan results
            Quagga.onProcessed(function(result) {
                console.log("Frame processed");
            });
            
            Quagga.onDetected((result) => {
                console.log("Barcode detected:", result.codeResult.code);
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