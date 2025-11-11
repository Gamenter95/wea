import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Plus, Send, ArrowDownToLine, Home, Wallet, CreditCard, Globe, User, LogOut } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    console.log("Logout clicked");
    setIsMenuOpen(false);
    setLocation("/login");
  };

  const menuItems = [
    { icon: Home, label: "Home", onClick: () => { setIsMenuOpen(false); console.log("Home clicked"); } },
    { icon: Plus, label: "Add Fund", onClick: () => { setIsMenuOpen(false); console.log("Add Fund clicked"); } },
    { icon: Send, label: "Pay to User", onClick: () => { setIsMenuOpen(false); console.log("Pay to User clicked"); } },
    { icon: ArrowDownToLine, label: "Withdraw", onClick: () => { setIsMenuOpen(false); console.log("Withdraw clicked"); } },
    { icon: Globe, label: "API Gateway", onClick: () => { setIsMenuOpen(false); console.log("API Gateway clicked"); } },
    { icon: User, label: "Profile", onClick: () => { setIsMenuOpen(false); console.log("Profile clicked"); } },
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-16 border-b flex items-center justify-between px-4 bg-card">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-menu"
              className="hover-elevate active-elevate-2"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
            </SheetHeader>
            <nav className="mt-8 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  data-testid={`menu-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover-elevate active-elevate-2 text-left"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <div className="pt-4 border-t">
                <button
                  onClick={handleLogout}
                  data-testid="menu-logout"
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover-elevate active-elevate-2 text-left text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold" data-testid="text-app-name">WeooWallet</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="text-6xl font-bold" data-testid="text-balance">₹0</div>
          <p className="text-sm text-muted-foreground">Available Balance</p>
        </div>
      </main>

      <div className="border-t bg-card p-6">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button
            onClick={() => console.log("Add Fund clicked")}
            data-testid="button-add-fund"
            className="flex flex-col items-center gap-2 hover-elevate active-elevate-2 p-3 rounded-lg"
          >
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium">Add Fund</span>
          </button>

          <button
            onClick={() => console.log("Pay to User clicked")}
            data-testid="button-pay"
            className="flex flex-col items-center gap-2 hover-elevate active-elevate-2 p-3 rounded-lg"
          >
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Send className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium">Pay to User</span>
          </button>

          <button
            onClick={() => console.log("Withdraw clicked")}
            data-testid="button-withdraw"
            className="flex flex-col items-center gap-2 hover-elevate active-elevate-2 p-3 rounded-lg"
          >
            <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <ArrowDownToLine className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium">Withdraw</span>
          </button>
        </div>
      </div>
    </div>
  );
}
