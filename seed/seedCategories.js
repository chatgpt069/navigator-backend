require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const defaultCategories = [
    { name: 'Polo Shirts', slug: 'polo-shirts', description: 'Classic polo shirts' },
    { name: 'Knit Polo Shirts', slug: 'knit-polo-shirts', description: 'Premium knit polo shirts' },
    { name: 'Zip Polo Shirts', slug: 'zip-polo-shirts', description: 'Modern zip polo shirts' },
];

const seedCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ MongoDB Connected');

        for (const cat of defaultCategories) {
            const exists = await Category.findOne({ slug: cat.slug });
            if (!exists) {
                await Category.create(cat);
                console.log(`  ✓ Created category: ${cat.name}`);
            } else {
                console.log(`  - Category exists: ${cat.name}`);
            }
        }

        console.log('\n✅ Categories seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedCategories();
