"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecurringDialog } from "./recurring-dialog";

export function AddRecurringButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Yeni Tekrarlayan İşlem
      </Button>
      <RecurringDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
