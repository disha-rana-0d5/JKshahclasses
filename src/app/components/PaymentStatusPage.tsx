import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export function PaymentStatusPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(10);

    // Extract all parameters dynamically
    const queryParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value;
    }

    // Checking 'payment_stat', 'stat', or 'status' for success
    const isSuccess = 
        queryParams.payment_stat === "success" || 
        queryParams.payment_stat === "'success'" ||
        queryParams.stat === "success" ||
        queryParams.status === "success";

    useEffect(() => {
        if (!isSuccess) return;

        // Countdown timer for success only
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Automatically proceed with the same query parameters
                    navigate({ pathname: "/payment-success", search: searchParams.toString() });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, isSuccess, searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-outfit">
            <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-8">
                
                <div className="text-center">
                    {isSuccess ? (
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                    )}
                    <h2 className="text-3xl font-bold text-gray-900">
                        Payment {isSuccess ? "Successful!" : "Failed"}
                    </h2>
                    {isSuccess ? (
                        <p className="mt-2 text-gray-600">
                            Redirecting to the enquiry form in <span className="font-bold text-primary">{timeLeft} seconds</span>...
                        </p>
                    ) : (
                        <p className="mt-2 text-red-600 font-medium">
                            Your transaction could not be completed.
                        </p>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Transaction Details</h3>
                    <div className="space-y-3">
                        {Object.entries(queryParams).length > 0 ? (
                            Object.entries(queryParams).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center py-1">
                                    <span className="text-gray-500 font-medium capitalize">
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-gray-900 font-semibold truncate max-w-[60%]">
                                        {value.replace(/'/g, '')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-gray-500 text-sm text-center">No transaction details available in the URL.</div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    {isSuccess ? (
                        <Button 
                            onClick={() => navigate({ pathname: "/payment-success", search: searchParams.toString() })}
                            className="w-full sm:w-auto px-8"
                        >
                            Proceed to Form Now
                            <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={() => navigate("/")}
                            className="w-full sm:w-auto px-8"
                        >
                            Back to Home
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
