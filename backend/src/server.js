const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { testConnection } = require('./config/db');

const port = Number(process.env.PORT || 5000);
const uploadsDirectory = path.resolve(__dirname, '..', 'uploads', 'evidence');
fs.mkdirSync(uploadsDirectory, { recursive: true });

async function startServer() {
  await testConnection();

  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
}
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'Frontend-backend connection works!' });
});
startServer().catch((error) => {
  console.error('Failed to start backend server.');
  console.error(error.message);
  process.exit(1);
});
