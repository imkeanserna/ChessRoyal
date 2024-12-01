import { Button } from "@repo/ui/components/ui/button";
import AnimatedPlayButton from "./AnimatedPlayButton";

export default function CirclesPages() {
  return (
    <div className="relative w-full flex top-[350px] items-center justify-center">
      {/* Outermost Circle */}
      <div
        className="
        absolute
        w-[700px] h-[700px]
        border-2 border-white/10
        rounded-full
        flex items-center justify-center
        bg-gradient-to-r from-[#171717] to-[#FF6A13] /* Blackish orange to bright orange gradient */
        shadow-2xl shadow-black/40
      "
      >
        {/* Second Circle */}
        <div
          className="
          w-[600px] h-[600px]
          border-2 border-white/20
          rounded-full
          flex items-center justify-center
          bg-gradient-to-t from-[#171717] to-orange-500
          shadow-2xl shadow-black/30
        "
        >
          {/* Third Circle */}
          <div
            className="
            relative
            w-[470px] h-[470px]
            border-2 border-white/30
            rounded-full
            bg-[#171717]
            flex items-center justify-center
            shadow-2xl shadow-black/20
          "
          >
            {/* Inner Circle */}
            <div
              className="
              w-[250px] h-[250px]
              rounded-full
              flex items-center justify-center
              shadow-2xl shadow-black/10
            "
            >
              <div className="flex flex-col items-center px-12 gap-12 absolute top-[50px]">
                <div className="text-center">
                  <p className="text-5xl">Play Now</p>
                  {/* Description Above Button */}
                  <p className="text-sm text-gray-400 mt-4">Get ready for an exciting game! Click the button to start your challenge.</p>
                </div>
                {/* Play Now Button */}
                <AnimatedPlayButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
