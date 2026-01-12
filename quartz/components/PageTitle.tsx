import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <img src="/static/logo.png" alt="logo" class="page-title-logo" />
      <a href={baseDir}>{title}</a>
    </h2>
  )
}

PageTitle.css = `
.page-title {
  font-size: 1.75rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  font-family: var(--titleFont);
}

.page-title .page-title-logo {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  object-fit: contain;
}

.page-title a {
  display: flex;
  align-items: center;
  line-height: 1.2;
}

@media all and (max-width: 800px) {
  .page-title {
    font-size: 1.5rem;
    gap: 0.5rem;
  }
  
  .page-title .page-title-logo {
    width: 44px;
    height: 44px;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
