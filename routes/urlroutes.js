import express from "express";
import { nanoid } from "nanoid";
import Url from "../models/url.js";

const router = express.Router();

// Home page
router.get("/", (req, res) => {
  res.render("website", { shortUrl: null, error: null });
});

// Create short URL
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.render("website", {
        shortUrl: null,
        error: "URL is required"
      });
    }

    // Basic URL validation
    try {
      new URL(originalUrl);
    } catch {
      return res.render("website", {
        shortUrl: null,
        error: "Invalid URL"
      });
    }

    const shortCode = nanoid(7); // safer than 5

    await Url.create({
      originalUrl,
      shortCode
    });

    // 🔥 FIX: dynamic base URL
    const baseUrl = process.env.BASE_URL;
    const shortUrl = `${baseUrl}/${shortCode}`;

    res.render("website", { shortUrl, error: null });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Redirect
router.get("/:code", async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.code });

    if (!url) {
      return res.status(404).send("URL not found");
    }

    url.clicks++;
    await url.save();

    res.redirect(url.originalUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
