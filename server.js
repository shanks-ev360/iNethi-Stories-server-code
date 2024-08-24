const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Add this line to load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Category Schema and Model
const categorySchema = new mongoose.Schema({
  category: String,
});

const Category = mongoose.model("Category", categorySchema);

// Story Schema and Model
const storySchema = new mongoose.Schema({
  category: String,
  title: String,
  author: String,
  content: String,
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
});

const Story = mongoose.model("Story", storySchema);

// Routes
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/stories/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const allStories = await Story.find().where("category").equals(category);
    res.json(allStories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/stories", async (req, res) => {
  try {
    const results = await Story.find();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/stories/:category/downloadall", async (req, res) => {
  const { category } = req.params;
  try {
    const allStories = await Story.find().where("category").equals(category);
    res.json(allStories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/stories/:id/download", async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findById(id);
    res.set({
      "Content-Disposition": `attachment; filename="${story.title}.html"`,
      "Content-Type": "text/html",
    });
    res.send(story.content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/stories/:id/view", async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/stories/:id/downloads", async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/stories/:id/like", async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/stories/:id/unlike", async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { likes: -1 } },
      { new: true }
    );
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/healthcheck", (req, res) => {
  res.status(200).send("Server is up and running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
