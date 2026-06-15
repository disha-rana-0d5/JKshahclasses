import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { branchEnquiryApi, courseApi } from "../../api/api";
import { cn } from "../ui/utils";

interface EnquireNowFormProps {
    branches: string[];
    onSuccess?: () => void;
    className?: string;
}

export function EnquireNowForm({ branches, onSuccess, className }: EnquireNowFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        course: "",
        branchName: "",
        otherCity: "",
        description: "",
    });

    const [courses, setCourses] = useState<string[]>([]);
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [openBranch, setOpenBranch] = useState(false);

    const sortedBranches = [...branches]
        .filter(b => b && b.trim() !== "")
        .sort((a, b) => a.localeCompare(b));
    const branchOptions = [...sortedBranches, "Other"];
    
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // Fetch all courses since backend ignores status filter, then filter locally
                const { ok, data } = await courseApi.getCourses({ limit: 1000 });
                if (ok && data.success) {
                    const activeCourses = (data.data || [])
                        .filter((c: any) => c.status === "Active")
                        .map((c: any) => c.title)
                        .filter(Boolean);
                    setCourses(activeCourses);
                }
            } catch {
                // ignore
            }
        };
        fetchCourses();
    }, []);

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", course: "", branchName: "", otherCity: "", description: "" });
        setOtpStep(false);
        setOtp("");
        setIsLoading(false);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.branchName || !formData.name || !formData.phone || !formData.email || !formData.course) {
            toast.error("Please fill all required fields");
            return;
        }
        if (formData.branchName === "Other" && !formData.otherCity) {
            toast.error("Please specify your city");
            return;
        }
        if (formData.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }
        setIsLoading(true);
        try {
            /* 
            // Commenting out OTP verification for now
            const { ok, data } = await branchEnquiryApi.sendOtp(formData.email);
            if (ok && data.success) {
                setOtpStep(true);
                toast.success(`OTP sent to ${formData.email}`);
            } else {
                toast.error(data.message || "Failed to send OTP. Please try again.");
            }
            */
            const { ok, data } = await branchEnquiryApi.submitBranchEnquiry({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                course: formData.course,
                branchName: formData.branchName === "Other" ? `Other - ${formData.otherCity}` : formData.branchName,
                description: formData.description,
            });

            if (ok && data.success) {
                toast.success("Enquiry submitted successfully!");
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                toast.error(data.message || "Failed to submit enquiry.");
            }
        } catch {
            toast.error("Failed to submit enquiry. Please check your connection.");
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
            const { ok: otpOk, data: otpData } = await branchEnquiryApi.verifyOtp(formData.email, otp);
            if (!otpOk || !otpData.success) {
                toast.error(otpData.message || "Invalid OTP. Please try again.");
                setIsLoading(false);
                return;
            }

            const { ok, data } = await branchEnquiryApi.submitBranchEnquiry({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                course: formData.course,
                branchName: formData.branchName === "Other" ? `Other - ${formData.otherCity}` : formData.branchName,
                description: formData.description,
            });

            if (ok && data.success) {
                toast.success("Enquiry submitted successfully!");
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                toast.error(data.message || "Failed to submit enquiry.");
            }
        } catch {
            toast.error("An error occurred during submission.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {!otpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    {/* Branch Dropdown */}
                    <div className="space-y-2">
                        <Label htmlFor="enquire-branch">Select Location *</Label>
                        <Popover open={openBranch} onOpenChange={setOpenBranch}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openBranch}
                                    className="w-full justify-between font-normal bg-white"
                                >
                                    {formData.branchName
                                        ? formData.branchName
                                        : "Select a branch..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Search branch..." />
                                    <CommandList>
                                        <CommandEmpty>No branch found.</CommandEmpty>
                                        <CommandGroup>
                                            {branchOptions.map((b, idx) => (
                                                <CommandItem
                                                    key={idx}
                                                    value={b}
                                                    onSelect={(currentValue) => {
                                                        // Use the original string 'b' because cmdk lowercases the value
                                                        setFormData({ ...formData, branchName: b });
                                                        setOpenBranch(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            formData.branchName === b ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {b}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {formData.branchName === "Other" && (
                        <div className="space-y-2">
                            <Label htmlFor="enquire-other-city">Specify your City/Location *</Label>
                            <Input
                                id="enquire-other-city"
                                placeholder="E.g. Pune, Nagpur..."
                                value={formData.otherCity}
                                onChange={(e) => setFormData({ ...formData, otherCity: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="enquire-name">Full Name *</Label>
                        <Input
                            id="enquire-name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="enquire-email">Email Address *</Label>
                        <Input
                            id="enquire-email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="enquire-phone">Phone Number *</Label>
                        <Input
                            id="enquire-phone"
                            type="tel"
                            placeholder="9876543210"
                            maxLength={10}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="enquire-course">Select Course *</Label>
                        <Select
                            value={formData.course}
                            onValueChange={(val) => setFormData({ ...formData, course: val })}
                        >
                            <SelectTrigger id="enquire-course">
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.length > 0 ? (
                                    courses.map((course, idx) => (
                                        <SelectItem key={idx} value={course}>{course}</SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="general" disabled>No courses available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="enquire-description">Description (Optional)</Label>
                        <Textarea
                            id="enquire-description"
                            placeholder="How can we help you?"
                            className="resize-none"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Enquiry"
                            )}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6 py-2">
                    <div className="space-y-2 text-center">
                        <Label>Enter Verification Code</Label>
                        <p className="text-sm text-muted-foreground">
                            We've sent a 4-digit code to <strong>{formData.email}</strong>
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <InputOTP maxLength={4} value={otp} onChange={(value) => setOtp(value)}>
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className="bg-white border border-gray-300 text-gray-900" />
                                <InputOTPSlot index={1} className="bg-white border border-gray-300 text-gray-900" />
                                <InputOTPSlot index={2} className="bg-white border border-gray-300 text-gray-900" />
                                <InputOTPSlot index={3} className="bg-white border border-gray-300 text-gray-900" />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white"
                            disabled={isLoading || otp.length !== 4}
                        >
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
        </div>
    );
}
