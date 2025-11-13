import RainbowDropletHeader from "@/components/RainbowDropletHeader";

export default function HomePage() {
  return (
    <>
      <RainbowDropletHeader
        height={420}
        density={0.7}
        minAlpha={0.4}
        maxAlpha={0.75}
        matrixSpeed={1.2}
        rainbowSpeed={60}
        className="bg-black text-white"
      >
        <span className="text-[11px] font-semibold tracking-wider">ETH</span>
      </RainbowDropletHeader>

      <main className="relative z-20">
        {/* rest of your page content here */}
      </main>
    </>
  );
}
