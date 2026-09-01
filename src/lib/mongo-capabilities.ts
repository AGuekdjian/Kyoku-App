import mongoose from "mongoose";

export async function supportsMongoTransactions() {
  const database = mongoose.connection.db;
  if (!database) return false;
  const hello = await database.admin().command({ hello: 1 });
  return Boolean(hello.setName || hello.msg === "isdbgrid");
}
