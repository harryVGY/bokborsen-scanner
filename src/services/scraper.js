import axios from 'axios';
import { load } from 'cheerio';

const BASE_URL = 'https://www.bokborsen.se/';

export async function scrapeBookDetails(isbn) {
    try {
        const response = await axios.get(`${BASE_URL}search?isbn=${isbn}`);
        const $ = load(response.data);

        const bookDetails = {
            title: $('h1.book-title').text().trim() || 'Information saknas',
            author: $('a.book-author').text().trim() || 'Information saknas',
            price: $('span.book-price').text().trim() || 'Information saknas',
            description: $('div.book-description').text().trim() || 'Information saknas',
            imageUrl: $('img.book-cover').attr('src') || '',
            isbn: isbn,
            url: `${BASE_URL}search?isbn=${isbn}`
        };

        return bookDetails;
    } catch (error) {
        console.error('Error scraping book details:', error);
        throw new Error('Could not retrieve book details');
    }
}