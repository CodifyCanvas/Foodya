// seeds/seed.ts

// === Load ENV Variables ===
import dotenv from 'dotenv';
dotenv.config();

// === Import Dependencies ===
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from '@/lib/drizzle-schema/admin-panel.schema';
import { and, eq } from 'drizzle-orm';
import { navLink } from '@/constants';

//  === Create MySQL Pool Connection === 
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 3306,
});

//  === Get NavLinks and insert into modules & according to this set permissions === 
const extractLinks = (navItems: typeof navLink) => {
  const links: { title: string; url: string }[] = [];

  for (const item of navItems) {
    if ('items' in item && Array.isArray(item.items)) {
      for (const subItem of item.items) {
        if (subItem.url && subItem.title) {
          // Normalize URL if needed (e.g., remove /restaurant/)
          const cleanUrl = subItem.url.replace(/^\/restaurant\//, '');
          links.push({ title: subItem.title, url: cleanUrl });
        }
      }
    }
  }

  return links;
};

//  === Initialize Drizzle ORM with Pool === 
const seedDb = drizzle(pool);

//  === Main Seeding Function === 
async function main() {
  try {

    //  === Step 1: Insert Role (admin) === 
    const roleName = 'admin';
    const [existingRole] = await seedDb
      .select()
      .from(schema.roles)
      .where(eq(schema.roles.role, roleName));

    let roleId: number;

    if (!existingRole?.id) {
      await seedDb.insert(schema.roles).values({ role: roleName });
      const [newRole] = await seedDb
        .select()
        .from(schema.roles)
        .where(eq(schema.roles.role, roleName));
      roleId = newRole.id;
      console.log('✅ Role created:', roleName);
    } else {
      roleId = existingRole.id;
      console.log('ℹ️ Role already exists:', roleName);
    }

    //  === Step 2: Insert Admin User === 
    const adminEmail = 'admin@example.com';
    const [existingUser] = await seedDb
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail));

    if (!existingUser) {
      await seedDb.insert(schema.users).values({
        name: 'Admin',
        email: adminEmail,
        password: '123456',
        role_id: roleId,
        is_active: true,
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    const links = extractLinks(navLink);

    //  === Step 3: Insert Modules === 
    for (const link of links) {
      const slug = link.url;
      const label = link.title;

      const [existingModule] = await seedDb
        .select()
        .from(schema.modules)
        .where(eq(schema.modules.name, slug));

      if (!existingModule) {
        await seedDb.insert(schema.modules).values({ name: slug, label });
        console.log(`✅ Module inserted: ${slug}`);
      } else {
        console.log(`ℹ️ Module already exists: ${slug}`);
      }
    }

    //  === Step 4: Insert Permissions for Each Module === 
    const modules = await seedDb.select().from(schema.modules);

    for (const mod of modules) {
      const [existingPermission] = await seedDb
        .select()
        .from(schema.permissions)
        .where(
          and(
            eq(schema.permissions.role_id, roleId),
            eq(schema.permissions.module_id, mod.id)
          )
        );

      if (!existingPermission) {
        await seedDb.insert(schema.permissions).values({
          role_id: roleId,
          module_id: mod.id,
          label: `Full access to ${mod.label}`,
          can_view: true,
          can_edit: true,
          can_create: true,
          can_delete: false,
        });
        console.log(`✅ Permissions granted for module: ${mod.name}`);
      } else {
        console.log(`ℹ️ Permissions already set for module: ${mod.name}`);
      }
    }

    //  === Final Success Message === 
    console.log('✅ Seeding complete.');

  } catch (err) {
    // === Error Handling ===
    console.error('❌ Error running seed script:', err);
    process.exitCode = 1; // Allow finally block to run before exiting

  } finally {
    //  === Always Close Pool Connection === 
    await pool.end();
    console.log('🔌 Database connection closed.');

    process.exit(); // Gracefully exit the process
  }
}

//  === Execute Seeding === 
main();
