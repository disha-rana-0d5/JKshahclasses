
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import { User, Lock, Mail, Loader2, Camera, Shield, Key } from "lucide-react";
import { userApi } from "../api/api";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setFormData(prev => ({
                ...prev,
                name: userData.name || "",
                email: userData.email || ""
            }));
        }
    }, []);

    useEffect(() => {
        document.title = "My Profile | JK Shah Classes";
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const updateData: any = {
                name: formData.name,
            };

            if (formData.newPassword) {
                updateData.password = formData.newPassword;
            }

            const { ok, data } = await userApi.updateUser(user._id, updateData);

            if (!ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            const updatedUser = data;

            // Update local storage
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

            // Remove password from updated user object before storing
            const { password, ...userWithoutPassword } = updatedUser;
            const newUser = { ...currentUser, ...userWithoutPassword };

            localStorage.setItem("user", JSON.stringify(newUser));
            setUser(newUser);

            // Clear password fields
            setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));

            toast.success("Profile updated successfully");

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-10">
            <div className="container max-w-5xl px-4 md:px-6 mx-auto">
                <div className="mb-8 space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Account Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your profile information and security preferences.
                    </p>
                </div>

                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Sidebar / Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-border shadow-sm">
                            <CardHeader className="text-center pb-2">
                                <div className="mx-auto mb-4 relative">
                                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                        <AvatarImage src={user.image} alt={user.name} />
                                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                            {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-sm">
                                        <Camera className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </div>
                                <CardTitle className="text-xl">{user.name}</CardTitle>
                                <CardDescription className="text-sm">{user.email}</CardDescription>
                                <div className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                    Student Account
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Joined</span>
                                        <span className="font-medium">
                                            {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-green-600"></span>
                                            Active
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        <form onSubmit={handleSubmit}>
                            <Card className="border-border shadow-sm mb-6">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <User className="h-5 w-5 text-primary" />
                                        <CardTitle>Personal Information</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Update your personal details here.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Your Name"
                                            className="max-w-md"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                            className="max-w-md bg-muted/50"
                                        />
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Shield className="h-3 w-3" />
                                            Email address cannot be changed for security reasons.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-border shadow-sm">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Key className="h-5 w-5 text-primary" />
                                        <CardTitle>Security</CardTitle>
                                    </div>
                                    <CardDescription>
                                        Manage your password and security settings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative max-w-md">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="newPassword"
                                                name="newPassword"
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={handleChange}
                                                className="pl-9"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <div className="relative max-w-md">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="pl-9"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardContent className="pt-4 border-t bg-muted/20 flex justify-end">
                                    <Button type="submit" disabled={loading} className="min-w-[120px]">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </CardContent>
                            </Card>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
