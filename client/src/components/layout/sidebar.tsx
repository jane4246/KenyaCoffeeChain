import { Link, useLocation } from "wouter";
import { useRole } from "@/hooks/use-role";
import { cn } from "@/lib/utils";

const navigationItems = [
  { path: "/", icon: "fas fa-chart-line", label: "Dashboard" },
  { path: "/cooperatives", icon: "fas fa-building", label: "Cooperatives" },
  { path: "/farmers", icon: "fas fa-users", label: "Farmer Registry" },
  { path: "/lots", icon: "fas fa-qrcode", label: "Lot Tracking" },
  { path: "/inventory", icon: "fas fa-warehouse", label: "Inventory" },
  { path: "/marketplace", icon: "fas fa-gavel", label: "Marketplace" },
  { path: "/payments", icon: "fas fa-credit-card", label: "Payments" },
  { path: "/sms", icon: "fas fa-sms", label: "SMS Alerts" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { currentRole, setRole, roleDisplay } = useRole();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-seedling text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">CoffeeChain</h1>
            <p className="text-sm text-muted-foreground">Kenya Platform</p>
          </div>
        </div>
      </div>
      
      {/* User Role Selector */}
      <div className="p-4 border-b border-border">
        <label className="block text-sm font-medium text-foreground mb-2">Active Role</label>
        <select 
          className="w-full p-2 border border-border rounded-md bg-background text-foreground text-sm"
          value={currentRole}
          onChange={(e) => setRole(e.target.value as any)}
          data-testid="role-selector"
        >
          <option value="cooperative">Co-op Manager</option>
          <option value="farmer">Farmer</option>
          <option value="mill">Mill Operator</option>
          <option value="exporter">Exporter</option>
          <option value="roaster">Roaster</option>
          <option value="retailer">Retailer</option>
        </select>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            return (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:bg-accent"
                  )}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} w-5`}></i>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">JK</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Joseph Kariuki</p>
            <p className="text-xs text-muted-foreground truncate">{roleDisplay}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
