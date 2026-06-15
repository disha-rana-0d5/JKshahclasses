import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Search, Pencil, Trash2, UserPlus, Upload, Loader2 } from "lucide-react";
import { productApi } from "../../api/api";
import { toast } from "sonner";
import { ImageUpload } from "../../components/ImageUpload";

interface ProductFaculty {
    _id: string;
    name: string;
    bio: string;
    image: string;
}

export function ProductFacultyManagement() {
    const [faculties, setFaculties] = useState<ProductFaculty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState("");
    const [editingFaculty, setEditingFaculty] = useState<ProductFaculty | null>(null);

    const fetchFaculties = async () => {
        setIsLoading(true);
        const { ok, data } = await productApi.getFaculties();
        if (ok && data.success) {
            setFaculties(data.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchFaculties();
    }, []);

    const handleSave = async () => {
        if (!name) return toast.error("Name is required");
        setIsSaving(true);
        const facultyData = { name, bio, image };
        const { ok, data } = editingFaculty
            ? await productApi.updateFaculty(editingFaculty._id, facultyData)
            : await productApi.addFaculty(facultyData);

        if (ok && data.success) {
            toast.success(editingFaculty ? "Faculty updated successfully" : "Faculty created successfully");
            setIsAdding(false);
            setEditingFaculty(null);
            setName("");
            setBio("");
            setImage("");
            fetchFaculties();
        } else {
            toast.error(data.message || `Failed to ${editingFaculty ? "update" : "create"} faculty`);
        }
        setIsSaving(false);
    };

    const handleEdit = (faculty: ProductFaculty) => {
        setEditingFaculty(faculty);
        setName(faculty.name);
        setBio(faculty.bio);
        setImage(faculty.image);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this faculty?")) return;
        setIsLoading(true);
        const { ok, data } = await productApi.deleteFaculty(id);
        if (ok && data.success) {
            toast.success("Faculty deleted successfully");
            fetchFaculties();
        } else {
            toast.error(data?.message || "Failed to delete faculty");
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Product Faculty Management</h2>
                    <p className="text-muted-foreground">Manage faculties specifically for books and other products.</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => { setEditingFaculty(null); setName(""); setBio(""); setImage(""); setIsAdding(true); }} className="bg-[#E94B64] hover:bg-[#D43F57] text-white">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New Faculty
                    </Button>
                )}
            </div>

            {isAdding ? (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>{editingFaculty ? "Edit Faculty" : "Add New Faculty"}</CardTitle>
                        <CardDescription>{editingFaculty ? "Update details for the faculty member." : "Enter details for the new product-specific faculty member."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="faculty-name">Full Name</Label>
                            <Input
                                id="faculty-name"
                                placeholder="Enter faculty name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Profile Picture</Label>
                            <ImageUpload
                                value={image}
                                onChange={setImage}
                                recommendedDimensions="400x400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="faculty-bio">Short Biography</Label>
                            <Textarea
                                id="faculty-bio"
                                placeholder="Briefly describe the faculty's expertise..."
                                className="min-h-[120px]"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => { setIsAdding(false); setEditingFaculty(null); }}>Cancel</Button>
                            <Button
                                className="bg-[#E94B64] hover:bg-[#D43F57] text-white"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingFaculty ? "Update Faculty" : "Create Faculty"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">All Faculties</CardTitle>
                                <div className="relative w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search faculties..." className="pl-8" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Image</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="max-w-[400px]">Bio</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {faculties.map((faculty) => (
                                            <TableRow key={faculty._id}>
                                                <TableCell>
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={faculty.image} alt={faculty.name} />
                                                        <AvatarFallback>{faculty.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell className="font-medium">{faculty.name}</TableCell>
                                                <TableCell className="text-muted-foreground truncate max-w-[400px]">
                                                    {faculty.bio}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(faculty)}>
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(faculty._id)} className="text-destructive">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
