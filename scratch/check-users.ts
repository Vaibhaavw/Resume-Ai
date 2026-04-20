import { db, usersTable } from "../lib/db/src/index.ts";

async function checkUsers() {
  const users = await db.select().from(usersTable);
  console.log("Users in DB:", users.map(u => u.email));
}

checkUsers().catch(console.error);
