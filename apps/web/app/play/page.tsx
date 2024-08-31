import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";

export default async function Page() {

  return (
    <div>
      <p>Choose what type of play</p>
      <Button>
        <Link href="play/online" replace={true}>
          Play Online
        </Link>
      </Button>
    </div>
  )
}
