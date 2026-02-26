import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "../../api/api";

export function ResetPassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Reset Password | JK Shah Classes";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setIsLoading(true);

        try {
            const { ok, data } = await authApi.resetPassword(token!, password);

            if (ok) {
                setIsSuccess(true);
                toast.success("Password reset successful!");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                toast.error(data.message || "Failed to reset password");
            }
        } catch (err) {
            toast.error("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-6">
                    <Link to="/" className="inline-block">
                        <h2 className="text-3xl font-bold text-primary">JK Shah Classes</h2>
                    </Link>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Set new password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please enter your new password below
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    {!isSuccess ? (
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle className="sr-only">Reset Password</CardTitle>
                                <CardDescription className="sr-only">Enter new password</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-9"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-9"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pb-6">
                                <Button className="w-full" type="submit" disabled={isLoading}>
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </Button>
                                <div className="text-center">
                                    <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/90 flex items-center justify-center gap-1">
                                        <ArrowLeft className="w-3 h-3" />
                                        Back to Login
                                    </Link>
                                </div>
                            </CardFooter>
                        </form>
                    ) : (
                        <div className="text-center p-8">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Password Updated!</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Your password has been successfully reset. You will be redirected to login shortly...
                            </p>
                            <Link to="/login">
                                <Button className="w-full">
                                    Go to Login Now
                                </Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
