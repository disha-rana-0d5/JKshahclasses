import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}

export function ListingPagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems = 0,
    itemsPerPage = 10
}: PaginationProps) {
    // Hide entirely if 0 or 1 page
    if (!totalItems || totalItems === 0 || totalPages <= 1) return null;

    const effectiveTotalItems = totalItems || 0;
    const effectiveTotalPages = totalPages || 1;
    const startItem = effectiveTotalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, effectiveTotalItems);

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground transition-all">
                Showing {startItem} to {endItem} of {effectiveTotalItems} {effectiveTotalItems === 1 ? 'entry' : 'entries'}
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1 || effectiveTotalPages <= 1}
                >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1 || effectiveTotalPages <= 1}
                >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center justify-center text-sm font-medium">
                    Page {currentPage} of {effectiveTotalPages}
                </div>

                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === effectiveTotalPages || effectiveTotalPages <= 1}
                >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(effectiveTotalPages)}
                    disabled={currentPage === effectiveTotalPages || effectiveTotalPages <= 1}
                >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
