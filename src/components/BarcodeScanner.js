import React, { useState, useEffect, useRef } from 'react';
// Quagga is more reliable than BarcodeDetector which has limited browser support
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ onScan }) => {
    const [error, setError] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const scannerRef = useRef(null);
    const resultsBuffer = useRef([]);

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, []);

    // Validate ISBN format - basic check
    const isValidISBN = (isbn) => {
        // Remove dashes and spaces
        isbn = isbn.replace(/[-\s]/g, '');
        
        // Check if it's ISBN-10 or ISBN-13
        return (
            /^97(8|9)\d{10}$/.test(isbn) || // ISBN-13
            /^\d{9}[\dX]$/.test(isbn)       // ISBN-10
        );
    };

    const startScanner = () => {
        if (scanning) return;

        setError(null);
        setScanning(true);
        resultsBuffer.current = [];
        
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
                },
                area: { // Define a more restricted scanning area
                    top: "25%",
                    right: "10%",
                    left: "10%",
                    bottom: "25%"
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: navigator.hardwareConcurrency || 2,
            frequency: 15,
            decoder: {
                readers: [
                    "ean_reader", // Most books use EAN-13 (ISBN-13)
                    "ean_8_reader",
                    "upc_reader",  // UPC is used for some books
                    "upc_e_reader",
                ],
                multiple: false
            },
            locate: true
        }, (err) => {
            if (err) {
                console.error('Scanner initialization error:', err);
                setError('Kunde inte starta kameran. Kontrollera att du har gett kamerabehörighet.');
                setScanning(false);
                return;
            }
            
            console.log("Scanner initialized successfully");
            Quagga.start();
            
            // Process frames
            Quagga.onProcessed((result) => {
                const drawingCanvas = document.querySelector('canvas.drawingBuffer');
                if (drawingCanvas && result) {
                    // Visual feedback during scanning process
                    if (result.boxes) {
                        const ctx = drawingCanvas.getContext('2d');
                        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                        result.boxes.filter(box => box !== result.box).forEach(box => {
                            ctx.strokeStyle = 'green';
                            ctx.lineWidth = 2;
                            ctx.strokeRect(box[0], box[1], box[2]-box[0], box[3]-box[1]);
                        });
                    }

                    if (result.box) {
                        const ctx = drawingCanvas.getContext('2d');
                        ctx.strokeStyle = 'red';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(
                            result.box.x, result.box.y, 
                            result.box.width, result.box.height
                        );
                    }
                }
            });
            
            // Handle successful detection with confidence tracking
            Quagga.onDetected((result) => {
                if (result && result.codeResult) {
                    const code = result.codeResult.code;
                    const format = result.codeResult.format;
                    console.log(`Barcode detected: ${code} (${format}), confidence: ${result.codeResult.confidence}`);
                    
                    // Only process codes that look like ISBNs
                    if (code && (format === 'ean_13' || format === 'upc_a' || isValidISBN(code))) {
                        // Add to results buffer for confidence tracking
                        resultsBuffer.current.push(code);
                        
                        // If we have multiple consistent readings or a high-confidence reading
                        if (result.codeResult.confidence > 0.8 || 
                            (resultsBuffer.current.length >= 3 && 
                             resultsBuffer.current.filter(c => c === code).length >= 2)) {
                            
                            // Clean and validate the code
                            const isbn = code.trim();
                            
                            // Avoid duplicates
                            if (isbn !== lastResult) {
                                setLastResult(isbn);
                                stopScanner();
                                console.log('Valid ISBN detected:', isbn);
                                onScan(isbn);
                            }
                        }
                    }
                }
            });
        });
    };

    const stopScanner = () => {
        if (Quagga) {
            try {
                Quagga.stop();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
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