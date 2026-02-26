import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { branchEnquiryApi } from "../../api/api";

interface BranchEnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    branchName: string;
    courses: string[];
}

export function BranchEnquiryModal({
    isOpen,
    onClose,
    branchName,
    courses,
}: BranchEnquiryModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        course: "",
        description: "",
    });

    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            course: "",
            description: "",
        });
        setOtpStep(false);
        setOtp("");
        setIsLoading(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.email || !formData.course) {
            toast.error("Please fill all required fields");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setIsLoading(true);
        try {
            const { ok, data } = await branchEnquiryApi.sendOtp(formData.email);
            if (ok && data.success) {
                setOtpStep(true);
                toast.success(`OTP sent to ${formData.email}`);
            } else {
                toast.error(data.message || "Failed to send OTP. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to send OTP. Please check your connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 4) {
            toast.error("Please enter a valid 4-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            // Step 1: Verify OTP
            const { ok: otpOk, data: otpData } = await branchEnquiryApi.verifyOtp(formData.email, otp);
            if (!otpOk || !otpData.success) {
                toast.error(otpData.message || "Invalid OTP. Please try again.");
                setIsLoading(false);
                return;
            }

            // Step 2: Submit enquiry
            const { ok, data } = await branchEnquiryApi.submitBranchEnquiry({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                course: formData.course,
                branchName: branchName,
                description: formData.description,
            });

            if (ok && data.success) {
                toast.success("Enquiry submitted successfully!");
                handleClose();
            } else {
                toast.error(data.message || "Failed to submit enquiry.");
            }
        } catch (error) {
            toast.error("An error occurred during submission.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Enquire Now - {branchName}
                    </DialogTitle>
                </DialogHeader>

                {!otpStep ? (
                    <form onSubmit={handleSendOtp} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="9876543210"
                                maxLength={10}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="course">Select Course *</Label>
                            <Select
                                value={formData.course}
                                onValueChange={(val) => setFormData({ ...formData, course: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.length > 0 ? (
                                        courses.map((course, idx) => (
                                            <SelectItem key={idx} value={course}>
                                                {course}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="general" disabled>
                                            No specific courses available
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="How can we help you?"
                                className="resize-none"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending OTP...
                                    </>
                                ) : (
                                    "Send OTP to Email"
                                )}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6 py-4">
                        <div className="space-y-2 text-center">
                            <Label>Enter Verification Code</Label>
                            <p className="text-sm text-muted-foreground">
                                We've sent a 4-digit code to <strong>{formData.email}</strong>
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={4}
                                value={otp}
                                onChange={(value) => setOtp(value)}
                            >
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={1} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={2} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={3} className="bg-white border border-gray-300 text-gray-900" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <div className="pt-4 flex flex-col gap-3">
                            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 4}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify & Submit"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setOtpStep(false)}
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
