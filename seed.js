const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const MenuItem = require('./models/MenuItem');

// Load config
dotenv.config({ path: './.env' });

// File path
const jsonPath = path.join(__dirname, 'data', 'menuItems.json');

// Verify file exists
if (!fs.existsSync(jsonPath)) {
  console.error(`Error: File not found at ${jsonPath}`);
  console.log('Tip: Create a data/ directory with menuItems.json');
  process.exit(1);
}

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('DB connected');
    importData();
  })
  .catch(err => console.error('DB connection failed:', err));

async function importData() {
  try {
    // Read and parse data
    const menuItems = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // Check for missing prices
    const missingPriceItems = menuItems.filter(item => item.price === undefined);
    if (missingPriceItems.length > 0) {
      console.log('The following items are missing prices:');
      missingPriceItems.forEach(item => {
        console.log(`- ${item.name}`);
      });
      process.exit(1); 
    }

    // Clear existing
    await MenuItem.deleteMany();

    // Insert new
    await MenuItem.insertMany(menuItems);

    console.log(`Success! Imported ${menuItems.length} items`);
    process.exit();
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
}
