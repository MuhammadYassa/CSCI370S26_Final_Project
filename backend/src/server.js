const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { testConnection } = require('./config/db');

const port = Number(process.env.PORT || 8080);
const uploadsDirectory = path.resolve(__dirname, '..', 'uploads', 'evidence');
fs.mkdirSync(uploadsDirectory, { recursive: true });

async function startServer() {
  await testConnection();

  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend server.');
  console.error(error.message);
  process.exit(1);
});
