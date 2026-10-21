import HeroHeader from "@/components/home/hero-header"
import HeroSection from "@/components/home/hero-section"
import ReplayButton from "@/components/home/replay-button"
import LoadingScreen from "@/components/loader/loading-screen"

export default function Page() {
  return (
    <>
      {/* 3D Animated Loading Screen with winged globe logo */}
      <LoadingScreen />

      <main className="relative min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroHeader />

          {/* 3D physics interactive hero model */}
          <HeroSection />
        </div>

        {/* Replay trigger for demonstration & client showcase */}
        <ReplayButton />
      </main>
    </>
  )
}
