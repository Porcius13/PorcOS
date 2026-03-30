"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionDialog } from "./transaction-dialog";

export function AddTransactionButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Yeni İşlem
      </Button>
      <TransactionDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
