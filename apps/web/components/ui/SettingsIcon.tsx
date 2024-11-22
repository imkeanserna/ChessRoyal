"use client";

import { Settings } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Tooltip } from "@repo/ui/components/ui/tooltip";

export function SettingsButton() {
  const handleSettingsClick = () => {
    // Adding some settings feature here soon.....
  };

  return (
    <Tooltip content="Settings">
      <Button onClick={handleSettingsClick} variant="outline" size="icon" className="p-2">
        <Settings className="h-6 w-6" />
      </Button>
    </Tooltip>
  );
}
