import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Search, Menu } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import { AdminSidebarContent } from "./AdminSidebar";
import { useState } from "react";

export function AdminHeader() {
    const [open, setOpen] = useState(false);

    return (
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 w-1/3">
                {/* Mobile Menu */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <AdminSidebarContent onNavigate={() => setOpen(false)} />
                    </SheetContent>
                </Sheet>

                <div className="relative w-full max-w-sm hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search anything..."
                        className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">


                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-foreground">Admin User</p>
                        <p className="text-xs text-muted-foreground">Super Administrator</p>
                    </div>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
