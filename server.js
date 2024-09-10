const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB connection
const MONGODB_URI =
  "mongodb+srv://evanshankman:Testing1234@cluster0.61dimjd.mongodb.net/inethi_stories?retryWrites=true&w=majority";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Category Schema and Model
const categorySchema = new mongoose.Schema({
  category: String,
});

// Story Schema and Model
// This is how a story object must be structured
const storySchema = new mongoose.Schema({
  category: String,
  title: String,
  author: String,
  content: String,
  downloads: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
});

const Category = mongoose.model("Category", categorySchema);
const Story = mongoose.model("Story", storySchema);

// Routes

//Fetch the categories from MongoDB
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    console.log("Categories from MongoDB:", categories); // categories
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Fetch stories that are in a category
//Essentially filter stories by a specific category
app.get("/stories/:category", async (req, res) => {
  const { category } = req.params;

  try {
    const allStories = await Story.find().where("category").equals(category);

    res.json(allStories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: error.message });
  }
});

//used to fetch stories based on an input query from the user.
//Matching is done by comparing the user input to story titles
app.get("/stories", async (req, res) => {
  const { search } = req.query;
  try {
    //Using title of a story, MongoDB uses a regular expression. User input is the regex and is comapred to titles.
    //'i' stands for case-insensitive, so user input can be matched regardless of what case they use.
    const results = await Story.find({
      title: { $regex: search, $options: "i" },
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ message: error.message });
  }
});

//Fetch all the stories in a catefory to be downloaded.
//This route is used in conjunctiion with /stories/:id/download.
app.get("/stories/:category/downloadall", async (req, res) => {
  const { category } = req.params;
  try {
    const allStories = await Story.find().where("category").equals(category);
    res.json(allStories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: error.message });
  }
});

//Downlaod story by ID
//Allows for downloading the file as a HTML file
app.get("/stories/:id/download", async (req, res) => {
  const { id } = req.params;
  try {
    const story = await Story.findById(id);

    //Content-Disposition - used to determine how to handle this response.
    //This will tell receiving device to handle response as a downloadable file (HTML file)
    res.set({
      "Content-Disposition": `attachment; filename="${story.title}.html"`,
      "Content-Type": "text/html",
    });

    res.send(story.content);
  } catch (error) {
    console.error("THere was an issue downloading the story:", error);
    res.status(500).json({ message: error.message });
  }
});

//Increment the view count of a story
app.post("/stories/:id/view", async (req, res) => {
  // (how many views the story has)
  const { id } = req.params;
  try {
    const story = await Story.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json(story);
  } catch (error) {
    console.error("Could not increase number of views", error);
  }
});

// Increment the downloads property for story (how many times the story has been downloaded)
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
    console.error("Could not increase number of downloads", error);
    res.status(500).json({ message: error.message });
  }
});

//Increase the number of likes a story has
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
    console.error("Failed to increase number of likes", error);
    res.status(500).json({ message: error.message });
  }
});

//Decrease the number of likes a story has
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
    console.error("Failed to decrease number of likes", error);
    res.status(500).json({ message: error.message });
  }
});

//USed to check connection status to the server.
//Server is hsoted by UCT with an associated website domain
app.get("/healthcheck", (req, res) => {
  res.status(200).send("Server is up and running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
