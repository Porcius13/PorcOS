"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BudgetDialog } from "./budget-dialog";

export function AddBudgetButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Yeni Bütçe
      </Button>
      <BudgetDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
