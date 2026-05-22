import { getDate } from "../../components/Date"
import { FullSlug, joinSegments, simplifySlug } from "../../util/path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

type LLMSContentDetails = {
  slug: FullSlug
  title: string
  tags: string[]
  content: string
  date?: Date
  description?: string
}

type LLMSContentMap = Map<FullSlug, LLMSContentDetails>

interface Options {
  includeEmptyFiles: boolean
}

const defaultOptions: Options = {
  includeEmptyFiles: false,
}

function pageUrl(baseUrl: string | undefined, slug: FullSlug): string {
  const simpleSlug = simplifySlug(slug)
  return baseUrl ? `https://${joinSegments(baseUrl, simpleSlug)}` : simpleSlug
}

function generateLLMSFullTxt(pageTitle: string, baseUrl: string | undefined, idx: LLMSContentMap) {
  let output = `# ${pageTitle}\n\n`
  output += `> Machine-readable blog content for LLM readers.\n\n`

  if (baseUrl) {
    output += `Website: https://${baseUrl}\n\n`
  }

  output += `## Contents\n\n`

  const sortedEntries = Array.from(idx).sort(([_, a], [__, b]) => {
    if (a.date && b.date) return b.date.getTime() - a.date.getTime()
    if (a.date && !b.date) return -1
    if (!a.date && b.date) return 1
    return a.title.localeCompare(b.title)
  })

  for (const [slug, content] of sortedEntries) {
    output += `### ${content.title}\n\n`

    if (content.description) output += `${content.description}\n\n`
    if (content.date) output += `Date: ${content.date.toISOString().split("T")[0]}\n`
    output += `URL: ${pageUrl(baseUrl, slug)}\n`
    if (content.tags.length > 0) output += `Tags: ${content.tags.join(", ")}\n`

    output += `\n${content.content}\n\n---\n\n`
  }

  return output
}

function generatePageLLMSTxt(content: LLMSContentDetails, baseUrl: string | undefined) {
  let output = `# ${content.title}\n\n`

  if (content.description) output += `${content.description}\n\n`
  if (content.date) output += `Date: ${content.date.toISOString().split("T")[0]}\n`
  output += `URL: ${pageUrl(baseUrl, content.slug)}\n`
  if (content.tags.length > 0) output += `Tags: ${content.tags.join(", ")}\n`

  output += `\n---\n\n${content.content}\n`
  return output
}

export const LLMSTxt: QuartzEmitterPlugin<Partial<Options>> = (opts) => {
  opts = { ...defaultOptions, ...opts }

  return {
    name: "LLMSTxt",
    async *emit(ctx, content) {
      const cfg = ctx.cfg.configuration
      const llmsIndex: LLMSContentMap = new Map()

      for (const [_tree, file] of content) {
        const slug = file.data.slug!
        const text = file.data.text ?? ""

        if (opts?.includeEmptyFiles || text !== "") {
          llmsIndex.set(slug, {
            slug,
            title: file.data.frontmatter?.title ?? "Untitled",
            tags: file.data.frontmatter?.tags ?? [],
            content: text,
            date: getDate(ctx.cfg.configuration, file.data) ?? undefined,
            description: file.data.description ?? file.data.frontmatter?.description ?? "",
          })
        }
      }

      yield write({
        ctx,
        content: generateLLMSFullTxt(cfg.pageTitle, cfg.baseUrl, llmsIndex),
        slug: "llms-full" as FullSlug,
        ext: ".txt",
      })

      for (const [slug, contentDetails] of llmsIndex) {
        yield write({
          ctx,
          content: generatePageLLMSTxt(contentDetails, cfg.baseUrl),
          slug: `${slug}/llms` as FullSlug,
          ext: ".txt",
        })
      }
    },
  }
}
