function isValidISBN(isbn) {
    // Remove any non-digit characters
    isbn = isbn.replace(/[^0-9X]/gi, '');

    // Check length for ISBN-10 and ISBN-13
    if (isbn.length === 10) {
        return validateISBN10(isbn);
    } else if (isbn.length === 13) {
        return validateISBN13(isbn);
    }
    return false;
}

function validateISBN10(isbn) {
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += (isbn[i] === 'X' ? 10 : parseInt(isbn[i], 10)) * (10 - i);
    }
    return sum % 11 === 0;
}

function validateISBN13(isbn) {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(isbn[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    return sum % 10 === 0;
}

export default isValidISBN;