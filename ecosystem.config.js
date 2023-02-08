const fs = require('fs');
const path = require('path');

module.exports = {
  apps: [
    {
      name: 'cars', 
      script: 'npm run dev',
      watch: ['prisma/schema.prisma', 'package.json', '.env'],
      watch_delay: 1000,
    },
  ],
};
