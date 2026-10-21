import { Menu as MenuIcon, Plus } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"

export default function HeroHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between gap-6 px-6 py-7">
      {/* Brand Logo */}
      <div className="w-32 md:w-36">
        <Image
          src="/img/transparent-logo.png"
          alt="Auk Sourcing logo"
          width={3375}
          height={4219}
          priority
          className="h-auto w-full"
        />
      </div>

      {/* Typographic center descriptor */}
      <div className="hidden text-center md:block">
        <p className="text-body-sm font-normal text-foreground/70 tracking-[-0.02em]">
          Global sourcing for premium product brands
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Pill action button — graphite fill, 87.5px radius */}
        <Button
          nativeButton={false}
          className="gap-2 rounded-buttons px-6 py-3.5 text-body-sm font-medium uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
          render={<a href="#contact" />}
        >
          <Plus data-icon="inline-start" className="size-3.5" />
          Lets Talk
        </Button>

        {/* Menu trigger — bare text, separated by canvas */}
        <Button
          nativeButton={false}
          variant="ghost"
          className="gap-2 px-2 text-body-sm font-medium text-foreground uppercase hover:bg-transparent hover:opacity-60"
          render={<a href="#menu" />}
        >
          <MenuIcon className="size-4" />
          Menu
        </Button>
      </div>
    </header>
  )
}
