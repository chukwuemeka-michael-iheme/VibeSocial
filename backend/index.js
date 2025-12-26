const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

app.get('/', (req, res) => {
  res.json({ message: 'VibeSocial API' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});