import { Client } from '@notionhq/client'
import Fetch from '@11ty/eleventy-fetch'
import 'dotenv/config'

const notion = new Client({
  auth: process.env.NOTION_SECRET || 'your-fallback-key-here',
})

export default async function () {
  return Fetch(
    async () => {
      const { results } = await notion.databases.query({
        database_id: process.env.DATABASE_ID,
      })

      const characters = results.map((entry) => {
        const props = entry.properties

        const id = props['Id']?.number || 0
        const name = props['Name']?.title?.[0]?.plain_text || ''
        const origin = props['Origin']?.select?.name || ''
        const description =
          props['Description']?.rich_text?.[0]?.plain_text || ''

        const fileObj = props['Files & media']?.files?.[0]
        const fileUrl = fileObj?.file?.url || fileObj?.external?.url || ''

        return {
          id,
          name,
          origin,
          description,
          fileUrl,
        }
      })

      characters.sort((a, b) => a.id - b.id)

      return characters
    },
    {
      requestId: 'notion_characters',
      duration: '1d',
      type: 'json',
      verbose: true,
    }
  )
}
