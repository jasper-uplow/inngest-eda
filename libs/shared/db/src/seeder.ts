import 'dotenv/config';
import { db } from './config';
import { products } from './schema';

const sampleProducts = [
  {
    productName: 'Wireless Mouse',
    price: '29.99',
    quantity: 120,
    createdAt: new Date(),
  },
  {
    productName: 'Mechanical Keyboard',
    price: '89.99',
    quantity: 45,
    createdAt: new Date(),
  },
  {
    productName: 'USB-C Hub',
    price: '49.99',
    quantity: 80,
    createdAt: new Date(),
  },
  {
    productName: '27" Monitor',
    price: '249.99',
    quantity: 25,
    createdAt: new Date(),
  },
  {
    productName: 'Noise-Cancelling Headphones',
    price: '199.99',
    quantity: 60,
    createdAt: new Date(),
  },
] as const;

async function seed() {
  const existing = await db.select().from(products).limit(1);

  if (existing.length > 0) {
    console.log('Products already seeded, skipping.');
    return;
  }

  await db.insert(products).values([...sampleProducts]);

  console.log(`Seeded ${sampleProducts.length} products.`);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
