import React, { useState } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import IsbnInput from './components/IsbnInput';
import BookDetails from './components/BookDetails';
import LoadingIndicator from './components/LoadingIndicator';
import { fetchBookData } from './services/api';
import './assets/styles/main.css';

const App = () => {
    const [isbn, setIsbn] = useState('');
    const [bookDetails, setBookDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const [debug, setDebug] = useState(false);

    const handleIsbnSubmit = async (isbn) => {
        setLoading(true);
        setError(null);
        setBookDetails(null);
        setIsbn(isbn);

        try {
            const details = await fetchBookData(isbn);
            setBookDetails(details);
            console.log("Retrieved book details:", details);
        } catch (err) {
            setError('Kunde inte hitta bokinformation. Försök igen.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleScanner = () => {
        setShowScanner(!showScanner);
    };

    const toggleDebug = () => {
        setDebug(!debug);
    };

    // Test function with a known ISBN
    const testWithFixedISBN = () => {
        handleIsbnSubmit('9789176910528');
    };

    return (
        <div className="container">
            <h1>Bokbörsen Scanner</h1>
            
            <div className="controls">
                <button 
                    className={`scanner-toggle ${showScanner ? 'active' : ''}`} 
                    onClick={toggleScanner}
                >
                    {showScanner ? 'Stäng Scanner' : 'Öppna Kamera'}
                </button>
                
                <button 
                    className="debug-toggle" 
                    onClick={toggleDebug}
                    style={{marginLeft: '10px', backgroundColor: debug ? '#d62828' : '#666'}}
                >
                    {debug ? 'Stäng Debug' : 'Debug Läge'}
                </button>
                
                {debug && (
                    <button 
                        onClick={testWithFixedISBN}
                        style={{marginLeft: '10px', backgroundColor: '#3c6e71'}}
                    >
                        Testa med ISBN
                    </button>
                )}
            </div>
            
            {showScanner && <BarcodeScanner onScan={handleIsbnSubmit} />}
            
            <IsbnInput onSubmit={handleIsbnSubmit} />
            
            {loading && <LoadingIndicator />}
            {error && <p className="error">{error}</p>}
            
            {bookDetails && (
                <>
                    <BookDetails book={bookDetails} />
                    {bookDetails.title === 'Information saknas' && bookDetails.alternatives && bookDetails.alternatives.length > 0 && (
                        <div className="alternatives-notice">
                            <p>Kunde inte hitta exakt matchning, men hittade liknande böcker.</p>
                        </div>
                    )}
                    
                    {debug && (
                        <div className="debug-info">
                            <h3>Debug Information:</h3>
                            <pre>{JSON.stringify(bookDetails, null, 2)}</pre>
                        </div>
                    )}
                </>
            )}

            {isbn && !loading && !bookDetails && !error && (
                <p>Inga resultat hittades för ISBN: {isbn}</p>
            )}
        </div>
    );
};

export default App;