import fs from "fs/promises"
import path from "path"

export const manifest = {
  name: "agent-reader-controls",
  displayName: "Agent Reader Controls",
  description: "Emits LLM-readable text files and renders copy/open-in-assistant controls.",
  category: ["emitter", "component"],
  version: "1.0.0",
  quartzVersion: ">=5.0.0",
}

const joinSegments = (...segments) =>
  segments
    .filter((segment) => segment && segment.length > 0)
    .join("/")
    .replace(/\/+/g, "/")

const write = async ({ ctx, slug, content, ext = ".txt" }) => {
  const pathToPage = joinSegments(ctx.argv.output, slug + ext)
  const dir = path.dirname(pathToPage)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(pathToPage, content)
  return pathToPage
}

const formatTags = (tags) => {
  if (!Array.isArray(tags) || tags.length === 0) return ""
  return `Tags: ${tags.join(", ")}\n`
}

const formatPage = (data) => {
  const frontmatter = data.frontmatter ?? {}
  const title = frontmatter.title || data.slug || "Untitled"
  const description = data.description ? `Description: ${data.description}\n` : ""
  const tags = formatTags(frontmatter.tags)
  const body = data.text ?? ""
  return `# ${title}\n\n${description}${tags}Slug: ${data.slug}\n\n${body}`.trim() + "\n"
}

export default function LLMSTxt() {
  const emitAll = async (ctx, content) => {
    const pages = content
      .map(([, file]) => file.data ?? {})
      .filter((data) => data.slug && data.unlisted !== true)
      .sort((a, b) => {
        if (a.slug === "index") return -1
        if (b.slug === "index") return 1
        const titleA = a.frontmatter?.title ?? a.slug
        const titleB = b.frontmatter?.title ?? b.slug
        return String(titleA).localeCompare(String(titleB))
      })

    const outputs = []
    const full = pages.map(formatPage).join("\n---\n\n")
    outputs.push(await write({ ctx, slug: "llms-full", content: full }))

    for (const page of pages) {
      if (page.slug === "index") continue
      outputs.push(await write({ ctx, slug: joinSegments("static", "llms", page.slug), content: formatPage(page) }))
    }

    return outputs
  }

  return {
    name: "LLMSTxt",
    emit: emitAll,
    partialEmit: emitAll,
  }
}
