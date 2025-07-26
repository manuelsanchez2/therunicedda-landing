import { EleventyHtmlBasePlugin, IdAttributePlugin } from "@11ty/eleventy"
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight"
import metadata from "./src/_data/metadata.js"

export default async function (eleventyConfig) {
  eleventyConfig.setInputDirectory("src")
  eleventyConfig.setOutputDirectory("docs")

  eleventyConfig.addPlugin(EleventyHtmlBasePlugin)
  eleventyConfig.addPlugin(IdAttributePlugin)
  eleventyConfig.addPlugin(syntaxHighlight)

  eleventyConfig.addPassthroughCopy({
    "src/public/": "/",
  })

  eleventyConfig.addWatchTarget("src/public")
}

export const config = {
  pathPrefix: metadata.pathPrefix,
  markdownTemplateEngine: "njk",
  htmlTemplateEngine: "njk",
}
