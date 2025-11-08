#!/usr/bin/env node

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node hash-password.js YOUR_PASSWORD');
  console.error('Example: node hash-password.js mySecurePassword123');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nHashed Password:');
console.log(hash);
console.log('\nCopy this hashed password to the Firestore "password" field.');
