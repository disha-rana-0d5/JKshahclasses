import { ReactNode } from "react";
import { AdminHeader } from "../components/AdminHeader";
import { AdminSidebar } from "../components/AdminSidebar";

interface AdminLayoutProps {
    children: ReactNode;
    currentPage?: string; // Optional to satisfy legacy usage if any, but we ignore it
    onNavigate?: (page: string) => void;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-muted/40 font-sans">
            <AdminSidebar />

            <div className="md:pl-64 flex flex-col min-h-screen">
                <AdminHeader />

                <main className="flex-1 p-6 overflow-x-hidden">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
