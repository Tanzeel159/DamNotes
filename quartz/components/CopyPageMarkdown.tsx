// @ts-ignore
import copyPageScript from "./scripts/copypage.inline"
import styles from "./styles/copypage.scss"
import { pathToRoot } from "../util/path"
import { classNames } from "../util/lang"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const copyIcon = (
  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
    <path
      fill-rule="evenodd"
      d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z"
    />
    <path
      fill-rule="evenodd"
      d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z"
    />
  </svg>
)

const CopyPageMarkdown: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  const slug = fileData.slug!
  const baseDir = pathToRoot(slug)
  const isHomePage = slug === "index"
  const llmsPath = isHomePage ? `${baseDir}/llms-full.txt` : `${baseDir}/${slug}/llms.txt`
  const buttonText = isHomePage ? "Copy all blog content" : "Copy page"
  const copyText = isHomePage ? "Copy all blog content" : "Copy page as Markdown"
  const pageText = isHomePage ? "this blog" : "this page"

  return (
    <div class={classNames(displayClass, "copy-page-container")}>
      <button
        class="copy-page-button"
        data-slug={slug}
        data-llms-url={llmsPath}
        aria-label={copyText}
      >
        {copyIcon}
        <span class="copy-page-text">{buttonText}</span>
        <svg
          class="dropdown-arrow"
          aria-hidden="true"
          height="12"
          viewBox="0 0 12 12"
          version="1.1"
          width="12"
        >
          <path d="M6 8.5L2 4.5h8L6 8.5z" />
        </svg>
      </button>
      <div class="copy-page-dropdown">
        <button class="dropdown-item copy-markdown-btn" data-llms-url={llmsPath}>
          {copyIcon}
          <span class="dropdown-item-title">{copyText}</span>
        </button>
        <a
          class="dropdown-item view-markdown-link external"
          href={llmsPath}
          target="_blank"
          data-no-popover="true"
        >
          <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16">
            <path
              fill-rule="evenodd"
              d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75zm1.75-.25a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 00.25-.25V6h-2.75A1.75 1.75 0 019 4.25V1.5H3.75zm6.75.062V4.25c0 .138.112.25.25.25h2.688a.252.252 0 00-.011-.013l-2.914-2.914a.272.272 0 00-.013-.011z"
            />
          </svg>
          <span class="dropdown-item-title">
            View as Markdown <span class="external-arrow">↗</span>
          </span>
        </a>
        <a
          class="dropdown-item chatgpt-link external"
          href="#"
          target="_blank"
          data-llms-url={llmsPath}
          data-page-text={pageText}
          data-no-popover="true"
        >
          <span class="ai-mark">◎</span>
          <span class="dropdown-item-title">
            Ask ChatGPT about {pageText} <span class="external-arrow">↗</span>
          </span>
        </a>
        <a
          class="dropdown-item claude-link external"
          href="#"
          target="_blank"
          data-llms-url={llmsPath}
          data-page-text={pageText}
          data-no-popover="true"
        >
          <span class="ai-mark">✶</span>
          <span class="dropdown-item-title">
            Ask Claude about {pageText} <span class="external-arrow">↗</span>
          </span>
        </a>
      </div>
    </div>
  )
}

CopyPageMarkdown.afterDOMLoaded = copyPageScript
CopyPageMarkdown.css = styles

export default (() => CopyPageMarkdown) satisfies QuartzComponentConstructor
