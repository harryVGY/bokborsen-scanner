import axios from 'axios';
import { load } from 'cheerio';

// We'll use a proxy to avoid CORS issues
const CORS_PROXY = 'https://corsproxy.io/?';
const BOKBORSEN_URL = 'https://www.bokborsen.se/';

// Helper function to log out the DOM structure
const logDomStructure = ($) => {
    console.log('--- DOM STRUCTURE ---');
    
    // Log the main container classes
    console.log('Main containers:');
    $('body > div').each((i, el) => {
        const classes = $(el).attr('class');
        console.log(`- Body > div[${i}]: class="${classes || 'none'}"`);
    });
    
    // Look for lists
    console.log('\nLists:');
    $('ul').each((i, el) => {
        const classes = $(el).attr('class');
        const items = $(el).find('li').length;
        console.log(`- ul[${i}]: class="${classes || 'none'}", items=${items}`);
    });
    
    // Look for book items with specific classes
    console.log('\nPossible book elements:');
    $('li, .book, [class*="book"]').each((i, el) => {
        if (i < 5) { // Limit to first 5
            const classes = $(el).attr('class');
            console.log(`- Element[${i}]: tag=${el.tagName}, class="${classes || 'none'}"`);
        }
    });
    
    // Find all list items
    const listItems = $('ul.list.list-books li');
    if (listItems.length > 0) {
        console.log(`\nFound ${listItems.length} list items inside ul.list.list-books`);
        
        // Log the first item's structure
        if (listItems.length > 0) {
            const firstItem = listItems.first();
            console.log('\nFirst book item structure:');
            console.log(firstItem.html().substring(0, 300) + '...');
            
            // Log important elements within the first item
            console.log('\nImportant elements in first item:');
            console.log('- Title:', firstItem.find('a.item-link').text().trim());
            console.log('- Price:', firstItem.find('.book-item__price').text().trim());
            console.log('- Author:', firstItem.find('.book-item__author').text().trim());
        }
    } else {
        console.log('\nNo items found in ul.list.list-books');
    }
    
    console.log('--- END DOM STRUCTURE ---');
};

export const fetchBookData = async (isbn) => {
    try {
        // Use the CORS proxy to make the request
        const response = await axios.get(`${CORS_PROXY}${BOKBORSEN_URL}?q=${isbn}`);
        
        // Log the DOM structure to help debug
        const $ = load(response.data);
        logDomStructure($);
        
        const data = parseBookData(response.data, isbn);
        return data;
    } catch (error) {
        console.error('Error fetching book data:', error);
        throw error;
    }
};

// In the parseBookData function, update it to try multiple selector patterns

