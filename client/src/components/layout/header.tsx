import { useRole } from "@/hooks/use-role";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onNewLot?: () => void;
}

export function Header({ title, subtitle, onNewLot }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="page-header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground" data-testid="page-title">{title}</h2>
          <p className="text-muted-foreground" data-testid="page-subtitle">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-muted-foreground hover:text-foreground" data-testid="notifications-btn">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></span>
          </button>
          {onNewLot && (
            <Button onClick={onNewLot} data-testid="new-lot-btn">
              <Plus className="h-4 w-4 mr-2" />
              New Coffee Lot
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
