"use client"

import { useState } from "react"
import { Check, Share2 } from 'lucide-react'

import { Button } from "@repo/ui/components/ui/button";
import {
  Tooltip
} from "@repo/ui/components/ui/tooltip";

interface GameClipClipboardProps {
  clipUrl: string
}

export function GameClipClipboard({ clipUrl }: GameClipClipboardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(clipUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 3000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="max-w-sm items-center space-x-2 inline-block">
      <Tooltip content={isCopied ? "Copied!" : "Copy to Clipboard"}>
        <Button onClick={copyToClipboard} variant="outline" size="icon">
          {isCopied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        </Button>
      </Tooltip>
    </div>
  );
}
