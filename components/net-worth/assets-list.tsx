"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Asset } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Edit, Trash2, Wallet } from "lucide-react";
import { AssetDialog } from "./asset-dialog";
import { deleteAsset } from "@/lib/storage";

interface AssetsListProps {
  assets: Asset[];
}

const ASSET_TYPE_LABELS: Record<Asset["type"], string> = {
  cash: "Nakit",
  investment: "Yatırım",
  property: "Taşınmaz",
  vehicle: "Araç",
  other: "Diğer",
};

export function AssetsList({ assets }: AssetsListProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Bu varlığı silmek istediğinize emin misiniz?")) return;

    const success = deleteAsset(id);
    if (success) {
      window.dispatchEvent(new Event("budget-storage-change"));
    }
  };

  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Varlıklar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Henüz varlık eklenmemiş
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Varlıklar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {ASSET_TYPE_LABELS[asset.type]}
                    {asset.description && ` • ${asset.description}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-bold text-green-600">
                    {formatCurrency(asset.value)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(asset)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(asset.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AssetDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        asset={selectedAsset}
      />
    </>
  );
}
