import Globe3DDemoThird from "@/components/3d-globe-demo-3"
import HeroHeader from "@/components/home/hero-header"
import HeroLogoSection from "@/components/home/hero-logo-section"
// import HeroSection from "@/components/home/hero-section"
import LoadingScreen from "@/components/loader/loading-screen"

export default function Page() {
  return (
    <>
      {/* 3D Animated Loading Screen with winged globe logo */}
      <LoadingScreen />

      <main className="relative min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroHeader />

          {/* New 3D Brand Logo Showcase with interactive aerodynamics & render modes */}
          <HeroLogoSection />

          {/* Previous Torus Physics Simulation (preserved & commented out) */}
          {/* <HeroSection /> */}

          {/* globe section */}
          <Globe3DDemoThird/>
        </div>
      </main>
    </>
  )
}
