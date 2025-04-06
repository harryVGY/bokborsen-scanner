import React from 'react';

const BookDetails = ({ book }) => {
    if (!book) {
        return <div className="book-details">Ingen bokinformation tillgänglig.</div>;
    }

    return (
        <div className="book-details">
            <h2 className="book-title">{book.title}</h2>
            
            <div className="book-main-info">
                {book.coverImage && (
                    <div className="book-cover">
                        <img src={book.coverImage} alt={`${book.title} omslag`} />
                    </div>
                )}
                
                <div className="book-info">
                    <p><strong>Författare:</strong> {book.author}</p>
                    <p><strong>ISBN:</strong> {book.isbn}</p>
                    <p><strong>Pris:</strong> {book.price}</p>
                    
                    {book.condition && book.condition !== 'Information saknas' && (
                        <p><strong>Skick:</strong> {book.condition}</p>
                    )}
                    
                    {book.seller && book.seller !== 'Information saknas' && (
                        <p><strong>Säljare:</strong> {book.seller}</p>
                    )}
                    
                    {book.description && book.description !== 'Information saknas' && (
                        <div className="book-description">
                            <h3>Beskrivning</h3>
                            <p>{book.description}</p>
                        </div>
                    )}
                    
                    <div className="book-actions">
                        <a 
                            href={book.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-link"
                        >
                            Visa på Bokbörsen
                        </a>
                    </div>
                </div>
            </div>
            
            {book.alternatives && book.alternatives.length > 0 && (
                <div className="book-alternatives">
                    <h3>Andra alternativ</h3>
                    <div className="alternatives-list">
                        {book.alternatives.map((alt, index) => (
                            <div key={index} className="alternative-item">
                                <h4>{alt.title}</h4>
                                <p><strong>Författare:</strong> {alt.author}</p>
                                <p><strong>Pris:</strong> {alt.price}</p>
                                {alt.condition && alt.condition !== 'Information saknas' && (
                                    <p><strong>Skick:</strong> {alt.condition}</p>
                                )}
                                <a 
                                    href={alt.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="view-link small"
                                >
                                    Visa detaljer
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetails;