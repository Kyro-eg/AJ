import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertProduct, InsertUser, Product, products, User, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

const SEED_PRODUCTS: InsertProduct[] = [
  {
    title: "The Uniform Overshirt",
    category: "Outerwear & Sweaters",
    priceCents: 12800,
    imageUrl: "/assets/streetwear.jpg",
    affiliateUrl: "https://www.amazon.com/s?k=black+overshirt&utm_source=ajwearsit",
    badge: "A-J Top Pick",
  },
  {
    title: "Stone Knit Polo",
    category: "Essentials & Layering",
    priceCents: 8900,
    imageUrl: "/assets/knitwear.jpg",
    affiliateUrl: "https://www.amazon.com/s?k=stone+knit+polo&utm_source=ajwearsit",
    badge: "Old Money Essential",
  },
  {
    title: "Pleat Front Trouser",
    category: "Pleated Trousers & Bottoms",
    priceCents: 10400,
    imageUrl: "/assets/trousers.jpg",
    affiliateUrl: "https://www.amazon.com/s?k=pleated+front+trousers&utm_source=ajwearsit",
    badge: null,
  },
  {
    title: "Milled Leather Loafer",
    category: "Footwear",
    priceCents: 14500,
    imageUrl: "/assets/loafers.jpg",
    affiliateUrl: "https://www.amazon.com/s?k=black+leather+loafers&utm_source=ajwearsit",
    badge: "A-J Top Pick",
  },
  {
    title: "The Grey Cardigan",
    category: "A-J Featured Fits",
    priceCents: 11800,
    imageUrl: "/assets/old-money.jpg",
    affiliateUrl: "https://www.amazon.com/s?k=grey+cardigan+mens&utm_source=ajwearsit",
    badge: "Featured Fit",
  },
  {
    title: "Heavyweight Base Tee",
    category: "Essentials & Layering",
    priceCents: 4200,
    imageUrl: "/assets/streetwear.jpg",
    affiliateUrl: "https://www.amazon.com/s?k=heavyweight+black+t+shirt&utm_source=ajwearsit",
    badge: null,
  },
];

let fallbackProducts: Product[] = SEED_PRODUCTS.map((product, index) => ({
  ...product,
  badge: product.badge ?? null,
  id: index + 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach(field => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return fallbackProducts;
  const result = await db.select().from(products).orderBy(asc(products.id));
  if (result.length === 0) {
    await db.insert(products).values(SEED_PRODUCTS);
    return await db.select().from(products).orderBy(asc(products.id));
  }
  return result;
}

export async function createProduct(input: InsertProduct): Promise<Product> {
  const db = await getDb();
  if (!db) {
    const product: Product = { ...input, badge: input.badge ?? null, id: Math.max(0, ...fallbackProducts.map(item => item.id)) + 1, createdAt: new Date(), updatedAt: new Date() };
    fallbackProducts = [...fallbackProducts, product];
    return product;
  }
  const result = await db.insert(products).values(input);
  const id = Number(result[0].insertId);
  const created = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!created[0]) throw new Error("Product could not be created");
  return created[0];
}

export async function updateProduct(id: number, input: Partial<InsertProduct>): Promise<Product> {
  const db = await getDb();
  if (!db) {
    fallbackProducts = fallbackProducts.map(product => product.id === id ? { ...product, ...input, updatedAt: new Date() } : product);
    const updated = fallbackProducts.find(product => product.id === id);
    if (!updated) throw new Error("Product not found");
    return updated;
  }
  await db.update(products).set(input).where(eq(products.id, id));
  const updated = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!updated[0]) throw new Error("Product not found");
  return updated[0];
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    fallbackProducts = fallbackProducts.filter(product => product.id !== id);
    return;
  }
  await db.delete(products).where(eq(products.id, id));
}
