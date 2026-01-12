import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "DamNotes",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "en-US",
    baseUrl: "quartz.jzhao.xyz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
      theme: {
        fontOrigin: "local",
        cdnCaching: true,
        typography: {
          header: "Google Sans",
          body: "Google Sans",
          code: "IBM Plex Mono",
        },
      colors: {
        lightMode: {
          light: "#FFF8E7",
          lightgray: "#E8DCC6",
          gray: "#A89682",
          darkgray: "#5C4A37",
          dark: "#3D2817",
          secondary: "#8B5A3C",
          tertiary: "#A0522D",
          highlight: "rgba(139, 90, 60, 0.15)",
          textHighlight: "#FFE08288",
        },
        darkMode: {
          light: "#1A1510",
          lightgray: "#3D3328",
          gray: "#6B5A4A",
          darkgray: "#D4C4B0",
          dark: "#F5E6D3",
          secondary: "#B8865B",
          tertiary: "#E6B85C",
          highlight: "rgba(184, 134, 91, 0.2)",
          textHighlight: "#FFD54F88",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      // Plugin.CustomOgImages(), // Disabled due to font parsing issues with local Google Sans fonts
    ],
  },
}

export default config
