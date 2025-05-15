
import { db } from "../server/db";
import { users } from "@shared/schema";

async function insertAdmin() {
  try {
    const [user] = await db.insert(users).values({
      firebaseUid: 'x2LJfyHuaihKYMasd6Pk3jVPhne2',
      username: 'admin',
      email: 'admin@example.com',
      displayName: 'admin',
      preferredLanguage: 'english',
      role: 'admin'
    }).returning();
    
    console.log('Admin user created successfully:', user);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

insertAdmin();
