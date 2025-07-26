import { Client } from "@notionhq/client"
import Fetch from "@11ty/eleventy-fetch"
import "dotenv/config"
import { promisify } from "util"
import { pipeline } from "stream"
import fs from "fs"
import path from "path"
import got from "got"

const notion = new Client({
  auth: process.env.NOTION_SECRET || "your-fallback-key-here",
})

const streamPipeline = promisify(pipeline)

export default async function () {
  return Fetch(
    async () => {
      const { results } = await notion.databases.query({
        database_id: process.env.DATABASE_ID,
      })

      const visibleCharacters = await Promise.all(
        results
          .filter((entry) => entry.properties["show"]?.checkbox === true)
          .map(async (entry) => {
            const props = entry.properties

            const name = props["name"]?.title?.[0]?.plain_text || ""
            const origin = props["origin"]?.select?.name || ""
            const description =
              props["description"]?.rich_text?.[0]?.plain_text || ""

            const fileObj = props["img"]?.files?.[0]
            const fileUrl = fileObj?.file?.url || fileObj?.external?.url || ""

            // Use name instead of id for image filename
            const safeName = name.toLowerCase().replace(/\s+/g, "-")
            const filename = `${safeName}.png`

            const localImagePath = fileUrl
              ? await downloadImage(fileUrl, filename)
              : ""

            console.log("localImagePath:", localImagePath)

            return {
              name,
              origin,
              description,
              fileUrl: localImagePath,
            }
          })
      )

      // Sort alphabetically by name for now
      visibleCharacters.sort((a, b) => {
        const priority = [
          "eytran",
          "braecen",
          "godric",
          "yrsa",
          "torgil",
          "orm",
          "alfred",
        ]

        const aIndex = priority.indexOf(a.name.toLowerCase())
        const bIndex = priority.indexOf(b.name.toLowerCase())

        // If one is in the priority list and the other is not
        if (aIndex !== -1 && bIndex === -1) return -1
        if (bIndex !== -1 && aIndex === -1) return 1

        // If both are in the priority list, follow the array order
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex

        // Otherwise, alphabetical order
        return a.name.localeCompare(b.name)
      })

      return visibleCharacters
    },
    {
      requestId: "notion_characters",
      duration: "15m",
      type: "json",
      verbose: true,
    }
  )
}

/**
 * Downloads and caches an image from a remote URL into /public/assets/img
 * @param {string} url - Remote image URL
 * @param {string} filename - Local filename (e.g. "eytran.png")
 * @returns {Promise<string>} - Public path to the downloaded image
 */
async function downloadImage(url, filename) {
  const publicDir = path.resolve("./src/public/assets/img")
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })

  const filePath = path.join(publicDir, filename)
  if (!fs.existsSync(filePath)) {
    try {
      await streamPipeline(got.stream(url), fs.createWriteStream(filePath))
      console.log(`Downloaded image: ${filename}`)
    } catch (err) {
      console.error(`Failed to download ${filename}:`, err.message)
    }
  }

  // ✅ This ensures the correct URL path for both local and production
  return `/assets/img/${filename}`
}
