"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DebtDialog } from "./debt-dialog";

export function AddDebtButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <Plus className="mr-2 h-4 w-4" />
        Borç Ekle
      </Button>
      <DebtDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
