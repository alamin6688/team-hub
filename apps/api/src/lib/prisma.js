const path = require("path");
const dotenv = require("dotenv");
const { PrismaClient } = require("./generated/client");
const { PrismaNeon } = require("@prisma/adapter-neon");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

module.exports = prisma;