const parseBookData = (html, isbn) => {
    const $ = load(html);
    const bookDetails = {
        isbn: isbn,
        title: 'Information saknas',
        author: 'Information saknas',
        price: 'Information saknas',
        description: 'Information saknas',
        coverImage: '',
        url: `${BOKBORSEN_URL}?q=${isbn}`,
        condition: 'Information saknas',
        seller: 'Information saknas',
        alternatives: []
    };

    // --- First attempt: Using list.list-books selector ---
    const bookList = $('.list.list-books');
    const bookItems = bookList.find('li');
    
    if (bookList.length > 0 && bookItems.length > 0) {
        console.log(`Found ${bookItems.length} items in .list.list-books`);
        
        // Process first book
        const firstBook = bookItems.eq(0);
        
        // Try to find title and URL from item-link
        const titleElem = firstBook.find('a.item-link');
        if (titleElem.length > 0) {
            bookDetails.title = titleElem.text().trim();
            
            const href = titleElem.attr('href');
            if (href) {
                bookDetails.url = href.startsWith('http') ? href : `${BOKBORSEN_URL.replace(/\/$/, '')}${href}`;
            }
        }
        
        // Try alternative title selectors
        if (bookDetails.title === 'Information saknas') {
            const altTitleElem = firstBook.find('.title, h3, .bookTitle');
            if (altTitleElem.length > 0) {
                bookDetails.title = altTitleElem.text().trim();
            }
        }
        
        // Match known Bokbörsen classes and also try general class patterns
        const selectors = {
            author: ['.book-item__author', '.author', '.bookAuthor'],
            price: ['.book-item__price', '.price', '.bookPrice', ':contains("kr")'],
            condition: ['.book-item__condition', '.condition', '.bookCondition'],
            seller: ['.book-item__seller', '.seller', '.bookSeller'],
            description: ['.book-item__description', '.description', '.bookDescription']
        };
        
        // Try each selector for each field
        Object.entries(selectors).forEach(([field, selectorList]) => {
            for (const selector of selectorList) {
                const element = firstBook.find(selector);
                if (element.length > 0) {
                    const text = element.text().trim();
                    if (text) {
                        bookDetails[field] = text;
                        break;
                    }
                }
            }
        });
        
        // Look for image
        const imgElement = firstBook.find('img');
        if (imgElement.length > 0) {
            bookDetails.coverImage = imgElement.attr('src') || imgElement.attr('data-src') || '';
            
            // Ensure the image URL is absolute
            if (bookDetails.coverImage && !bookDetails.coverImage.startsWith('http')) {
                bookDetails.coverImage = BOKBORSEN_URL.replace(/\/$/, '') + bookDetails.coverImage;
            }
        }
        
        // Get alternatives (only if we found the main book)
        if (bookDetails.title !== 'Information saknas' && bookItems.length > 1) {
            bookItems.slice(1, 4).each((i, elem) => {
                const altBookElem = $(elem);
                const altBook = {
                    title: 'Information saknas',
                    author: 'Information saknas',
                    price: 'Information saknas',
                    condition: 'Information saknas',
                    url: ''
                };
                
                // Try to find title and URL
                const altTitleElem = altBookElem.find('a.item-link, .title, h3, .bookTitle');
                if (altTitleElem.length > 0) {
                    altBook.title = altTitleElem.text().trim();
                    
                    const href = altTitleElem.attr('href');
                    if (href) {
                        altBook.url = href.startsWith('http') ? href : `${BOKBORSEN_URL.replace(/\/$/, '')}${href}`;
                    }
                }
                
                // Try to find other fields
                Object.entries(selectors).forEach(([field, selectorList]) => {
                    for (const selector of selectorList) {
                        const element = altBookElem.find(selector);
                        if (element.length > 0) {
                            const text = element.text().trim();
                            if (text && field !== 'description') { // Skip description for alternatives
                                altBook[field] = text;
                                break;
                            }
                        }
                    }
                });
                
                // Only add if we found a title
                if (altBook.title !== 'Information saknas') {
                    bookDetails.alternatives.push(altBook);
                }
            });
        }
    } else {
        console.log("No book list found with .list.list-books selector");
    }
    
    // --- Second attempt: If we still don't have data, try more general selectors ---
    if (bookDetails.title === 'Information saknas') {
        console.log("Trying more general selectors...");
        
        // Look for any book-like containers
        const bookContainers = $('.book, .book-item, .search-result, article, .product');
        
        if (bookContainers.length > 0) {
            const container = bookContainers.first();
            
            // Try to find title
            const titleElem = container.find('h1, h2, h3, .title');
            if (titleElem.length > 0) {
                bookDetails.title = titleElem.text().trim();
            }
            
            // Try to find other data
            const authorElem = container.find('.author, [itemprop="author"]');
            if (authorElem.length > 0) {
                bookDetails.author = authorElem.text().trim();
            }
            
            const priceElem = container.find('.price, [itemprop="price"]');
            if (priceElem.length > 0) {
                bookDetails.price = priceElem.text().trim();
            }
            
            // Try to find image
            const imgElem = container.find('img');
            if (imgElem.length > 0) {
                bookDetails.coverImage = imgElem.attr('src') || '';
                if (bookDetails.coverImage && !bookDetails.coverImage.startsWith('http')) {
                    bookDetails.coverImage = BOKBORSEN_URL.replace(/\/$/, '') + bookDetails.coverImage;
                }
            }
            
            // Try to find link
            const linkElem = container.find('a');
            if (linkElem.length > 0) {
                const href = linkElem.attr('href');
                if (href) {
                    bookDetails.url = href.startsWith('http') ? href : `${BOKBORSEN_URL.replace(/\/$/, '')}${href}`;
                }
            }
        }
    }
    
    // --- Third attempt: Absolute fallback - just grab ANY data ---
    if (bookDetails.title === 'Information saknas') {
        console.log("Using absolute fallback selectors");
        
        // Just find any headers that might be titles
        const anyHeader = $('h1, h2, h3').first();
        if (anyHeader.length > 0) {
            bookDetails.title = anyHeader.text().trim();
        }
        
        // Find any elements that might contain "kr" for price
        $('*:contains("kr")').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('kr') && text.length < 50 && bookDetails.price === 'Information saknas') {
                bookDetails.price = text;
            }
        });
    }
    
    return bookDetails;
};