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

            const safeName = name.toLowerCase().replace(/\s+/g, "-")

            // Thumbnail image (overview)
            const imgObj = props["img"]?.files?.[0]
            const imgUrl = imgObj?.file?.url || imgObj?.external?.url || ""
            const imgPath = imgUrl
              ? await downloadImage(imgUrl, `${safeName}.png`)
              : ""

            // Detail image (full view)
            const imgDetailObj = props["img_detail"]?.files?.[0]
            const imgDetailUrl =
              imgDetailObj?.file?.url || imgDetailObj?.external?.url || ""
            const imgDetailPath = imgDetailUrl
              ? await downloadImage(imgDetailUrl, `${safeName}-detail.png`)
              : ""

            return {
              name,
              origin,
              description,
              img: imgPath,
              imgDetail: imgDetailPath,
            }
          })
      )

      // Custom sort order
      const priority = [
        "eytran",
        "braecen",
        "godric",
        "yrsa",
        "torgil",
        "orm",
        "alfred",
      ]
      visibleCharacters.sort((a, b) => {
        const aIndex = priority.indexOf(a.name.toLowerCase())
        const bIndex = priority.indexOf(b.name.toLowerCase())

        if (aIndex !== -1 && bIndex === -1) return -1
        if (bIndex !== -1 && aIndex === -1) return 1
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex

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
  return `/assets/img/${filename}`
}
