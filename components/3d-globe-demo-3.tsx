"use client"
import { Globe3D } from "@/components/ui/3d-globe"

export default function Globe3DDemoThird() {
  return (
    <section className="relative mx-auto mb-20 h-100 w-full max-w-7xl overflow-hidden rounded-xl bg-white shadow-sm">
      <div className="relative z-10 p-4 md:p-12">
        <h2 className="mb-4 max-w-2xl text-2xl font-extrabold tracking-tight text-balance text-neutral-900 md:text-5xl lg:text-6xl dark:text-white">
          Play all over the world with a click.
        </h2>
        <p className="mt-2 max-w-lg text-balance text-neutral-600 md:mt-8 md:text-lg dark:text-neutral-400">
          Sign up for an account and start posting all over the world with one
          click.
        </p>

        <div className="mt-4 flex gap-4 md:mt-8">
          <button className="flex cursor-pointer items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 font-medium text-white shadow-[0px_0px_10px_0px_rgba(255,255,255,0.2)_inset] ring ring-white/20 ring-offset-2 ring-offset-neutral-900 transition-all duration-200 ring-inset hover:shadow-[0px_0px_20px_0px_rgba(255,255,255,0.4)_inset] hover:ring-white/40 active:scale-98">
            Get Started
          </button>
          <button className="flex cursor-pointer items-center justify-center rounded-lg bg-white px-4 py-2 font-medium text-neutral-900 ring ring-neutral-200 transition-all duration-200 ring-inset hover:bg-neutral-50 hover:ring-neutral-300 active:scale-98">
            Learn More
          </button>
        </div>
      </div>
      {/* Globe container - sized and positioned just for the globe */}
      <div className="absolute right-0 bottom-0 z-10 size-160 md:-bottom-10 md:size-180">
        <Globe3D
          className="h-full w-full"
          config={{
            atmosphereColor: "#ffffff",
            atmosphereIntensity: 1,
            bumpScale: 0,
            autoRotateSpeed: 1,
          }}
        />
      </div>
    </section>
  )
}
