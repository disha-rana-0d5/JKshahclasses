import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../../api/api";
import { useNavigate } from "react-router-dom";

export function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { ok, data } = await authApi.login({ email, password });

            if (ok) {
                if (data.role !== 'admin' && data.role !== 'timetable_manager') {
                    toast.error("Access denied. Only administrators can log in here.");
                    return;
                }
                // Store token in localStorage
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data));
                
                if (data.role === 'timetable_manager') {
                    toast.success("Timetable Manager logged in successfully!");
                    navigate("/admin/timetables");
                } else {
                    toast.success("Admin logged in successfully!");
                    navigate("/admin/dashboard");
                }
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (err) {
            toast.error("Failed to connect to the server. Please ensure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-white">
                <div>
                    <h1 className="text-4xl font-bold mb-4">JK Shah Classes</h1>
                    <p className="text-xl text-white/80">Admin Management Portal</p>
                </div>
                <div>
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            "Education is the most powerful weapon which you can use to change the world."
                        </p>
                        <footer className="text-sm text-white/80">- Nelson Mandela</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center p-8 bg-gray-50">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access the dashboard
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@rest.com"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-9"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    {/* Checkbox Placeholder */}
                                    <input type="checkbox" id="remember" className="rounded border-gray-300" />
                                    <label htmlFor="remember">Remember me</label>
                                </div>
                                <Button variant="link" className="px-0 font-normal" type="button" onClick={() => alert("Please contact IT support to reset password.")}>
                                    Forgot password?
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? "Signing in..." : "Sign In"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

