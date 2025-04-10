import { ThemeSwitcher } from '../theme-switcher'

export default function Footer() {
  return (
    <footer className="grid grid-cols-siteLayout pb-sitePadding">
      <div className="col-start-2 col-end-3 flex items-center justify-between border-t border-t-border pt-md text-xs">
        <p className="text-muted-foreground">© 2025 WeddingReady</p>
        <ThemeSwitcher />
      </div>
    </footer>
  )
}
