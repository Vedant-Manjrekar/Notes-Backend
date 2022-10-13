// * Imports
const express = require("express");
const mongoose = require("mongoose");
const Notes = require("./notesSchema.cjs");
const Pusher = require("pusher");
const cors = require("cors");
require("dotenv/config");

// * App config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1469857",
  key: "4165b97582214b851189",
  secret: "2587c8df6eb6c5e2b8c8",
  cluster: "ap2",
  useTLS: true,
});

// * Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://notes-app-six-rho.vercel.app/notes/sync",
  })
);

// * Db config
const connec_URL = process.env.DB_URL;

const db = mongoose.connection;
db.once("open", () => {
  console.log("Connected to MongoDb...");

  const notesColl = db.collection("notescontents");
  const changeStream = notesColl.watch();

  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType == "insert") {
      const notesDetails = change.fullDocument;
      pusher.trigger("notes", "inserted", {
        heading: notesDetails?.heading,
        body: notesDetails?.body,
        color: notesDetails?.color,
      });
    } else {
      console.log("Error triggering pusher.");
    }
  });
});

mongoose.connect(connec_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// * Api routes
app.get("/", (req, res) => {
  if (res.status == 102) {
    console.log("loading....");
  }

  res.status(200).send("Fetched");
});

app.get("/notes/sync", (req, res) => {
  Notes.find((error, data) => {
    if (error) {
      res.status(500).send(error.message);
    } else {
      res.status(200).send(data);
    }
  });
});

app.patch("/update/:id", async (request, res) => {
  try {
    const _id = request.params.id;

    const upD = await Notes.findByIdAndUpdate({ _id }, request.body, {
      new: true,
    });
    res.status(201).send(upD);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/notes/new", (req, res) => {
  const dbNote = req.body;

  Notes.create(dbNote, (err, data) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      res.status(200).send(data);
    }
  });
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    const upD = await Notes.findByIdAndDelete(
      { _id },
      {
        new: true,
      }
    );
    res.status(201).send(upD);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// * Listen.
app.listen(port, () => {
  console.log(`Listening on Port ${port}`);
});
