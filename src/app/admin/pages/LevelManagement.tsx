import { useState } from "react";
import { useCourseContext } from "../context/CourseContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Plus, Search, Trash2 } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../components/ui/pagination";
import { useEffect } from "react";

export function LevelManagement() {
    const { levels, addLevel, deleteLevel, loading, pagination, refreshLevels } = useCourseContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [newLevel, setNewLevel] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        refreshLevels({
            page: currentPage,
            limit: 10,
            search: searchQuery
        });
    }, [searchQuery, currentPage]);

    const filteredLevels = levels.filter(level =>
        level.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (newLevel.trim()) {
            addLevel(newLevel);
            setNewLevel("");
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Level Management</h2>
                <p className="text-muted-foreground">Add, Remove and search course levels.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search levels..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Input
                        placeholder="New level name..."
                        className="max-w-[250px]"
                        value={newLevel}
                        onChange={(e) => setNewLevel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Level
                    </Button>
                </div>
            </div>

            <div className="rounded-md border border-border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Level Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {levels.map((level) => (
                            <TableRow key={level._id}>
                                <TableCell className="font-medium">{level.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteLevel(level._id, level.name)}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {levels.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center py-10 text-muted-foreground">
                                    No levels found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination.levels && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {(pagination.levels.page - 1) * pagination.levels.limit + 1} to {Math.min(pagination.levels.page * pagination.levels.limit, pagination.levels.total)} of {pagination.levels.total} levels
                    </p>
                    <Pagination className="justify-end mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                                    }}
                                />
                            </PaginationItem>
                            {[...Array(pagination.levels.pages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        href="#"
                                        isActive={currentPage === i + 1}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentPage(i + 1);
                                        }}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < pagination.levels.pages) setCurrentPage(currentPage + 1);
                                    }}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
