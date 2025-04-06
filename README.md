# Bokbörsen Scanner

## Overview
Bokbörsen Scanner is a mobile web application that allows users to scan ISBN barcodes or manually input ISBN numbers to retrieve book information from Bokbörsen. The application utilizes the device's camera for barcode scanning and displays relevant book details such as title, author, and price in an appealing format.

## Features
- **Barcode Scanning**: Use your mobile camera to scan ISBN barcodes.
- **Manual Input**: Enter ISBN numbers manually for search.
- **Data Retrieval**: Fetch book details from Bokbörsen's database.
- **User-Friendly Interface**: Display book information in a clean and organized manner.
- **Loading Indicator**: Show a loading spinner while data is being fetched.

## Project Structure
```
bokborsen-scanner
├── src
│   ├── assets
│   │   └── styles
│   │       └── main.css
│   ├── components
│   │   ├── BarcodeScanner.js
│   │   ├── BookDetails.js
│   │   ├── IsbnInput.js
│   │   └── LoadingIndicator.js
│   ├── services
│   │   ├── api.js
│   │   └── scraper.js
│   ├── utils
│   │   └── isbnValidator.js
│   ├── App.js
│   └── index.js
├── public
│   ├── index.html
│   └── manifest.json
├── package.json
├── .gitignore
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd bokborsen-scanner
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your mobile browser and navigate to the application URL.
3. Use the barcode scanner or manually input an ISBN number to search for book details.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any suggestions or improvements.

## License
This project is licensed under the MIT License. See the LICENSE file for details.