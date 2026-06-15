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
import { branchEnquiryApi } from "../../api/api";
import { useCourseContext } from "../../admin/context/CourseContext";
import { cn } from "../ui/utils";

interface BranchEnquiryFormProps {
    branchName?: string;
    courses?: string[];
    branches?: { name: string; courses?: string[] }[];
    onSuccess?: () => void;
    className?: string;
}

export function BranchEnquiryForm({
    branchName = "",
    courses = [],
    branches = [],
    onSuccess,
    className
}: BranchEnquiryFormProps) {
    const [selectedBranch, setSelectedBranch] = useState(branchName);
    const [openBranch, setOpenBranch] = useState(false);

    // Sorted branches + Other
    const validBranches = branches.filter(b => b.name && b.name.trim() !== "");
    const sortedBranches = [...validBranches].sort((a, b) => a.name.localeCompare(b.name));
    const branchOptions = [...sortedBranches, { name: "Other", courses: [] }];

    // Update selected branch if prop changes
    useEffect(() => {
        if (branchName) setSelectedBranch(branchName);
    }, [branchName]);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        course: "",
        otherCity: "",
        description: "",
    });

    const { allCourses } = useCourseContext();

    const rawCourses = branches.length > 0 
        ? (branches.find(b => b.name === selectedBranch)?.courses || [])
        : courses;

    const currentCourses = rawCourses.filter(courseTitle => {
        if (!allCourses || allCourses.length === 0) return true;
        
        const normalizedTitle = (courseTitle || "").trim().toLowerCase();
        const foundCourse = allCourses.find(c => (c.title || "").trim().toLowerCase() === normalizedTitle);
        
        if (foundCourse) {
            return foundCourse.status === "Active";
        }
        return true;
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
            otherCity: "",
            description: "",
        });
        setOtpStep(false);
        setOtp("");
        setIsLoading(false);
    };

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.email || !formData.course || !selectedBranch) {
            toast.error("Please fill all required fields");
            return;
        }
        if (selectedBranch === "Other" && !formData.otherCity) {
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
                branchName: selectedBranch === "Other" ? `Other - ${formData.otherCity}` : selectedBranch,
                description: formData.description,
            });

            if (ok && data.success) {
                toast.success("Enquiry submitted successfully!");
                resetForm();
                if (onSuccess) onSuccess();
            } else {
                toast.error(data.message || "Failed to submit enquiry.");
            }
        } catch (error) {
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
                branchName: selectedBranch === "Other" ? `Other - ${formData.otherCity}` : selectedBranch,
                description: formData.description,
            });

            if (ok && data.success) {
                toast.success("Enquiry submitted successfully!");
                resetForm();
                if (onSuccess) onSuccess();
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
        <div className={cn("space-y-4", className)}>
            {!otpStep ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        {/* Left Column */}
                        <div className="space-y-4">
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
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {branchOptions.length > 0 ? (
                                <div className="space-y-2">
                                    <Label htmlFor="branch">Select Location *</Label>
                                    <Popover open={openBranch} onOpenChange={setOpenBranch}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openBranch}
                                                className="w-full justify-between font-normal bg-white"
                                            >
                                                {selectedBranch
                                                    ? selectedBranch
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
                                                        {branchOptions.map((branch, idx) => (
                                                            <CommandItem
                                                                key={idx}
                                                                value={branch.name}
                                                                onSelect={(currentValue) => {
                                                                    // Use original branch name
                                                                    setSelectedBranch(branch.name);
                                                                    setFormData({ ...formData, course: "" }); // Reset course when branch changes
                                                                    setOpenBranch(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedBranch === branch.name ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {branch.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            ) : null}

                            {selectedBranch === "Other" && (
                                <div className="space-y-2">
                                    <Label htmlFor="other-city">Specify your City/Location *</Label>
                                    <Input
                                        id="other-city"
                                        placeholder="E.g. Pune, Nagpur..."
                                        value={formData.otherCity}
                                        onChange={(e) => setFormData({ ...formData, otherCity: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

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
                                        {currentCourses.length > 0 ? (
                                            currentCourses.map((course, idx) => (
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
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="How can we help you?"
                            className="resize-none"
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="pt-2">
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
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

                    <div className="pt-2 flex flex-col gap-3">
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading || otp.length !== 4}>
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
