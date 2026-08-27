"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Clock, CheckCircle2, Check, ChevronsUpDown } from "lucide-react";
import { erpCourseApi, paymentEnquiryApi } from "../../api/api";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../ui/utils";

interface BatchEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: any;
    topic?: any; // If null, assumes full course
    batches: any[];
    branches: any[];
}

export function BatchEnrollmentModal({
    isOpen,
    onClose,
    course,
    topic,
    batches,
    branches
}: BatchEnrollmentModalProps) {
    const [selectedMode, setSelectedMode] = useState<"f2f" | "online" | "recorded">("f2f");
    const [selectedLocation, setSelectedLocation] = useState<string>("");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("");
    const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
    const [erpCourses, setErpCourses] = useState<any[]>([]);
    const [selectedErpCourses, setSelectedErpCourses] = useState<string[]>([]);
    const [erpBranches, setErpBranches] = useState<any[]>([]);
    const [feeCategories, setFeeCategories] = useState<any[]>([]);
    const [selectedFeeCategory, setSelectedFeeCategory] = useState<string>("");
    const [feeAmount, setFeeAmount] = useState<number | null>(null);
    const [isLoadingFee, setIsLoadingFee] = useState<boolean>(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [userDetails, setUserDetails] = useState({
        firstname: "",
        email: "",
        stuMobNo: ""
    });
    const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
    const [locationPopoverOpen, setLocationPopoverOpen] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [enteredOtp, setEnteredOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [showAdminAlert, setShowAdminAlert] = useState(false);
    const [selectedInstallmentsCount, setSelectedInstallmentsCount] = useState<number | null>(null);
    const [erpBatches, setErpBatches] = useState<any[]>([]);

    // Reset state when modal opens or topic changes
    useEffect(() => {
        if (isOpen) {
            setSelectedMode("f2f");
            setSelectedLocation("");
            setSelectedLanguage("");
            setSelectedBatchId(null);
            setSelectedErpCourses([]);
            setSelectedFeeCategory("");
            setFeeAmount(null);
            setStep(1);
            setUserDetails({ firstname: "", email: "", stuMobNo: "" });
            setIsInitiatingPayment(false);
            setIsOtpSent(false);
            setEnteredOtp("");
            setGeneratedOtp("");
            setIsOtpVerified(false);
            setIsSendingOtp(false);
            setSelectedInstallmentsCount(null);

            // Fetch ERP Courses on modal open based on course
            const fetchErpData = async () => {
                try {
                    // Fetch ERP branches and fee categories in parallel
                    const [branchesRes, feeCatgRes] = await Promise.all([
                        erpCourseApi.fetchExternalERPBranchDetails(),
                        erpCourseApi.fetchExternalERPFeeCategoryDetails()
                    ]);

                    if (branchesRes.ok && branchesRes.data?.data) {
                        setErpBranches(branchesRes.data.data);
                    }
                    if (feeCatgRes.ok && feeCatgRes.data?.data) {
                        setFeeCategories(feeCatgRes.data.data);
                        if (feeCatgRes.data.data.length > 0) {
                            setSelectedFeeCategory(feeCatgRes.data.data[0].catg);
                        }
                    }

                    // Fetch mappings from DB
                    const mappingsRes = await erpCourseApi.getMappings();
                    const mappings: Record<string, any> = {};
                    if (mappingsRes.ok && mappingsRes.data?.data) {
                        mappingsRes.data.data.forEach((m: any) => {
                            mappings[m.erpCourseId] = {
                                category: m.category,
                                subCategory: m.subCategory,
                                isVisible: m.isVisible
                            };
                        });
                    }

                    // Fetch external ERP courses
                    const coursesRes = await erpCourseApi.fetchExternalERPCourses();

                    if (coursesRes.ok && coursesRes.data?.data) {
                        const matchingCourses = coursesRes.data.data.filter((c: any) => {
                            const mapping = mappings[c.levelId];
                            if (!mapping) return false;
                            if (mapping.isVisible !== true) return false;
                            return mapping.category === course.category && mapping.subCategory === course.subCategory;
                        });
                        setErpCourses(matchingCourses);
                        if (matchingCourses.length > 0) {
                            setSelectedErpCourses([matchingCourses[0].levelId?.toString()]);
                        }
                    }
                } catch (e) {
                    console.error("Error fetching ERP data:", e);
                }
            };
            fetchErpData();
        }
    }, [isOpen, topic, course]);

    // Fetch Fee based on selections
    useEffect(() => {
        const fetchFee = async () => {
            if (!selectedFeeCategory) {
                setFeeAmount(null);
                return;
            }

            // Find branchId (compId) from selected location (which is currently the branchName or similar)
            let branchId = "JKSHAH0001"; // Default fallback
            if (selectedLocation) {
                const matchedErpBranch = erpBranches.find(b =>
                    b.branchName.toLowerCase() === selectedLocation.toLowerCase() ||
                    b.compId === selectedLocation
                );
                if (matchedErpBranch) {
                    branchId = matchedErpBranch.compId;
                }
            }

            const erpCourse = erpCourses.find(c => c.levelId?.toString() === selectedErpCourses[0]);
            const batch = batches.find(b => b._id === selectedBatchId);
            const courseId = batch?.courseId || erpCourse?.courseId || erpCourse?.deptRef || "150";
            const levelId = batch?.levelId || erpCourse?.levelId || "201";
            const attemptId = batch?.attemptId || batch?.examAttemptId || "300";
            const batchId = batch?.batchId || batch?.erpBatchId || "1";

            try {
                setIsLoadingFee(true);
                const [feeRes, batchDetailsRes] = await Promise.all([
                    erpCourseApi.fetchExternalERPFeeData({
                        branchId,
                        courseId: courseId.toString(),
                        levelId: levelId.toString(),
                        attemptId: attemptId.toString(),
                        batchId: batchId.toString(),
                        feeCatg: selectedFeeCategory
                    }),
                    erpCourseApi.fetchExternalERPBatchDetails(courseId, levelId)
                ]);

                if (feeRes.ok && feeRes.data?.data && feeRes.data.data.length > 0) {
                    setFeeAmount(feeRes.data.data[0].amount);
                } else {
                    setFeeAmount(null);
                }

                if (batchDetailsRes.ok && batchDetailsRes.data?.data) {
                    setErpBatches(batchDetailsRes.data.data);
                } else {
                    setErpBatches([]);
                }
            } catch (e) {
                console.error("Error fetching fee:", e);
                setFeeAmount(null);
            } finally {
                setIsLoadingFee(false);
            }
        };

        fetchFee();
    }, [selectedLocation, selectedFeeCategory, selectedBatchId, selectedErpCourses, erpBranches, erpCourses, batches]);

    // Auto-fill user details if mobile number is 10 digits
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (userDetails.stuMobNo && userDetails.stuMobNo.length >= 10) {
                try {
                    // Extract exactly 10 digits from right to handle +91 case
                    const cleanMobile = userDetails.stuMobNo.replace(/\D/g, '').slice(-10);
                    if (cleanMobile.length === 10) {
                        const res = await paymentEnquiryApi.getEnquiryByMobile(cleanMobile);
                        if (res.ok && res.data?.success && res.data.data) {
                            setUserDetails(prev => ({
                                ...prev,
                                firstname: prev.firstname || res.data.data.firstName || "",
                                email: prev.email || res.data.data.email || ""
                            }));
                            setIsOtpVerified(true);
                            setIsExistingUser(true);
                        } else {
                            setIsOtpVerified(false);
                            setIsExistingUser(false);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch user details by mobile", err);
                    setIsOtpVerified(false);
                    setIsExistingUser(false);
                }
            }
        };
        fetchUserDetails();
    }, [userDetails.stuMobNo]);

    // If topic is not provided, we effectively treat the course itself as the topic (full course)
    // But we need to handle "subjects". If the course object doesn't have subjects structure same as topic,
    // we need to adapt or just show "Full Course" as a single subject.
    const getEffectiveTopic = () => {
        if (topic) return topic;

        let subjects = [];
        if (course?.syllabusModules) {
            const allSubjects = course.syllabusModules.flatMap((module: any) =>
                (module.topics || []).flatMap((t: any) =>
                    typeof t !== 'string' && t.subjects ? t.subjects : []
                )
            );
            // Remove duplicates
            const uniqueNames = new Set();
            subjects = allSubjects.filter((s: any) => {
                const name = typeof s === 'string' ? s : s.name;
                if (uniqueNames.has(name)) return false;
                uniqueNames.add(name);
                return true;
            });
        }

        if (subjects.length === 0) {
            subjects = [{ name: "Full Course Access", price: course?.price || "0" }];
        }

        return {
            title: course?.title,
            subjects: subjects
        };
    };

    const effectiveTopic = getEffectiveTopic();

    const f2fLocations = Array.from(new Set(branches.filter(b => !(b.name as string).toLowerCase().includes('online')).map(b => b.name as string))).sort((a, b) => a.localeCompare(b));
    const onlineLocations = Array.from(new Set(branches.filter(b => (b.name as string).toLowerCase().includes('online')).map(b => b.name as string))).sort((a, b) => a.localeCompare(b));

    const getFilteredBatches = () => {
        if (!course) return [];
        const modeLabel = selectedMode === "f2f" ? "Face to Face" : selectedMode === "online" ? "Live Online" : "Recorded";

        return batches.filter(b => {
            const modeMatch = b.mode === modeLabel;

            const courseSubCat = course.subCategory || "";
            const courseCat = course.category || "";
            const courseLevel = course.level || "";

            // Check if either course category or subcategory matches any of the batch categories
            const batchCats: string[] = (b.categories && b.categories.length > 0) ? b.categories : (b.category ? [b.category] : []);
            const catMatch = batchCats.some((cat: string) => {
                const cCat = courseCat.toLowerCase();
                const cSubCat = courseSubCat.toLowerCase();
                const bCat = cat.toLowerCase();

                return (courseSubCat && bCat.includes(cSubCat)) ||
                    (courseCat && bCat.includes(cCat)) ||
                    (courseSubCat && cSubCat.includes(bCat)) ||
                    (courseCat && cCat.includes(bCat));
            });

            // If Face to Face, also filter by location
            if (selectedMode === "f2f") {
                if (!selectedLocation) return false;
                const locationMatch = Array.isArray(b.location)
                    ? b.location.includes(selectedLocation)
                    : b.location === selectedLocation;
                return modeMatch && catMatch && locationMatch;
            }

            // If Live Online, filter by language if one is selected, and also location
            if (selectedMode === "online") {
                if (!selectedLocation) return false;
                const locationMatch = Array.isArray(b.location)
                    ? b.location.includes(selectedLocation)
                    : b.location === selectedLocation;

                if (selectedLanguage) {
                    return modeMatch && catMatch && locationMatch && b.language === selectedLanguage;
                }
                return modeMatch && catMatch && locationMatch;
            }

            return modeMatch && catMatch;
        });
    };

    const handleErpCourseToggle = (courseId: string) => {
        setSelectedErpCourses([courseId]); // Only allow single selection for fee mapping simplicity
    };

    const calculateTotalPrice = () => {
        return feeAmount || 0;
    };

    const handleProceed = () => {
        if (!selectedBatchId && getFilteredBatches().length > 0) {
            toast.error("Please select a batch first");
            return;
        }
        if (erpCourses.length > 0 && selectedErpCourses.length === 0) {
            toast.error("Please select a related ERP course");
            return;
        }
        setStep(2);
    };

    const handleSendOtp = async () => {
        if (!userDetails.stuMobNo || userDetails.stuMobNo.length < 10) {
            toast.error("Please enter a valid mobile number");
            return;
        }
        if (!userDetails.email) {
            toast.error("Please enter email address first");
            return;
        }

        setIsSendingOtp(true);
        try {
            const mobileWithCode = userDetails.stuMobNo.startsWith('+') ? userDetails.stuMobNo : `+91${userDetails.stuMobNo}`;
            const response = await paymentEnquiryApi.sendOtp({
                mobile: mobileWithCode,
                email: userDetails.email,
            });

            if (response.ok && response.data?.success && response.data.data?.otp) {
                toast.success("OTP sent successfully");
                setGeneratedOtp(response.data.data.otp);
                setIsOtpSent(true);
            } else {
                toast.error(response.data?.message || "Failed to send OTP");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast.error("An error occurred while sending OTP");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleVerifyOtp = () => {
        if (enteredOtp === generatedOtp) {
            setIsOtpVerified(true);
            toast.success("Mobile number verified successfully");
        } else {
            toast.error("Invalid OTP");
        }
    };

    const getInstallmentsArray = () => {
        if (!selectedInstallmentsCount || !feeAmount) return [];
        
        const count = selectedInstallmentsCount;
        const baseAmount = Math.floor(feeAmount / count);
        const remainder = feeAmount % count;
        
        const installments = [];
        const today = new Date();
        
        for (let i = 0; i < count; i++) {
            const dueDate = new Date(today);
            dueDate.setMonth(dueDate.getMonth() + i);
            
            // Format to YYYY-MM-DD
            const year = dueDate.getFullYear();
            const month = String(dueDate.getMonth() + 1).padStart(2, '0');
            const day = String(dueDate.getDate()).padStart(2, '0');
            
            installments.push({
                dueDate: `${year}-${month}-${day}`,
                amount: i === 0 ? baseAmount + remainder : baseAmount
            });
        }
        
        return installments;
    };

    const handlePaymentInitiation = async () => {
        if (!userDetails.firstname || !userDetails.email || !userDetails.stuMobNo) {
            toast.error("Please fill in all details");
            return;
        }

        if (isExistingUser) {
            setShowAdminAlert(true);
            return;
        }

        // OTP check enabled
        if (!isOtpVerified) {
            toast.error("Please verify your mobile number before proceeding");
            return;
        }

        const erpCourse = erpCourses.find(c => c.levelId?.toString() === selectedErpCourses[0]);
        const batch = batches.find(b => b._id === selectedBatchId);
        const courseId = batch?.courseId || erpCourse?.courseId || erpCourse?.deptRef || "150";
        const levelId = batch?.levelId || erpCourse?.levelId || "201";
        const attemptId = batch?.attemptId || batch?.examAttemptId || "300";
        const batchId = batch?.batchId || batch?.erpBatchId || "1";

        let branchId = "JKSHAH0001";
        if (selectedLocation) {
            const matchedErpBranch = erpBranches.find(b =>
                b.branchName.toLowerCase() === selectedLocation.toLowerCase() ||
                b.compId === selectedLocation
            );
            if (matchedErpBranch) {
                branchId = matchedErpBranch.compId;
            }
        }

        setIsInitiatingPayment(true);
        try {
            // 1. Call Registration API first
            const registerPayload: any = {
                firstName: userDetails.firstname,
                lastName: "static",
                email: userDetails.email,
                phone: userDetails.stuMobNo,
                course: courseId.toString(),
                level: levelId.toString(),
                attempt: attemptId.toString(),
                batch: batchId.toString(),
                feeCatg: selectedFeeCategory,
                branchId: branchId,
            };

            if (selectedFeeCategory === "JODO_INSTALLMENT" || selectedFeeCategory === "SMARTPAY_EMI") {
                registerPayload.installments = getInstallmentsArray();
            }

            const regResponse = await fetch("https://edu.jkshahcloud.com:5004/authentication/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-key": "jkshah_cloud_secret_auth_live_2025",
                },
                body: JSON.stringify(registerPayload),
            });

            const regData = await regResponse.json();

            let enqId = "";
            if (regData.success && regData.data?.enq_id) {
                enqId = regData.data.enq_id.toString();
            } else {
                toast.error(regData.message || "Registration failed before payment");
                setIsInitiatingPayment(false);
                return;
            }

            let finalPaymentAmount = feeAmount || 0;
            if ((selectedFeeCategory === "JODO_INSTALLMENT" || selectedFeeCategory === "SMARTPAY_EMI") && selectedInstallmentsCount) {
                const installmentsArray = getInstallmentsArray();
                if (installmentsArray && installmentsArray.length > 0) {
                    finalPaymentAmount = installmentsArray[0].amount;
                }
            }

            // 2. Prepare payment payload with the received enq_id
            const payload = {
                amount: finalPaymentAmount.toString(),
                stuRef: enqId,
                acadYear: "101",
                rollNo: "55",
                firstname: userDetails.firstname,
                email: userDetails.email,
                stuMobNo: userDetails.stuMobNo,
                type: "websiteinquiry",
                admSrc: "149",
                schdlRef: "12",
                payType: "3",
                stuId: enqId,
                course: courseId.toString(),
                level: levelId.toString(),
                attempt: attemptId.toString(),
                batch: batchId.toString(),
                productinfo: "FeePayment",
                date: new Date().toISOString().split('T')[0],
                compId: branchId,
                finGrp: "JKSHAHGRP1"
            };

            // Save the enquiry details in our local DB before payment
            try {
                await paymentEnquiryApi.createEnquiry({
                    enqId: enqId,
                    firstName: userDetails.firstname,
                    email: userDetails.email,
                    mobileNumber: userDetails.stuMobNo,
                    course: course?.title || erpCourse?.courseName || courseId.toString(),
                    level: course?.level || batch?.level || erpCourse?.levelName || levelId.toString(),
                    attempt: batch?.examAttempt || erpCourse?.attemptName || attemptId.toString(),
                    batch: batchId.toString(),
                    amount: finalPaymentAmount.toString(),
                    acadYear: payload.acadYear,
                    rollNo: payload.rollNo,
                    type: payload.type,
                    admSrc: payload.admSrc,
                    schdlRef: payload.schdlRef,
                    payType: payload.payType,
                    productinfo: payload.productinfo,
                    compId: selectedLocation || payload.compId,
                    finGrp: payload.finGrp
                });
            } catch (err) {
                console.error("Failed to save local payment enquiry", err);
            }

            const response = await erpCourseApi.initiateEasebuzzPayment(payload);

            if (response.ok && response.data?.success) {
                toast.success("Payment Initiated Successfully");
                const paymentUrl = response.data.data?.paymentUrl;
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                } else {
                    toast.error("Payment URL not found in response");
                }
            } else {
                toast.error(response.data?.message || "Failed to initiate payment");
            }
        } catch (error) {
            console.error("Payment initiation error:", error);
            toast.error("An error occurred during payment initiation");
        } finally {
            setIsInitiatingPayment(false);
        }
    };

    if (!course) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="w-[95%] rounded-xl sm:max-w-[570px] max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">Customise Your Selection</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            Select the subjects you want to enroll in for {effectiveTopic.title}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        {step === 1 ? (
                            <>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h5 className="font-bold text-slate-800 mb-1">{effectiveTopic.title}</h5>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Multiple Subject Enrollment</p>
                                </div>

                                <Tabs defaultValue="f2f" className="w-full" value={selectedMode} onValueChange={(v: any) => { setSelectedMode(v); setSelectedBatchId(null); setSelectedLocation(""); setSelectedLanguage(""); }}>
                                    <TabsList className="w-full grid grid-cols-3 h-auto min-h-10 p-1 bg-slate-100 rounded-lg">
                                        <TabsTrigger value="f2f" className="text-[11px] font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-normal text-center leading-tight py-1.5">Face to Face</TabsTrigger>
                                        <TabsTrigger value="online" className="text-[11px] font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-normal text-center leading-tight py-1.5">Live Online</TabsTrigger>
                                        <TabsTrigger value="recorded" className="text-[11px] font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white whitespace-normal text-center leading-tight py-1.5">Recorded</TabsTrigger>
                                    </TabsList>

                                    <div className="mt-4 space-y-4">
                                        {selectedMode === "f2f" && (
                                            <div className="space-y-2 flex flex-col">
                                                <Label className="text-xs font-bold text-slate-700">Select Location</Label>
                                                <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={locationPopoverOpen}
                                                            className="w-full justify-between bg-white border-2 border-slate-100 rounded-xl h-10 font-normal hover:bg-slate-50"
                                                        >
                                                            <span className="truncate text-left block flex-1">{selectedLocation ? f2fLocations.find((loc) => loc === selectedLocation) || selectedLocation : "Choose a branch..."}</span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }} align="start">
                                                        <Command>
                                                            <CommandInput placeholder="Search branch..." />
                                                            <CommandList>
                                                                <CommandEmpty>No branch found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {f2fLocations.map((loc) => (
                                                                        <CommandItem
                                                                            key={loc}
                                                                            value={loc}
                                                                            onSelect={() => {
                                                                                setSelectedLocation(loc);
                                                                                setSelectedBatchId(null);
                                                                                setLocationPopoverOpen(false);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    selectedLocation === loc ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {loc}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        )}

                                        {selectedMode === "online" && (
                                            <div className="space-y-4">
                                                <div className="space-y-2 flex flex-col">
                                                    <Label className="text-xs font-bold text-slate-700">Select Location</Label>
                                                    <Popover open={locationPopoverOpen} onOpenChange={setLocationPopoverOpen}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={locationPopoverOpen}
                                                                className="w-full justify-between bg-white border-2 border-slate-100 rounded-xl h-10 font-normal hover:bg-slate-50"
                                                            >
                                                                <span className="truncate text-left block flex-1">{selectedLocation ? onlineLocations.find((loc) => loc === selectedLocation) || selectedLocation : "Choose a branch..."}</span>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }} align="start">
                                                            <Command>
                                                                <CommandInput placeholder="Search branch..." />
                                                                <CommandList>
                                                                    <CommandEmpty>No branch found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {onlineLocations.map((loc) => (
                                                                            <CommandItem
                                                                                key={loc}
                                                                                value={loc}
                                                                                onSelect={() => {
                                                                                    setSelectedLocation(loc);
                                                                                    setSelectedBatchId(null);
                                                                                    setLocationPopoverOpen(false);
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        "mr-2 h-4 w-4",
                                                                                        selectedLocation === loc ? "opacity-100" : "opacity-0"
                                                                                    )}
                                                                                />
                                                                                {loc}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-slate-700">Select Language <span className="text-slate-400 font-normal">(Optional)</span></Label>
                                                    <Select value={selectedLanguage} onValueChange={(v) => { setSelectedLanguage(v); setSelectedBatchId(null); }}>
                                                        <SelectTrigger className="w-full bg-white border-2 border-slate-100 rounded-xl h-10">
                                                            <SelectValue placeholder="Choose a language..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="English">English</SelectItem>
                                                            <SelectItem value="Hindi">Hindi</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Batch Selection */}
                                        <div className="space-y-2">
                                            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Available Batches</h5>
                                            {/* Desktop Table View */}
                                            <div className="hidden md:block rounded-xl border-2 border-slate-100 overflow-hidden bg-white">
                                                <Table>
                                                    <TableHeader className="bg-slate-50">
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead className="text-[10px] font-bold h-8 uppercase whitespace-nowrap w-[85px]">Start Date</TableHead>
                                                            <TableHead className="text-[10px] font-bold h-8 uppercase whitespace-normal min-w-[120px]">Batch Name</TableHead>
                                                            <TableHead className="text-[10px] font-bold h-8 uppercase whitespace-nowrap w-[90px]">Attempt</TableHead>
                                                            <TableHead className="text-[10px] font-bold h-8 text-right pr-4 whitespace-nowrap w-[60px]">Select</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {getFilteredBatches().length > 0 ? (
                                                            getFilteredBatches().map((batch) => (
                                                                <TableRow
                                                                    key={batch._id}
                                                                    className={`cursor-pointer transition-colors ${selectedBatchId === batch._id ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
                                                                    onClick={() => setSelectedBatchId(batch._id)}
                                                                >
                                                                    <TableCell className="py-2 text-xs font-bold text-primary whitespace-nowrap align-middle">{batch.startDate}</TableCell>
                                                                    <TableCell className="py-2 text-[11px] text-slate-600 font-medium whitespace-normal leading-tight align-middle">{batch.dayTiming}</TableCell>
                                                                    <TableCell className="py-2 whitespace-normal align-middle">
                                                                        <div className="flex flex-wrap gap-1">
                                                                            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{batch.examAttempt}</span>
                                                                            {batch.language && <span className="text-[9px] bg-primary/10 px-1.5 py-0.5 rounded text-primary font-bold uppercase">{batch.language}</span>}
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="py-2 text-right pr-4 whitespace-nowrap align-middle">
                                                                        <div className={`w-4 h-4 rounded-full border-2 ml-auto ${selectedBatchId === batch._id ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                                                            {selectedBatchId === batch._id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5" />}
                                                                        </div>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={4} className="text-center py-8 text-slate-400 text-xs italic whitespace-normal">
                                                                    {(selectedMode === "f2f" || selectedMode === "online") && !selectedLocation ? "Please select a location first." : "No batches available for this selection."}
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            {/* Mobile Card View */}
                                            <div className="md:hidden space-y-2">
                                                {getFilteredBatches().length > 0 ? (
                                                    getFilteredBatches().map((batch) => (
                                                        <div
                                                            key={batch._id}
                                                            onClick={() => setSelectedBatchId(batch._id)}
                                                            className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedBatchId === batch._id
                                                                ? 'border-primary bg-primary/5 shadow-sm'
                                                                : 'border-slate-100 hover:border-slate-200 bg-white'
                                                                }`}
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div>
                                                                    <p className="text-xs font-bold text-primary mb-0.5">{batch.startDate}</p>
                                                                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{batch.examAttempt}</span>
                                                                    {batch.language && <span className="text-[9px] bg-primary/10 px-1.5 py-0.5 rounded text-primary font-bold uppercase ml-1">{batch.language}</span>}
                                                                </div>
                                                                <div className={`w-4 h-4 rounded-full border-2 ${selectedBatchId === batch._id ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                                                    {selectedBatchId === batch._id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5" />}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                {batch.dayTiming}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                                        {(selectedMode === "f2f" || selectedMode === "online") && !selectedLocation ? "Please select a location first." : "No batches available for this selection."}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Type Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-700">Select Payment Type</Label>
                                            <Select value={selectedFeeCategory} onValueChange={setSelectedFeeCategory}>
                                                <SelectTrigger className="w-full bg-white border-2 border-slate-100 rounded-xl h-10">
                                                    <SelectValue placeholder="Choose a payment type..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {feeCategories.map((cat, idx) => (
                                                        <SelectItem key={idx} value={cat.catg}>{cat.descr}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Installments Selection */}
                                        {(selectedFeeCategory === "JODO_INSTALLMENT" || selectedFeeCategory === "SMARTPAY_EMI") && selectedBatchId && (
                                            <div className="space-y-2 mt-4">
                                                <Label className="text-xs font-bold text-slate-700">Select Number of Installments</Label>
                                                <Select 
                                                    value={selectedInstallmentsCount?.toString() || ""} 
                                                    onValueChange={(v) => setSelectedInstallmentsCount(parseInt(v))}
                                                >
                                                    <SelectTrigger className="w-full bg-white border-2 border-slate-100 rounded-xl h-10">
                                                        <SelectValue placeholder="Choose number of installments..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {(() => {
                                                            const batch = batches.find(b => b._id === selectedBatchId);
                                                            const batchId = batch?.batchId || batch?.erpBatchId || "1";
                                                            const erpBatch = erpBatches.find(b => b.batchId?.toString() === batchId.toString());
                                                            const max = erpBatch?.installments || 1;
                                                            return Array.from({ length: max }).map((_, i) => (
                                                                <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1} Installment{i > 0 ? 's' : ''}</SelectItem>
                                                            ));
                                                        })()}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* ERP Courses Selection */}
                                        {erpCourses.length > 0 && (
                                            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                                                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Related ERP Courses</h5>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                                    {erpCourses.map((erpCourse: any) => {
                                                        const isChecked = selectedErpCourses.includes(erpCourse.levelId?.toString());
                                                        return (
                                                            <div
                                                                key={erpCourse.levelId}
                                                                className={`flex items-start gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${isChecked ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                                                onClick={() => handleErpCourseToggle(erpCourse.levelId?.toString())}
                                                            >
                                                                <Checkbox
                                                                    checked={isChecked}
                                                                    className="h-4 w-4 border-2 mt-0.5"
                                                                />
                                                                <div>
                                                                    <Label className="text-xs font-bold text-slate-700 cursor-pointer line-clamp-2 leading-tight">
                                                                        {erpCourse.course} - {erpCourse.level}
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Tabs>
                            </>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                                    <h5 className="font-bold text-slate-800 mb-1">Student Details</h5>
                                    <p className="text-xs text-slate-500 font-medium">Please provide your details to proceed with payment.</p>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-slate-700">Full Name</Label>
                                    <Input
                                        placeholder="Enter your full name"
                                        value={userDetails.firstname}
                                        onChange={(e) => setUserDetails(prev => ({ ...prev, firstname: e.target.value }))}
                                        className="bg-white border-2 border-slate-100 rounded-xl h-10"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={userDetails.email}
                                        onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                                        className="bg-white border-2 border-slate-100 rounded-xl h-10"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-bold text-slate-700">Mobile Number</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="tel"
                                            placeholder="Enter your mobile number"
                                            value={userDetails.stuMobNo}
                                            onChange={(e) => {
                                                setUserDetails(prev => ({ ...prev, stuMobNo: e.target.value }));
                                                setIsOtpSent(false);
                                                setIsOtpVerified(false);
                                                setIsExistingUser(false);
                                            }}
                                            disabled={isOtpVerified}
                                            className="bg-white border-2 border-slate-100 rounded-xl h-10 flex-1"
                                        />
                                        <Button
                                            onClick={handleSendOtp}
                                            disabled={isOtpVerified || isSendingOtp || userDetails.stuMobNo.length < 10}
                                            className="h-10 px-4 rounded-xl font-bold bg-slate-900 hover:bg-slate-800 text-white"
                                        >
                                            {isOtpVerified ? "Verified" : isSendingOtp ? "Sending..." : isOtpSent ? "Resend OTP" : "Send OTP"}
                                        </Button>
                                    </div>
                                    {isOtpSent && !isOtpVerified && (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter OTP"
                                                value={enteredOtp}
                                                onChange={(e) => setEnteredOtp(e.target.value)}
                                                className="bg-white border-2 border-slate-100 rounded-xl h-10 flex-1"
                                            />
                                            <Button
                                                onClick={handleVerifyOtp}
                                                disabled={enteredOtp.length < 4}
                                                className="h-10 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
                                            >
                                                Verify
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="w-full mt-4 h-10 rounded-xl font-bold border-2"
                                >
                                    Back to Course Selection
                                </Button>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="flex-col sm:flex-col gap-4 border-t pt-6">
                        <div className="flex items-center justify-between w-full">
                            <div className="text-sm font-semibold text-slate-500">Selected Batch Price:</div>
                            <div className="text-2xl font-black text-primary">
                                {isLoadingFee ? (
                                    <span className="animate-pulse">Loading...</span>
                                ) : (
                                    feeAmount !== null ? `₹${feeAmount}` : '---'
                                )}
                            </div>
                        </div>
                        {step === 1 ? (
                            <Button
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl transition-all active:scale-[0.98]"
                                onClick={handleProceed}
                            >
                                Proceed to Buy Now
                            </Button>
                        ) : (
                            <Button
                                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 rounded-xl transition-all active:scale-[0.98]"
                                onClick={handlePaymentInitiation}
                                disabled={isInitiatingPayment}
                            >
                                {isInitiatingPayment ? "Initiating..." : (isExistingUser ? "Contact Administration" : "Pay via Easebuzz")}
                            </Button>
                        )}
                        <p className="text-[10px] text-center text-slate-400 font-medium italic">
                            * GST will be calculated at the checkout page. No hidden charges.
                        </p>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showAdminAlert} onOpenChange={setShowAdminAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Already Registered</AlertDialogTitle>
                        <AlertDialogDescription>
                            This mobile number is already registered with us. Please contact the administration to proceed with further enrollments.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setShowAdminAlert(false)}>Acknowledge</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
