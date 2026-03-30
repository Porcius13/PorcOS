"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AssetDialog } from "./asset-dialog";

export function AddAssetButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        Varlık Ekle
      </Button>
      <AssetDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
