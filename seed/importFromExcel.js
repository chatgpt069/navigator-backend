require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');
const Product = require('../models/Product');

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Placeholder images for polo shirts (Unsplash - verified working)
const placeholderImages = [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', // polo shirt
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800', // polo shirt
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800', // shirt
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800', // polo
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800', // shirt
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', // tshirt
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', // tshirt
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800', // polo
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800', // casual shirt
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800', // tshirt
];

// Default colors palette
const defaultColors = [
    { name: 'Black', hex: '#1a1a1a' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1B2A41' },
    { name: 'Olive', hex: '#556B2F' },
    { name: 'Charcoal', hex: '#36454F' },
];

// Category mapping from Excel to schema
const categoryMapping = {
    "Men's Polo T-Shirt": 'polo-shirts',
    "Men's Knit Polo Shirt": 'knit-polo-shirts',
    "Men's Knitted Polo T-Shirt": 'knit-polo-shirts',
    "Men's Polo T-Shirts": 'polo-shirts',
    "Zip Polo": 'zip-polo-shirts',
};

// Map category from Excel to schema
const mapCategory = (excelCategory) => {
    // Try exact match first
    if (categoryMapping[excelCategory]) {
        return categoryMapping[excelCategory];
    }
    // Try partial matching
    const lowerCat = excelCategory.toLowerCase();
    if (lowerCat.includes('knit')) return 'knit-polo-shirts';
    if (lowerCat.includes('zip')) return 'zip-polo-shirts';
    if (lowerCat.includes('polo')) return 'polo-shirts';
    if (lowerCat.includes('shirt')) return 'shirts';
    // Default
    return 'polo-shirts';
};

// Generate random price between min and max
const randomPrice = (min = 999, max = 2999) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Read Excel and import products
const importProducts = async () => {
    try {
        await connectDB();

        // Read Excel file
        const excelPath = path.join(__dirname, '../../Website_Product_Details .xlsx');
        console.log(`\n📂 Reading: ${excelPath}`);

        const workbook = xlsx.readFile(excelPath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`   Found ${data.length} products in Excel\n`);

        // Clear existing products
        console.log('🗑️  Clearing existing products...');
        await Product.deleteMany({});

        // Transform Excel data to Product schema
        const products = data.map((row, index) => {
            const title = row['Product Title'] || row.Title || `Product ${index + 1}`;
            const category = mapCategory(row.Category || '');
            const fit = row.Fit || '';
            const description = row['Short Description'] || row.Description || `Premium quality ${title}`;

            const price = randomPrice(1299, 2999);
            const originalPrice = Math.round(price * 1.4);

            return {
                name: title.trim(),
                description: description.trim(),
                price,
                originalPrice,
                category,
                images: [
                    placeholderImages[index % placeholderImages.length],
                    placeholderImages[(index + 1) % placeholderImages.length],
                ],
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: [], // No default colors - admin can add via panel
                stock: 50 + Math.floor(Math.random() * 50),
                featured: index < 4,
                isNew: index >= data.length - 3,
                rating: 4.2 + Math.random() * 0.6,
                numReviews: 10 + Math.floor(Math.random() * 50),
                tags: [category, fit.toLowerCase(), index < 4 ? 'bestseller' : null].filter(Boolean),
            };
        });

        // Insert products
        console.log('📦 Inserting products...\n');
        await Product.insertMany(products);

        // Summary
        console.log('╔════════════════════════════════════════════════╗');
        console.log('║                                                ║');
        console.log('║   ✅ Products imported successfully!          ║');
        console.log('║                                                ║');
        console.log(`║   Imported: ${products.length} products                         ║`);
        console.log('║                                                ║');
        console.log('║   Products:                                    ║');
        products.forEach((p, i) => {
            const name = p.name.substring(0, 35).padEnd(35);
            console.log(`║   ${i + 1}. ${name}   ║`);
        });
        console.log('║                                                ║');
        console.log('╚════════════════════════════════════════════════╝');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing products:', error);
        process.exit(1);
    }
};

importProducts();
