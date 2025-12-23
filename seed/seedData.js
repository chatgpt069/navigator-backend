require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Helper function to generate stock by size
const generateStockBySize = (sizes) => {
  const stockBySize = {};
  sizes.forEach(size => {
    stockBySize[size] = 3 + Math.floor(Math.random() * 15); // 3-17 units per size
  });
  return stockBySize;
};

// Helper to calculate total stock from stockBySize
const getTotalStock = (stockBySize) => {
  return Object.values(stockBySize).reduce((sum, qty) => sum + qty, 0);
};

// Sample Users
const users = [
  {
    name: 'Admin User',
    email: 'admin@navigator.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 9876543210',
    address: {
      street: '123 Navigator Store',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  {
    name: 'Test User',
    email: 'user@test.com',
    password: 'user123',
    role: 'user',
    phone: '+91 9876543211',
    address: {
      street: '456 Style Avenue',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    }
  }
];

// Color palette for Navigator (earthy tones)
const colors = {
  charcoal: { name: 'Charcoal', hex: '#36454F' },
  black: { name: 'Black', hex: '#1a1a1a' },
  offWhite: { name: 'Off White', hex: '#FAF9F6' },
  cream: { name: 'Cream', hex: '#F5F5DC' },
  olive: { name: 'Olive', hex: '#556B2F' },
  armyGreen: { name: 'Army Green', hex: '#4B5320' },
  tan: { name: 'Tan', hex: '#D2B48C' },
  camel: { name: 'Camel', hex: '#C19A6B' },
  navy: { name: 'Navy', hex: '#1B2A41' },
  burgundy: { name: 'Burgundy', hex: '#722F37' },
  rust: { name: 'Rust', hex: '#B7410E' },
  terracotta: { name: 'Terracotta', hex: '#C65D3B' },
  stone: { name: 'Stone', hex: '#928E85' },
  slate: { name: 'Slate', hex: '#708090' },
  forest: { name: 'Forest', hex: '#228B22' },
  sand: { name: 'Sand', hex: '#C2B280' },
  mushroom: { name: 'Mushroom', hex: '#9F8170' },
  espresso: { name: 'Espresso', hex: '#3C2415' },
  denim: { name: 'Denim Blue', hex: '#1560BD' },
  indigo: { name: 'Indigo', hex: '#3F5D9D' },
  washedBlack: { name: 'Washed Black', hex: '#3D3D3D' },
  lightWash: { name: 'Light Wash', hex: '#A4C4E8' },
  midWash: { name: 'Mid Wash', hex: '#6B8EAD' },
};

// Image URLs organized by category
const images = {
  tshirts: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
  ],
  shirts: [
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800',
    'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800',
    'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800',
  ],
  sweatshirts: [
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
    'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    'https://images.unsplash.com/photo-1609873814058-a8928924184a?w=800',
  ],
  jeans: [
    'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800',
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800',
  ],
  trousers: [
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
  ],
  jackets: [
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800',
  ],
};

// Generate products
const generateProducts = () => {
  const products = [];
  
  // ==================== T-SHIRTS (~30 products) ====================
  const tshirtStyles = [
    { name: 'Classic Crew Neck', desc: 'Timeless crew neck t-shirt in premium cotton. Relaxed fit with reinforced stitching for durability.' },
    { name: 'Oversized Drop Shoulder', desc: 'Contemporary oversized silhouette with dropped shoulders. Made from heavyweight cotton for a premium feel.' },
    { name: 'Slim Fit Essential', desc: 'Modern slim fit t-shirt that hugs the body without being too tight. Perfect for layering.' },
    { name: 'Vintage Washed', desc: 'Pre-washed for a lived-in look and feel. Soft, broken-in comfort from day one.' },
    { name: 'Pocket Detail', desc: 'Classic t-shirt with a practical chest pocket. Clean lines and premium construction.' },
    { name: 'Henley Neck', desc: 'Casual henley with button placket. A refined alternative to the standard tee.' },
    { name: 'Striped Classic', desc: 'Nautical-inspired striped t-shirt in soft cotton jersey. Timeless pattern that never goes out of style.' },
    { name: 'Raw Edge', desc: 'Modern t-shirt with raw cut edges for an edgy, contemporary look.' },
    { name: 'Long Sleeve Essential', desc: 'Versatile long sleeve t-shirt for layering or standalone wear. Premium cotton construction.' },
    { name: 'Boxy Fit', desc: 'Relaxed boxy silhouette for a modern, street-inspired look. Dropped hem for extra coverage.' },
  ];
  
  const tshirtColors = [colors.charcoal, colors.offWhite, colors.olive, colors.navy, colors.stone, colors.terracotta];
  
  tshirtStyles.forEach((style, index) => {
    const basePrice = [1299, 1499, 1699, 1899, 1599][index % 5];
    const colorOptions = tshirtColors.slice(0, 3 + (index % 3));
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const stockBySize = generateStockBySize(sizes);
    
    products.push({
      name: `${style.name} Tee`,
      description: style.desc,
      price: basePrice,
      originalPrice: Math.round(basePrice * 1.4),
      category: 't-shirts',
      images: [images.tshirts[index % images.tshirts.length], images.tshirts[(index + 1) % images.tshirts.length]],
      sizes,
      colors: colorOptions,
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 4,
      isNew: index >= 7,
      rating: 4.2 + Math.random() * 0.6,
      numReviews: 30 + Math.floor(Math.random() * 100),
      tags: ['t-shirt', 'cotton', 'casual', 'essentials', index < 4 ? 'bestseller' : 'new-arrivals'].filter(Boolean),
    });
  });
  
  // Additional t-shirt variations
  const additionalTshirts = [
    { name: 'Earth Tone Essential Tee', colors: [colors.mushroom, colors.sand, colors.olive] },
    { name: 'Textured Cotton Tee', colors: [colors.cream, colors.charcoal, colors.navy] },
    { name: 'Relaxed Summer Tee', colors: [colors.offWhite, colors.terracotta, colors.stone] },
    { name: 'Heavyweight Blank Tee', colors: [colors.black, colors.offWhite, colors.olive] },
    { name: 'Washed Cotton Tee', colors: [colors.slate, colors.sand, colors.burgundy] },
    { name: 'Soft Touch Basic Tee', colors: [colors.charcoal, colors.cream, colors.navy] },
    { name: 'Explorer Crew Tee', colors: [colors.armyGreen, colors.tan, colors.stone] },
    { name: 'Weekend Essential Tee', colors: [colors.black, colors.offWhite, colors.olive, colors.navy] },
    { name: 'Minimal Logo Tee', colors: [colors.charcoal, colors.cream, colors.terracotta] },
    { name: 'Premium Pima Cotton Tee', colors: [colors.offWhite, colors.black, colors.navy, colors.olive] },
  ];
  
  additionalTshirts.forEach((tee, index) => {
    const sizes = ['S', 'M', 'L', 'XL'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: tee.name,
      description: 'Premium quality t-shirt crafted from soft cotton for everyday comfort. Clean design with attention to detail.',
      price: 1399 + (index * 100),
      originalPrice: Math.round((1399 + (index * 100)) * 1.35),
      category: 't-shirts',
      images: [images.tshirts[index % images.tshirts.length], images.tshirts[(index + 2) % images.tshirts.length]],
      sizes,
      colors: tee.colors,
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 2,
      isNew: index > 6,
      rating: 4.3 + Math.random() * 0.5,
      numReviews: 20 + Math.floor(Math.random() * 80),
      tags: ['t-shirt', 'cotton', 'casual', index > 6 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // ==================== SHIRTS (~25 products) ====================
  const shirtStyles = [
    { name: 'Oxford Button Down', desc: 'Classic oxford cloth button-down shirt. Soft, textured fabric with a versatile casual-to-smart look.', price: 2499 },
    { name: 'Linen Blend Summer', desc: 'Breathable linen blend shirt perfect for warm weather. Relaxed fit with a laid-back elegance.', price: 2799 },
    { name: 'Flannel Check', desc: 'Soft brushed flannel in classic check pattern. Warm and comfortable for cooler days.', price: 2699 },
    { name: 'Chambray Work', desc: 'Rugged chambray fabric with a workwear heritage. Soft and durable for everyday wear.', price: 2599 },
    { name: 'Twill Utility', desc: 'Cotton twill shirt with utility-inspired details. Double chest pockets and sturdy construction.', price: 2899 },
    { name: 'Slim Fit Poplin', desc: 'Crisp poplin cotton in a modern slim fit. Clean and polished for semi-formal occasions.', price: 2399 },
    { name: 'Corduroy Camp Collar', desc: 'Retro-inspired camp collar in soft corduroy. Relaxed fit with vintage charm.', price: 3199 },
    { name: 'Denim Western', desc: 'Classic western-style denim shirt with snap buttons. Authentic details and premium denim.', price: 2999 },
    { name: 'Brushed Cotton Plaid', desc: 'Ultra-soft brushed cotton in timeless plaid. Perfect for layering or wearing alone.', price: 2699 },
    { name: 'Mandarin Collar', desc: 'Contemporary mandarin collar shirt in premium cotton. Clean lines for a modern aesthetic.', price: 2799 },
    { name: 'Overshirt Jacket', desc: 'Versatile overshirt that works as a shirt or light jacket. Sturdy cotton with multiple pockets.', price: 3499 },
    { name: 'Band Collar Linen', desc: 'Minimalist band collar in lightweight linen. Effortlessly elegant for summer.', price: 2899 },
  ];
  
  const shirtColors = [colors.offWhite, colors.navy, colors.olive, colors.charcoal, colors.sand, colors.burgundy, colors.cream];
  
  shirtStyles.forEach((style, index) => {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: style.name + ' Shirt',
      description: style.desc,
      price: style.price,
      originalPrice: Math.round(style.price * 1.35),
      category: 'shirts',
      images: [images.shirts[index % images.shirts.length], images.shirts[(index + 1) % images.shirts.length]],
      sizes,
      colors: shirtColors.slice(index % 3, (index % 3) + 4),
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 3,
      isNew: index >= 9,
      rating: 4.3 + Math.random() * 0.5,
      numReviews: 25 + Math.floor(Math.random() * 75),
      tags: ['shirt', 'casual', index < 3 ? 'bestseller' : null, index >= 9 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // Additional shirt variations  
  const additionalShirts = [
    { name: 'Essential White Oxford', colors: [colors.offWhite, colors.cream] },
    { name: 'Navy Chambray Classic', colors: [colors.navy, colors.indigo] },
    { name: 'Olive Utility Shirt', colors: [colors.olive, colors.armyGreen, colors.tan] },
    { name: 'Stone Cotton Casual', colors: [colors.stone, colors.sand, colors.cream] },
    { name: 'Relaxed Fit Weekend', colors: [colors.charcoal, colors.navy, colors.olive] },
    { name: 'Heritage Flannel', colors: [colors.burgundy, colors.forest, colors.navy] },
    { name: 'Modern Slim Oxford', colors: [colors.offWhite, colors.navy, colors.charcoal] },
    { name: 'Textured Cotton Blend', colors: [colors.stone, colors.olive, colors.navy] },
    { name: 'Summer Linen Blend', colors: [colors.cream, colors.sand, colors.offWhite] },
    { name: 'Workwear Inspired', colors: [colors.charcoal, colors.olive, colors.tan] },
    { name: 'Brushed Twill Classic', colors: [colors.navy, colors.burgundy, colors.olive] },
    { name: 'Camp Collar Casual', colors: [colors.terracotta, colors.olive, colors.navy, colors.sand] },
    { name: 'Textured Weave Shirt', colors: [colors.offWhite, colors.stone, colors.charcoal] },
  ];
  
  additionalShirts.forEach((shirt, index) => {
    const sizes = ['S', 'M', 'L', 'XL'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: shirt.name,
      description: 'Quality construction meets timeless design. Premium fabric and attention to detail in every stitch.',
      price: 2299 + (index * 100),
      originalPrice: Math.round((2299 + (index * 100)) * 1.4),
      category: 'shirts',
      images: [images.shirts[index % images.shirts.length], images.shirts[(index + 2) % images.shirts.length]],
      sizes,
      colors: shirt.colors,
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 2,
      isNew: index > 9,
      rating: 4.2 + Math.random() * 0.6,
      numReviews: 15 + Math.floor(Math.random() * 60),
      tags: ['shirt', 'casual', index > 9 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // ==================== SWEATSHIRTS & HOODIES (~25 products) ====================
  const sweatshirtStyles = [
    { name: 'Classic Crewneck Sweatshirt', desc: 'Timeless crewneck in heavyweight fleece. Brushed interior for premium comfort.', price: 2499 },
    { name: 'Oversized Pullover Hoodie', desc: 'Relaxed oversized hoodie with kangaroo pocket. Heavyweight cotton blend for warmth.', price: 2999 },
    { name: 'Minimal Logo Hoodie', desc: 'Clean design with subtle embroidered logo. Premium fleece with adjustable drawstring hood.', price: 3299 },
    { name: 'Half-Zip Fleece', desc: 'Versatile half-zip pullover in soft micro-fleece. Perfect for layering or standalone wear.', price: 2799 },
    { name: 'Vintage Wash Hoodie', desc: 'Pre-washed for a lived-in look. Soft, broken-in feel with faded vintage aesthetic.', price: 3199 },
    { name: 'Raglan Sleeve Sweatshirt', desc: 'Athletic-inspired raglan sleeves for freedom of movement. Classic fit with ribbed cuffs.', price: 2599 },
    { name: 'French Terry Crewneck', desc: 'Lightweight french terry perfect for transitional weather. Soft looped interior.', price: 2399 },
    { name: 'Zip-Up Track Hoodie', desc: 'Full zip hoodie with sporty details. Contrast panels and premium hardware.', price: 3499 },
    { name: 'Heavyweight Champion', desc: 'Extra heavy 400gsm cotton fleece. Maximum warmth and durability.', price: 3699 },
    { name: 'Washed Cotton Crew', desc: 'Garment-dyed for unique color depth. Soft hand feel that improves with each wash.', price: 2699 },
    { name: 'Embroidered Detail Hoodie', desc: 'Tonal embroidered design on premium heavyweight fleece. Statement piece for your wardrobe.', price: 3399 },
    { name: 'Relaxed Fit Quarter Zip', desc: 'Easy quarter-zip pullover in brushed cotton. Relaxed silhouette for effortless style.', price: 2899 },
  ];
  
  const sweatshirtColors = [colors.charcoal, colors.cream, colors.olive, colors.navy, colors.stone, colors.terracotta, colors.black];
  
  sweatshirtStyles.forEach((style, index) => {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: style.name,
      description: style.desc,
      price: style.price,
      originalPrice: Math.round(style.price * 1.4),
      category: 'sweatshirts',
      images: [images.sweatshirts[index % images.sweatshirts.length], images.sweatshirts[(index + 1) % images.sweatshirts.length]],
      sizes,
      colors: sweatshirtColors.slice(index % 3, (index % 3) + 4),
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 4,
      isNew: index >= 9,
      rating: 4.4 + Math.random() * 0.5,
      numReviews: 35 + Math.floor(Math.random() * 80),
      tags: ['sweatshirt', index < 4 ? 'bestseller' : null, index >= 9 ? 'new-arrivals' : null, 'cozy', 'layering'].filter(Boolean),
    });
  });

  // Additional sweatshirt variations
  const additionalSweatshirts = [
    { name: 'Earth Tone Crew', colors: [colors.mushroom, colors.olive, colors.sand] },
    { name: 'Essential Pullover Hoodie', colors: [colors.black, colors.charcoal, colors.navy, colors.olive] },
    { name: 'Soft Touch Fleece', colors: [colors.cream, colors.stone, colors.terracotta] },
    { name: 'Weekend Warrior Hoodie', colors: [colors.charcoal, colors.olive, colors.navy] },
    { name: 'Cozy Oversize Crew', colors: [colors.offWhite, colors.mushroom, colors.slate] },
    { name: 'Athletic Fit Pullover', colors: [colors.navy, colors.charcoal, colors.olive] },
    { name: 'Premium Cotton Hoodie', colors: [colors.black, colors.cream, colors.burgundy] },
    { name: 'Relaxed Sunday Crew', colors: [colors.stone, colors.sand, colors.olive, colors.navy] },
    { name: 'Navigator Logo Hoodie', colors: [colors.charcoal, colors.terracotta, colors.cream, colors.olive] },
    { name: 'Heavy Terry Sweatshirt', colors: [colors.navy, colors.cream, colors.charcoal] },
    { name: 'Washed Vintage Pullover', colors: [colors.slate, colors.mushroom, colors.olive] },
    { name: 'Urban Explorer Hoodie', colors: [colors.black, colors.olive, colors.navy, colors.terracotta] },
    { name: 'Comfort Blend Crew', colors: [colors.cream, colors.charcoal, colors.stone] },
  ];
  
  additionalSweatshirts.forEach((sweat, index) => {
    const sizes = ['S', 'M', 'L', 'XL'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: sweat.name,
      description: 'Premium fleece construction for warmth and comfort. Designed for everyday wear and built to last.',
      price: 2599 + (index * 100),
      originalPrice: Math.round((2599 + (index * 100)) * 1.35),
      category: 'sweatshirts',
      images: [images.sweatshirts[index % images.sweatshirts.length], images.sweatshirts[(index + 2) % images.sweatshirts.length]],
      sizes,
      colors: sweat.colors,
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 2,
      isNew: index > 10,
      rating: 4.3 + Math.random() * 0.5,
      numReviews: 20 + Math.floor(Math.random() * 50),
      tags: ['sweatshirt', 'cozy', index > 10 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // ==================== JEANS (~25 products) ====================
  const jeansStyles = [
    { name: 'Slim Fit Classic Jeans', desc: 'Modern slim fit with slight stretch for comfort. Clean wash with minimal fading.', price: 2999 },
    { name: 'Relaxed Straight Jeans', desc: 'Easy relaxed fit through the leg. Perfect for all-day comfort without sacrificing style.', price: 3199 },
    { name: 'Athletic Tapered Jeans', desc: 'Room in the thigh with a tapered leg. Ideal for athletic builds seeking a modern look.', price: 3299 },
    { name: 'Vintage Wash Selvedge', desc: 'Premium Japanese selvedge denim with authentic vintage wash. Develops unique character over time.', price: 4499 },
    { name: 'Dark Indigo Slim', desc: 'Deep, rich indigo color in our slim fit. Versatile for casual to smart-casual occasions.', price: 3199 },
    { name: 'Washed Black Straight', desc: 'Classic black denim with a subtle washed finish. Straight leg for timeless appeal.', price: 2999 },
    { name: 'Light Wash Relaxed', desc: 'Sun-faded light wash in a comfortable relaxed fit. Perfect for casual summer days.', price: 2899 },
    { name: 'Raw Selvedge Slim', desc: 'Unwashed raw denim that molds to your body. Premium selvedge construction.', price: 4799 },
    { name: 'Stretch Comfort Slim', desc: 'Maximum stretch for unrestricted movement. Slim silhouette that moves with you.', price: 3099 },
    { name: 'Heritage Straight', desc: 'Classic 5-pocket style inspired by workwear heritage. Durable construction for years of wear.', price: 3399 },
    { name: 'Tapered Cropped', desc: 'Modern cropped length with tapered leg. Contemporary style for fashion-forward looks.', price: 3299 },
    { name: 'Carpenter Style', desc: 'Utility-inspired with tool loop and reinforced pockets. Rugged style meets everyday functionality.', price: 3599 },
  ];
  
  const jeansColors = [colors.indigo, colors.washedBlack, colors.midWash, colors.lightWash, colors.denim, colors.black];
  
  jeansStyles.forEach((style, index) => {
    const sizes = ['28', '30', '32', '34', '36', '38'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: style.name,
      description: style.desc,
      price: style.price,
      originalPrice: Math.round(style.price * 1.35),
      category: 'jeans',
      images: [images.jeans[index % images.jeans.length], images.jeans[(index + 1) % images.jeans.length]],
      sizes,
      colors: jeansColors.slice(index % 3, (index % 3) + 3),
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 4,
      isNew: index >= 9,
      rating: 4.3 + Math.random() * 0.5,
      numReviews: 40 + Math.floor(Math.random() * 90),
      tags: ['jeans', 'denim', index < 4 ? 'bestseller' : null, index >= 9 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // Additional jeans variations
  const additionalJeans = [
    { name: 'Essential Dark Wash', colors: [colors.indigo, colors.denim] },
    { name: 'Comfort Stretch Slim', colors: [colors.midWash, colors.washedBlack, colors.indigo] },
    { name: 'Vintage Faded Straight', colors: [colors.lightWash, colors.midWash] },
    { name: 'Modern Tapered Fit', colors: [colors.indigo, colors.washedBlack, colors.black] },
    { name: 'Relaxed Weekend Jeans', colors: [colors.midWash, colors.lightWash, colors.washedBlack] },
    { name: 'Classic Indigo Slim', colors: [colors.indigo, colors.denim] },
    { name: 'Washed Denim Straight', colors: [colors.midWash, colors.washedBlack] },
    { name: 'Premium Selvedge Raw', colors: [colors.indigo, colors.black] },
    { name: 'Athletic Build Jeans', colors: [colors.indigo, colors.midWash, colors.washedBlack] },
    { name: 'Everyday Essential Jean', colors: [colors.midWash, colors.indigo, colors.washedBlack, colors.lightWash] },
    { name: 'Slim Taper Modern', colors: [colors.indigo, colors.black, colors.washedBlack] },
    { name: 'Heritage Workwear Jean', colors: [colors.indigo, colors.midWash] },
    { name: 'Soft Touch Stretch', colors: [colors.midWash, colors.indigo, colors.lightWash] },
  ];
  
  additionalJeans.forEach((jean, index) => {
    const sizes = ['28', '30', '32', '34', '36'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: jean.name,
      description: 'Quality denim construction with attention to fit and comfort. Built to last and look better with age.',
      price: 2899 + (index * 100),
      originalPrice: Math.round((2899 + (index * 100)) * 1.35),
      category: 'jeans',
      images: [images.jeans[index % images.jeans.length], images.jeans[(index + 2) % images.jeans.length]],
      sizes,
      colors: jean.colors,
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 2,
      isNew: index > 10,
      rating: 4.2 + Math.random() * 0.6,
      numReviews: 20 + Math.floor(Math.random() * 60),
      tags: ['jeans', 'denim', index > 10 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // ==================== TROUSERS & CHINOS (~20 products) ====================
  const trouserStyles = [
    { name: 'Classic Chino', desc: 'Timeless chino in premium cotton twill. Versatile enough for office or weekend wear.', price: 2499 },
    { name: 'Slim Fit Trouser', desc: 'Modern slim fit with clean lines. Perfect for smart-casual dressing.', price: 2799 },
    { name: 'Relaxed Cargo', desc: 'Utility-inspired cargo with a relaxed fit. Multiple pockets for functionality.', price: 2999 },
    { name: 'Tapered Chino', desc: 'Contemporary tapered leg in soft stretch cotton. Comfort meets modern style.', price: 2699 },
    { name: 'Wide Leg Trouser', desc: 'Relaxed wide leg for a modern silhouette. Pleated front for a refined look.', price: 3199 },
    { name: 'Corduroy Trouser', desc: 'Classic corduroy in a comfortable fit. Soft texture for cooler weather.', price: 2899 },
    { name: 'Linen Blend Summer', desc: 'Lightweight linen blend for hot days. Breathable and effortlessly stylish.', price: 2599 },
    { name: 'Technical Stretch', desc: 'Performance fabric with 4-way stretch. Comfort for work or travel.', price: 3299 },
    { name: 'Pleated Front Classic', desc: 'Traditional pleated front with a relaxed fit. Timeless elegance for any occasion.', price: 2999 },
    { name: 'Utility Work Trouser', desc: 'Durable construction with workwear details. Built tough for everyday wear.', price: 3199 },
  ];
  
  const trouserColors = [colors.tan, colors.olive, colors.navy, colors.charcoal, colors.stone, colors.camel, colors.cream];
  
  trouserStyles.forEach((style, index) => {
    const sizes = ['28', '30', '32', '34', '36', '38'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: style.name,
      description: style.desc,
      price: style.price,
      originalPrice: Math.round(style.price * 1.35),
      category: 'trousers',
      images: [images.trousers[index % images.trousers.length], images.trousers[(index + 1) % images.trousers.length]],
      sizes,
      colors: trouserColors.slice(index % 3, (index % 3) + 4),
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 3,
      isNew: index >= 7,
      rating: 4.3 + Math.random() * 0.5,
      numReviews: 25 + Math.floor(Math.random() * 60),
      tags: ['trousers', 'chinos', index < 3 ? 'bestseller' : null, index >= 7 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // Additional trouser variations
  const additionalTrousers = [
    { name: 'Essential Khaki Chino', colors: [colors.tan, colors.sand, colors.camel] },
    { name: 'Navy Smart Trouser', colors: [colors.navy, colors.charcoal] },
    { name: 'Olive Casual Chino', colors: [colors.olive, colors.armyGreen, colors.tan] },
    { name: 'Stone Relaxed Fit', colors: [colors.stone, colors.sand, colors.cream] },
    { name: 'Weekend Comfort Chino', colors: [colors.navy, colors.olive, colors.tan, colors.charcoal] },
    { name: 'Stretch Cotton Trouser', colors: [colors.charcoal, colors.navy, colors.stone] },
    { name: 'Modern Slim Chino', colors: [colors.olive, colors.navy, colors.tan] },
    { name: 'Cargo Utility Pant', colors: [colors.olive, colors.charcoal, colors.tan] },
    { name: 'Summer Weight Trouser', colors: [colors.cream, colors.sand, colors.stone] },
    { name: 'Heritage Work Pant', colors: [colors.tan, colors.olive, colors.navy] },
  ];
  
  additionalTrousers.forEach((trouser, index) => {
    const sizes = ['28', '30', '32', '34', '36'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: trouser.name,
      description: 'Premium construction and thoughtful details. Versatile styling for any occasion.',
      price: 2399 + (index * 100),
      originalPrice: Math.round((2399 + (index * 100)) * 1.35),
      category: 'trousers',
      images: [images.trousers[index % images.trousers.length], images.trousers[(index + 1) % images.trousers.length]],
      sizes,
      colors: trouser.colors,
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 2,
      isNew: index > 7,
      rating: 4.2 + Math.random() * 0.6,
      numReviews: 15 + Math.floor(Math.random() * 45),
      tags: ['trousers', 'chinos', index > 7 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // ==================== JACKETS & OUTERWEAR (~20 products) ====================
  const jacketStyles = [
    { name: 'Classic Bomber Jacket', desc: 'Timeless bomber silhouette in premium nylon. Ribbed cuffs and hem with quality hardware.', price: 4999 },
    { name: 'Denim Trucker Jacket', desc: 'Iconic denim jacket with authentic details. A wardrobe staple that gets better with age.', price: 4499 },
    { name: 'Canvas Work Jacket', desc: 'Durable canvas construction inspired by workwear. Multiple pockets and rugged styling.', price: 4799 },
    { name: 'Lightweight Coach', desc: 'Classic coach jacket in water-resistant nylon. Snap button front with clean lines.', price: 3999 },
    { name: 'Quilted Liner Jacket', desc: 'Lightweight quilted jacket perfect for layering. Diamond stitching with warm fill.', price: 4299 },
    { name: 'Harrington Jacket', desc: 'Classic British-style harrington with tartan lining. Timeless design for any occasion.', price: 4999 },
    { name: 'Corduroy Chore Coat', desc: 'French-inspired chore coat in soft corduroy. Relaxed fit with patch pockets.', price: 5299 },
    { name: 'Waxed Cotton Field', desc: 'Traditional waxed cotton with weather protection. Classic field jacket styling.', price: 5999 },
    { name: 'Fleece Lined Denim', desc: 'Classic denim jacket with warm fleece lining. Extended warmth for cooler weather.', price: 5499 },
    { name: 'Technical Windbreaker', desc: 'Lightweight windbreaker with packable design. Water-resistant with mesh lining.', price: 3799 },
  ];
  
  const jacketColors = [colors.navy, colors.olive, colors.charcoal, colors.tan, colors.black, colors.burgundy, colors.indigo];
  
  jacketStyles.forEach((style, index) => {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: style.name,
      description: style.desc,
      price: style.price,
      originalPrice: Math.round(style.price * 1.35),
      category: 'jackets',
      images: [images.jackets[index % images.jackets.length], images.jackets[(index + 1) % images.jackets.length]],
      sizes,
      colors: jacketColors.slice(index % 3, (index % 3) + 3),
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 4,
      isNew: index >= 7,
      rating: 4.4 + Math.random() * 0.5,
      numReviews: 30 + Math.floor(Math.random() * 70),
      tags: ['jacket', 'outerwear', index < 4 ? 'bestseller' : null, index >= 7 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  // Additional jacket variations
  const additionalJackets = [
    { name: 'Essential Bomber', colors: [colors.navy, colors.olive, colors.black] },
    { name: 'Heritage Denim Jacket', colors: [colors.indigo, colors.washedBlack, colors.midWash] },
    { name: 'Utility Field Jacket', colors: [colors.olive, colors.tan, colors.navy] },
    { name: 'Lightweight Rain Jacket', colors: [colors.navy, colors.black, colors.olive] },
    { name: 'Canvas Workwear Coat', colors: [colors.tan, colors.olive, colors.charcoal] },
    { name: 'Quilted Shirt Jacket', colors: [colors.olive, colors.navy, colors.burgundy] },
    { name: 'Modern Coach Jacket', colors: [colors.black, colors.navy, colors.olive] },
    { name: 'Explorer Parka', colors: [colors.olive, colors.navy, colors.charcoal] },
    { name: 'Premium Leather Jacket', colors: [colors.black, colors.espresso] },
    { name: 'Navigator Windbreaker', colors: [colors.terracotta, colors.olive, colors.navy, colors.charcoal] },
  ];
  
  additionalJackets.forEach((jacket, index) => {
    const sizes = ['S', 'M', 'L', 'XL'];
    const stockBySize = generateStockBySize(sizes);
    products.push({
      name: jacket.name,
      description: 'Quality outerwear built for style and function. Premium materials and timeless design.',
      price: 4299 + (index * 200),
      originalPrice: Math.round((4299 + (index * 200)) * 1.35),
      category: 'jackets',
      images: [images.jackets[index % images.jackets.length], images.jackets[(index + 1) % images.jackets.length]],
      sizes,
      colors: jacket.colors,
      stockBySize,
      stock: getTotalStock(stockBySize),
      featured: index < 2,
      isNew: index > 7,
      rating: 4.3 + Math.random() * 0.5,
      numReviews: 15 + Math.floor(Math.random() * 50),
      tags: ['jacket', 'outerwear', index > 7 ? 'new-arrivals' : null].filter(Boolean),
    });
  });

  return products;
};

const products = generateProducts();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create users (password will be hashed by User model pre-save hook)
    console.log('Creating users...');
    for (const userData of users) {
      await User.create(userData);
    }

    // Create products
    console.log('Creating products...');
    await Product.insertMany(products);

    console.log(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   ✅ Database seeded successfully!        ║
    ║                                           ║
    ║   Created:                                ║
    ║   - ${users.length} users                              ║
    ║   - ${products.length} products                        ║
    ║                                           ║
    ║   Admin Login:                            ║
    ║   Email: admin@navigator.com              ║
    ║   Password: admin123                      ║
    ║                                           ║
    ║   Test User:                              ║
    ║   Email: user@test.com                    ║
    ║   Password: user123                       ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    `);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
