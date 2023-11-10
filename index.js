const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/dhurShort', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

const Url = mongoose.model('Url', urlSchema);

// Middleware to parse JSON in requests
app.use(express.json());

// Endpoint to shorten a URL
app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  // Check if the URL is already in the database
  const existingUrl = await Url.findOne({ originalUrl });

  if (existingUrl) {
    res.json(existingUrl);
  } else {
    // Generate a short ID
    const shortUrl = shortid.generate();

    // Save the new URL in the database
    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();

    res.json(newUrl);
  }
});

// Endpoint to redirect to the original URL
app.get('/:shortUrl', async (req, res) => {
  const { shortUrl } = req.params;

  // Find the corresponding URL in the database
  const url = await Url.findOne({ shortUrl });

  if (url) {
    res.redirect(url.originalUrl);
  } else {
    res.status(404).json({ error: 'URL not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
