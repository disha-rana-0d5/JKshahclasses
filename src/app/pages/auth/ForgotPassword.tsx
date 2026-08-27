import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

import { toast } from "sonner";
import { authApi } from "../../api/api";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Forgot Password";
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { ok, data } = await authApi.forgotPassword(email);

            if (ok) {
                setIsSubmitted(true);
                toast.success("Reset link sent to your email!");
            } else {
                toast.error(data.message || "Failed to send reset link");
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
                        Reset your password
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your email and we'll send you a reset link
                    </p>
                </div>

                <Card className="shadow-xl border-0">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit}>
                            <CardHeader>
                                <CardTitle className="sr-only">Forgot Password</CardTitle>
                                <CardDescription className="sr-only">Enter email to reset password</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            className="pl-9"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pb-6">
                                <Button className="w-full" type="submit" disabled={isLoading}>
                                    {isLoading ? "Sending Link..." : "Send Reset Link"}
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
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                We have sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full mb-4"
                                onClick={() => setIsSubmitted(false)}
                            >
                                Try another email
                            </Button>
                            <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/90 block">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
