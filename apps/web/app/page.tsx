import CirclesPages from "@/components/homepage/CirclePages";
import { BlackPlanet, GradientOrangeCircle, HalfMoonPlanet, OrangePlanet, SaturnCircle, StripeCircle } from "@/components/homepage/Circles";
import { Navbar } from "@/components/homepage/navbar";
import Image from "next/image";

export default async function Page() {
  return (
    <div className="relative bg-gradient-to-r from-orange-700 via-amber-600 to-orange-700 min-h-screen overflow-hidden">
      <div className="pt-6 px-12">
        <Navbar title="Chess Game" />
      </div>
      <SaturnCircle />
      <StripeCircle />
      <OrangePlanet />
      <CirclesPages />
      <BlackPlanet />
      <HalfMoonPlanet />
      <GradientOrangeCircle />
      <div className="relative w-full max-w-[1000px] h-[600px] md:h-[800px] lg:h-[1000px] mx-auto">
        {/* Shadow Layer */}
        <div className="absolute inset-0
          bg-black
          rounded-full
          opacity-30
          blur-2xl
          transform
          translate-y-6
          scale-90
          -z-10
        "></div>

        <div className="relative w-full h-full rounded-full overflow-hidden
          transform
          transition-all
          duration-300
        ">
          <Image
            src={`/homepage/chessBoard.png`}
            alt={`chess board`}
            fill
            className="
              object-cover
              rounded-full
              brightness-110
              contrast-125
              saturate-150
              transition-all
              duration-300
              hover:brightness-125
              hover:contrast-150
            "
          />

          {/* Shadow Layer */}
          <div
            className="
            absolute inset-x-0 top-1/2
            h-[400px] w-full
            bg-black
            rounded-full
            opacity-30
            blur-2xl
            transform translate-y-[-20%] scale-90 -z-10
          "
          ></div>
        </div>
      </div>
    </div>
  );
}
