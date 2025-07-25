import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Characters from The Runic Edda
const characters = [
  {
    name: "Eytran",
    origin: "Saxon",
    first_appear: "Prologue",
    description: "A simple monk living in Lindisfarne.",
    img: "eytran.png",
    imgDetail: "eytran-detail.png",
  },
  {
    name: "Yrsa",
    origin: "Viking",
    first_appear: "Prologue",
    description: "A viking with a big heart and temperament.",
    img: "yrsa.png",
    imgDetail: "yrsa-detail.png",
  },
  {
    name: "Braecen",
    origin: "Saxon",
    first_appear: "Prologue",
    description: "Main monk of the group in Lindisfarne.",
    img: "braecen.png",
    imgDetail: "braecen-detail.png",
  },
  {
    name: "Godric",
    origin: "Saxon",
    first_appear: "Prologue",
    description: "Another monk living in Lindisfarne.",
    img: "godric.png",
    imgDetail: "godric-detail.png",
  },
  {
    name: "Torgil",
    origin: "Viking",
    first_appear: "Prologue",
    description: "",
    img: "torgil.png",
    imgDetail: "torgil-detail.png",
  },
  {
    name: "Orm",
    origin: "Viking",
    first_appear: "Prologue",
    description: "",
    img: "orm.png",
    imgDetail: "orm-detail.png",
  },
  {
    name: "Alfred",
    origin: "Saxon",
    first_appear: "Prologue",
    description: "",
    img: "alfred.png",
    imgDetail: "alfred-detail.png",
  },
  {
    name: "Soldier A",
    origin: "Saxon",
    first_appear: "Prologue",
    description: "A soldier from the Saxon army.",
    img: "soldier-a.png",
    imgDetail: "soldier-a-detail.png",
  },
  {
    name: "Soldier B",
    origin: "Saxon",
    first_appear: "Prologue",
    description: "Another soldier from the Saxon army.",
    img: "soldier-b.png",
    imgDetail: "soldier-b-detail.png",
  },
]

// Function to generate character pages
function generateCharacterPages() {
  const templatePath = join(
    __dirname,
    "..",
    "src",
    "characters",
    "template.html"
  )
  const template = readFileSync(templatePath, "utf8")

  characters.forEach((character) => {
    const characterSlug = character.name.toLowerCase().replace(/\s+/g, "-")

    let content = template
      .replace(/{ character name }/g, character.name)
      .replace(/{ character name replace spaces with dash }/g, characterSlug)
      .replace(/{ origin }/g, character.origin)
      .replace(/{ first_appear }/g, character.first_appear)
      .replace(
        /{ description }/g,
        character.description || "No description yet."
      )
      .replace(/{ img }/g, character.img)
      .replace(/{ img_detail }/g, character.imgDetail)

    const outputPath = join(
      __dirname,
      "..",
      "src",
      "characters",
      `${characterSlug}.html`
    )
    writeFileSync(outputPath, content)
    console.log(`Generated ${characterSlug}.html`)
  })
}

// Run the generator
generateCharacterPages()
