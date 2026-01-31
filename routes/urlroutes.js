import express from "express";
import { nanoid } from "nanoid";
import Url from "../models/url.js";

const router = express.Router();

// Home page
router.get("/", async (req, res) => {
  res.render("website", { shortUrl: null });
});

// Create short URL
router.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.render("website", { shortUrl: null });
  }

  const shortCode = nanoid(5);

  await Url.create({
    originalUrl,
    shortCode
  });

  const shortUrl = `http://localhost:3000/${shortCode}`;

  res.render("website", { shortUrl });
});

// Redirect
router.get("/:code", async (req, res) => {
  const url = await Url.findOne({ shortCode: req.params.code });

  if (!url) {
    return res.status(404).send("URL not found");
  }

  url.clicks++;
  await url.save();

  res.redirect(url.originalUrl);
});

export default router;
