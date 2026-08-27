import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../../api/api";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Temporary redirect to external portal
        window.location.href = "https://new-online.jkshahclasses.com/";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { ok, data } = await authApi.login({ email, password });

            if (ok) {
                if (data.role !== 'student') {
                    toast.error("Access denied. Admin accounts cannot log in here.");
                    return;
                }
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data));
                toast.success("Logged in successfully!");

                let from = "/";
                if (location.state?.from) {
                    from = typeof location.state.from === "string" ? location.state.from : location.state.from.pathname || "/";
                }
                navigate(from, { replace: true });
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (err) {
            toast.error("Failed to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    // Return null or a simple message while redirecting, but keep the original JSX commented out or just hidden?
    // Actually, just returning the original JSX is fine, the useEffect will redirect immediately anyway.

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center p-4">
            <Link to="/" className="absolute top-4 left-4 flex items-center text-sm text-foreground hover:text-primary transition-colors">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Home
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your student account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="student@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
