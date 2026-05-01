"use strict";

const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

// This file configures Prisma CLI tools (migrate, generate, studio).
// The PrismaClient runtime adapter is configured separately in src/lib/prisma.js.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

/** @type {import('prisma').PrismaConfig} */
module.exports = {
  migrate: {
    adapter,
  },
};