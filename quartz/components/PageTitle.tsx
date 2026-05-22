import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <img src={`${baseDir}/static/beaver-logo.png`} alt="Beaver logo" class="page-title-logo" />
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
  gap: 0.7rem;
  font-family: var(--titleFont);
  font-weight: 400;
  letter-spacing: 0;
}

.page-title .page-title-logo {
  width: 42px;
  height: 42px;
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
    font-size: 1.35rem;
    gap: 0.5rem;
  }
  
  .page-title .page-title-logo {
    width: 36px;
    height: 36px;
  }
}
`

export default (() => PageTitle) satisfies QuartzComponentConstructor
