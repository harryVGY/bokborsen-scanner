import React, { useState } from 'react';
import isValidISBN from '../utils/isbnValidator';

const IsbnInput = ({ onSubmit }) => {
    const [isbn, setIsbn] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setIsbn(e.target.value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Remove any non-digit characters and 'X'
        const cleanedIsbn = isbn.replace(/[^0-9X]/gi, '');
        
        if (!isValidISBN(cleanedIsbn)) {
            setError('Ogiltigt ISBN-format. Ange ett giltigt ISBN-nummer.');
            return;
        }

        onSubmit(cleanedIsbn);
    };

    return (
        <div className="isbn-input">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={isbn}
                    onChange={handleInputChange}
                    placeholder="Ange ISBN-nummer"
                    aria-label="ISBN-nummer"
                />
                <button type="submit">Sök</button>
            </form>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default IsbnInput;