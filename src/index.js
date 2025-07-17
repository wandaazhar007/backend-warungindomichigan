// require('dotenv').config();

// const app = require('./app');

// const PORT = process.env.PORT || 8080;

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const path = require('path');
// This ensures we load the .env file from the project's root directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = require('./app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:8080`);
});