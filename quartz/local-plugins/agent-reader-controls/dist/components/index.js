import { h } from "preact"

const copyIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M8 7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1H8V7Z"/><path d="M3 10a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7Zm3-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1H6Z"/></svg>'

const checkIcon =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9.2 16.6-4.1-4.1-1.4 1.4 5.5 5.5L20.8 7.8l-1.4-1.4L9.2 16.6Z"/></svg>'

const script = `
const copyIcon = '${copyIcon}'
const checkIcon = '${checkIcon}'

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  textarea.remove()
}

function absoluteLlmsUrl(path) {
  return new URL(path, window.location.href).href
}

async function copyPageMarkdown(path) {
  const res = await fetch(path)
  if (!res.ok) {
    throw new Error("Could not load Markdown")
  }
  await copyToClipboard(await res.text())
}

document.addEventListener("nav", () => {
  const containers = document.querySelectorAll(".copy-page-container")

  containers.forEach((container) => {
    if (container.dataset.ready === "true") return
    container.dataset.ready = "true"

    const toggle = container.querySelector(".copy-page-button")
    const dropdown = container.querySelector(".copy-page-dropdown")
    const copyAction = container.querySelector(".copy-markdown")
    const chatgptLink = container.querySelector(".chatgpt-link")
    const claudeLink = container.querySelector(".claude-link")
    const llmsPath = container.dataset.llmsPath
    const title = container.dataset.pageTitle || document.title
    const llmsUrl = absoluteLlmsUrl(llmsPath)
    const prompt = "Use this Markdown/LLM-readable version of " + title + " as context: " + llmsUrl

    chatgptLink.href = "https://chatgpt.com/?hints=search&q=" + encodeURIComponent(prompt)
    claudeLink.href = "https://claude.ai/new?q=" + encodeURIComponent(prompt)

    toggle.addEventListener("click", (event) => {
      event.stopPropagation()
      dropdown.classList.toggle("show")
      toggle.setAttribute("aria-expanded", dropdown.classList.contains("show") ? "true" : "false")
    })

    copyAction.addEventListener("click", async () => {
      copyAction.disabled = true
      const icon = copyAction.querySelector(".copy-icon")
      const text = copyAction.querySelector(".copy-text")

      try {
        await copyPageMarkdown(llmsPath)
        icon.innerHTML = checkIcon
        text.textContent = "Copied"
        setTimeout(() => {
          icon.innerHTML = copyIcon
          text.textContent = container.dataset.copyLabel || "Copy Markdown"
          copyAction.disabled = false
          dropdown.classList.remove("show")
          toggle.setAttribute("aria-expanded", "false")
        }, 1400)
      } catch {
        text.textContent = "Copy failed"
        setTimeout(() => {
          icon.innerHTML = copyIcon
          text.textContent = container.dataset.copyLabel || "Copy Markdown"
          copyAction.disabled = false
        }, 1600)
      }
    })

    document.addEventListener("click", (event) => {
      if (!container.contains(event.target)) {
        dropdown.classList.remove("show")
        toggle.setAttribute("aria-expanded", "false")
      }
    })
  })
})
`

const styles = `
.copy-page-container {
  position: relative;
  display: inline-block;
  margin: 0.35rem 0 0.65rem;
}

.page-header > .popover-hint {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  column-gap: 1rem;
}

.page-header > .popover-hint > .breadcrumb-container {
  grid-column: 1 / -1;
}

.page-header > .popover-hint > .article-title {
  grid-column: 1;
}

.page-header > .popover-hint > .copy-page-container {
  grid-column: 2;
  justify-self: end;
  align-self: center;
  margin: 0.15rem 0 0.65rem;
}

.page-header > .popover-hint > .content-meta,
.page-header > .popover-hint > .tags {
  grid-column: 1 / -1;
}

.copy-page-button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--secondary);
  border-radius: 6px;
  padding: 0.45rem 0.65rem;
  background: var(--light);
  color: var(--secondary);
  font: 600 0.85rem/1.2 var(--bodyFont);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.copy-page-button:hover,
.copy-page-button[aria-expanded="true"] {
  background: var(--secondary);
  color: var(--light);
}

.copy-page-button svg,
.dropdown-item svg {
  width: 1rem;
  height: 1rem;
  flex: 0 0 1rem;
  fill: currentColor;
}

.copy-page-dropdown {
  position: absolute;
  top: calc(100% + 0.35rem);
  left: 0;
  z-index: 20;
  min-width: 13rem;
  overflow: hidden;
  border: 1px solid var(--lightgray);
  border-radius: 6px;
  background: var(--light);
  box-shadow: 0 12px 30px color-mix(in srgb, var(--dark) 18%, transparent);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-0.25rem);
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.copy-page-dropdown.show {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  border: 0;
  padding: 0.65rem 0.75rem;
  background: transparent;
  color: var(--darkgray);
  font: 500 0.84rem/1.2 var(--bodyFont);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--highlight);
  color: var(--secondary);
}

.dropdown-item:disabled {
  cursor: wait;
  opacity: 0.75;
}

@media all and (max-width: 700px) {
  .page-header > .popover-hint {
    grid-template-columns: 1fr;
  }

  .page-header > .popover-hint > .copy-page-container {
    grid-column: 1;
    justify-self: start;
    margin-top: 0;
  }
}
`

const pathToRoot = (slug) => {
  if (!slug || slug === "index") return "."
  const depth = String(slug).split("/").length
  return depth === 1 ? ".." : Array(depth).fill("..").join("/")
}

export function CopyPageMarkdown() {
  function Component({ fileData, displayClass }) {
    const slug = fileData?.slug ?? "index"
    const baseDir = pathToRoot(slug)
    const isHomePage = slug === "index"
    const llmsPath = isHomePage ? `${baseDir}/llms-full.txt` : `${baseDir}/static/llms/${slug}.txt`
    const buttonLabel = isHomePage ? "Explore with LLM" : "Explore with LLM"
    const copyLabel = isHomePage ? "Copy all Markdown" : "Copy Markdown"
    const title = fileData?.frontmatter?.title ?? (isHomePage ? "Damlog" : slug)
    const className = ["copy-page-container", displayClass].filter(Boolean).join(" ")

    return h(
      "div",
      {
        className,
        "data-llms-path": llmsPath,
        "data-page-title": title,
        "data-copy-label": copyLabel,
      },
      h(
        "button",
        {
          className: "copy-page-button",
          type: "button",
          "aria-haspopup": "true",
          "aria-expanded": "false",
          dangerouslySetInnerHTML: {
            __html: `${copyIcon}<span>${buttonLabel}</span>`,
          },
        },
      ),
      h(
        "div",
        { className: "copy-page-dropdown", role: "menu" },
        h("button", {
          className: "dropdown-item copy-markdown",
          type: "button",
          role: "menuitem",
          dangerouslySetInnerHTML: {
            __html: `<span class="copy-icon">${copyIcon}</span><span class="copy-text">${copyLabel}</span>`,
          },
        }),
        h(
          "a",
          { className: "dropdown-item", href: llmsPath, role: "menuitem", target: "_blank", rel: "noopener" },
          "View as Markdown",
        ),
        h("a", { className: "dropdown-item chatgpt-link", href: "#", role: "menuitem", target: "_blank", rel: "noopener" }, "Ask ChatGPT"),
        h("a", { className: "dropdown-item claude-link", href: "#", role: "menuitem", target: "_blank", rel: "noopener" }, "Ask Claude"),
      ),
    )
  }

  Component.css = styles
  Component.afterDOMLoaded = script
  return Component
}
