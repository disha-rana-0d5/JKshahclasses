import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL, admissionApi, paymentEnquiryApi } from "../api/api";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

export function PaymentSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Extract transaction details from URL if any
    const txnid = searchParams.get("txnid") || searchParams.get("txnId") || "";
    const stat = searchParams.get("stat") || searchParams.get("payment_stat") || "";
    const paymentAmount = searchParams.get("amount") || searchParams.get("PaymentAmount") || "";
    const stuEnqSno = searchParams.get("stuRef") || "";

    const [currentStep, setCurrentStep] = useState(1); // 1 = Enquiry Form, 2 = Tabbed Form
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [enquiryErrors, setEnquiryErrors] = useState<string[]>([]);
    
    // OTP State
    const [otpStep, setOtpStep] = useState(false);
    const [otp, setOtp] = useState("");
    const [expectedOtp, setExpectedOtp] = useState("");

    // --- STEP 1: ENQUIRY DATA ---
    const [enquiryData, setEnquiryData] = useState({
        firstName: "",
        lastName: "",
        fatherName: "",
        email: "",
        mobileNumber: "",
        city: "",
        branch: "",
        alternateContact: "",
        course: "",
        level: "",
        attempt: "",
        percentage10_12: "",
        residentialArea: "",
        residentialCity: "",
        earlierCoachingClass: "",
        earlierCoachingContactNumber: "",
        sourceOfInfo: "",
        remark: ""
    });

    // Intercept back button to redirect to home
    useEffect(() => {
        window.history.pushState(null, "", window.location.href);
        const handlePopState = () => {
            navigate("/", { replace: true });
        };
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [navigate]);

    // Prefill enquiry data if stuRef is present in URL
    useEffect(() => {
        if (stuEnqSno) {
            const fetchPrefillData = async () => {
                try {
                    const response = await paymentEnquiryApi.getEnquiry(stuEnqSno);
                    if (response.ok && response.data?.success && response.data?.data) {
                        const prefill = response.data.data;
                        setEnquiryData(prev => ({
                            ...prev,
                            firstName: prefill.firstName || prev.firstName,
                            email: prefill.email || prev.email,
                            mobileNumber: prefill.mobileNumber || prev.mobileNumber,
                            // Course, level, and attempt are IDs, so they might not directly map if the form uses names, 
                            // but assuming they map or we just fill what we can:
                            course: prefill.course || prev.course,
                            level: prefill.level || prev.level,
                            attempt: prefill.attempt || prev.attempt,
                            branch: prefill.compId || prev.branch,
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch prefill enquiry data", err);
                }
            };
            fetchPrefillData();
        }
    }, [stuEnqSno]);

    const handleEnquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEnquiryData(prev => ({ ...prev, [name]: value }));
        if (enquiryErrors.length > 0) {
            setEnquiryErrors([]); // Reset errors on change
        }
    };

    const validateEnquiry = () => {
        const errors: string[] = [];
        if (!enquiryData.firstName) errors.push("First Name is required");
        if (!enquiryData.lastName) errors.push("Last Name is required");
        if (!enquiryData.fatherName) errors.push("Father's Name is required");
        if (!enquiryData.email || !/^\S+@\S+\.\S+$/.test(enquiryData.email)) errors.push("Valid Email is required");
        if (!enquiryData.mobileNumber || !/^\d{10}$/.test(enquiryData.mobileNumber)) errors.push("Valid 10-digit Mobile Number is required");
        if (!enquiryData.city) errors.push("City is required");
        if (!enquiryData.branch) errors.push("Branch is required");
        if (!enquiryData.alternateContact || !/^\d{10}$/.test(enquiryData.alternateContact)) errors.push("Valid 10-digit Alternate Contact is required");
        if (!enquiryData.course || enquiryData.course === "Select Course") errors.push("Course is required");
        if (!enquiryData.level || enquiryData.level === "Select Level") errors.push("Level is required");
        if (!enquiryData.attempt || enquiryData.attempt === "Select Attempt") errors.push("Attempt is required");
        if (!enquiryData.percentage10_12) errors.push("10/12th Percentage is required");
        if (!enquiryData.residentialArea) errors.push("Residential Area is required");
        if (!enquiryData.residentialCity) errors.push("Residential City is required");
        if (!enquiryData.earlierCoachingClass) errors.push("Earlier Coaching Class is required");
        if (!enquiryData.sourceOfInfo || enquiryData.sourceOfInfo === "Select an option") errors.push("How you know about JKSC is required");
        
        setEnquiryErrors(errors);
        return errors.length === 0;
    };

    const handleEnquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEnquiry()) return;

        // Bypass OTP and move directly to the next step
        setCurrentStep(2);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        
        if (otp === expectedOtp) {
            toast.success("OTP Verified Successfully! Please proceed to complete admission.");
            setOtpStep(false);
            setCurrentStep(2);
        } else {
            toast.error("Invalid OTP. Please try again.");
        }
    };

    // --- STEP 2: ADMISSION DATA (TABBED FORM) ---
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ["PERSONAL DETAILS", "FAMILY DETAILS", "COURSE DETAILS", "PAYMENT DETAILS"];

    // Custom Dropdown State for State Field
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
    const [stateSearch, setStateSearch] = useState("");
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const INDIAN_STATES = [
        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ].sort((a, b) => a.localeCompare(b));
    const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setStateDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [admissionData, setAdmissionData] = useState({
        // Personal Details
        flatBuildingName: "",
        streetArea: "",
        country: "India",
        state: "",
        pinCode: "",
        whatsapp: "",
        dob: "",
        gender: "Male",
        cptRank: "",
        
        // Family Details
        fatherMobile: "",
        fatherOccupation: "",
        motherName: "",
        motherMobile: "",
        motherOccupation: "",
        familyCa: "", 
        
        // Course Details
        icaiRegistrationNo: "",
        agreeTerms: false
    });

    const handleAdmissionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setAdmissionData(prev => ({ ...prev, [name]: checked }));
        } else {
            setAdmissionData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleNextTab = () => {
        if (activeTab < tabs.length - 1) {
            setActiveTab(prev => prev + 1);
        }
    };

    const handleFinalSubmit = async () => {
        if (!admissionData.agreeTerms) {
            toast.error("Please agree to the Terms and Conditions to proceed.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Combine both datasets for submission
            const payload = {
                ...enquiryData,
                ...admissionData,
                txnid,
                stat,
                paymentAmount,
                stuEnqSno
            };

            const response = await fetch(`${BASE_URL}/admissions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success("Enquiry and Admission Details submitted successfully!");
                navigate("/"); 
            } else {
                toast.error("Failed to submit. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An error occurred during submission.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Step Indicator */}
            <div className="max-w-6xl mx-auto mb-6 flex items-center justify-center space-x-4">
                <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-[#8C84C4]' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= 1 ? 'bg-[#8C84C4]' : 'bg-slate-300'}`}>1</div>
                    <span className="font-bold">Student Enquiry</span>
                </div>
                <div className="w-16 h-1 bg-slate-200">
                    <div className={`h-full ${currentStep >= 2 ? 'bg-[#8C84C4]' : 'bg-transparent'} transition-all duration-300`}></div>
                </div>
                <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-[#8C84C4]' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${currentStep >= 2 ? 'bg-[#8C84C4]' : 'bg-slate-300'}`}>2</div>
                    <span className="font-bold">Admission Details</span>
                </div>
            </div>

            {/* --- STEP 1 UI: ENQUIRY FORM --- */}
            {currentStep === 1 && (
                <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden border border-slate-200 p-8">
                    <div className="mb-6 relative">
                        <h2 className="text-sm font-bold text-slate-700 tracking-widest uppercase mb-2">STUDENT ENQUIRY</h2>
                        <div className="w-32 h-1 bg-[#8C84C4] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-slate-200 -z-10 mt-[-2px]"></div>
                    </div>

                    {!otpStep ? (
                    <form onSubmit={handleEnquirySubmit} className="space-y-6">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">First Name</label>
                                <input type="text" name="firstName" value={enquiryData.firstName} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Last Name</label>
                                <input type="text" name="lastName" value={enquiryData.lastName} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Father Name</label>
                                <input type="text" name="fatherName" value={enquiryData.fatherName} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Email</label>
                                <input type="email" name="email" value={enquiryData.email} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Mobile Number</label>
                                <input type="text" name="mobileNumber" value={enquiryData.mobileNumber} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">City</label>
                                <input type="text" name="city" value={enquiryData.city} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Branch <span className="text-red-500">*</span></label>
                                <input type="text" name="branch" value={enquiryData.branch} onChange={handleEnquiryChange} disabled={!!stuEnqSno} className={`w-full px-3 py-2 border border-[#8C84C4] rounded outline-none ${!!stuEnqSno ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Alternate Contact</label>
                                <input type="text" name="alternateContact" value={enquiryData.alternateContact} onChange={handleEnquiryChange} placeholder="Mobile" className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Course</label>
                                {stuEnqSno ? (
                                    <input type="text" name="course" value={enquiryData.course} disabled className="w-full px-3 py-2 border border-slate-300 rounded outline-none bg-gray-100 text-gray-500 cursor-not-allowed" />
                                ) : (
                                    <select name="course" value={enquiryData.course} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4] bg-white">
                                        <option value="">Select Course</option>
                                        <option value="CA">CA</option>
                                        <option value="CS">CS</option>
                                        <option value="CMA">CMA</option>
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Level</label>
                                {stuEnqSno ? (
                                    <input type="text" name="level" value={enquiryData.level} disabled className="w-full px-3 py-2 border border-slate-300 rounded outline-none bg-gray-100 text-gray-500 cursor-not-allowed" />
                                ) : (
                                    <select name="level" value={enquiryData.level} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4] bg-white">
                                        <option value="">Select Level</option>
                                        <option value="Foundation">Foundation</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Final">Final</option>
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Attempt</label>
                                {stuEnqSno ? (
                                    <input type="text" name="attempt" value={enquiryData.attempt} disabled className="w-full px-3 py-2 border border-slate-300 rounded outline-none bg-gray-100 text-gray-500 cursor-not-allowed" />
                                ) : (
                                    <select name="attempt" value={enquiryData.attempt} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4] bg-white">
                                        <option value="">Select Attempt</option>
                                        <option value="May 2026">May 2026</option>
                                        <option value="Nov 2026">Nov 2026</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Row 5 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">10/12th Percentage</label>
                                <input type="text" name="percentage10_12" value={enquiryData.percentage10_12} onChange={handleEnquiryChange} placeholder="Enter Percentage" className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Residential Area</label>
                                <input type="text" name="residentialArea" value={enquiryData.residentialArea} onChange={handleEnquiryChange} placeholder="Enter area" className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Residential City</label>
                                <input type="text" name="residentialCity" value={enquiryData.residentialCity} onChange={handleEnquiryChange} placeholder="Enter City" className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                        </div>

                        {/* Row 6 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Earlier Coaching Class</label>
                                <input type="text" name="earlierCoachingClass" value={enquiryData.earlierCoachingClass} onChange={handleEnquiryChange} placeholder="Enter Coaching Class" className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Earlier Coaching Contact Number</label>
                                <input type="text" name="earlierCoachingContactNumber" value={enquiryData.earlierCoachingContactNumber} onChange={handleEnquiryChange} placeholder="Mobile" className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1 flex items-center leading-tight">How do you come to know about JKSC</label>
                                <select name="sourceOfInfo" value={enquiryData.sourceOfInfo} onChange={handleEnquiryChange} className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4] bg-white mt-1">
                                    <option value="">Select an option</option>
                                    <option value="Friend">Friend</option>
                                    <option value="Internet">Internet</option>
                                    <option value="Social Media">Social Media</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 7 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#8C84C4] mb-1">Remark</label>
                                <input type="text" name="remark" value={enquiryData.remark} onChange={handleEnquiryChange} placeholder="Enter Remark" className="w-full px-3 py-2 border border-slate-300 rounded outline-none focus:border-[#8C84C4]" />
                            </div>
                        </div>

                        {/* Footer (Validation & Submit) */}
                        <div className="flex flex-col md:flex-row justify-end items-start gap-4 pt-4">
                            {enquiryErrors.length > 0 && (
                                <div className="bg-[#fef9c3] border border-[#fde047] p-4 rounded-md text-xs text-[#a16207] shadow-sm flex-1 md:max-w-md">
                                    <div className="flex items-center font-bold mb-2">
                                        <AlertTriangle className="w-4 h-4 mr-1 text-[#ca8a04]" />
                                        Please complete the following fields:
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {enquiryErrors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <button type="submit" disabled={isSubmitting} className="bg-[#8C84C4] hover:bg-[#7A73AB] text-white px-8 py-2 rounded shadow transition-colors font-medium text-sm tracking-wide self-end disabled:opacity-70 flex items-center gap-2">
                                {isSubmitting ? "Processing..." : "Next"}
                            </button>
                        </div>
                    </form>
                    ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-6 py-8">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Verify Mobile Number</h3>
                            <p className="text-gray-500">We've sent a 6-digit OTP to your mobile <br/><span className="font-semibold text-gray-700">{enquiryData.mobileNumber}</span></p>
                        </div>
                        
                        <div className="flex justify-center mb-8">
                            <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={1} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={2} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={3} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={4} className="bg-white border border-gray-300 text-gray-900" />
                                    <InputOTPSlot index={5} className="bg-white border border-gray-300 text-gray-900" />
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        <div className="flex flex-col gap-3 max-w-sm mx-auto">
                            <button
                                type="submit"
                                disabled={otp.length !== 6}
                                className="w-full bg-[#8C84C4] hover:bg-[#7a73ab] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                            >
                                Verify & Proceed
                            </button>
                            <button
                                type="button"
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
                                onClick={() => setOtpStep(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                    )}
                </div>
            )}

            {/* --- STEP 2 UI: ADMISSION TABS --- */}
            {currentStep === 2 && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="max-w-6xl mx-auto mb-4 bg-red-50 text-red-700 px-4 py-2 rounded flex items-center text-sm font-medium border border-red-100">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                        Please enter your complete and accurate address. This will be used for sending study materials, official communication etc.
                    </div>

                    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded overflow-hidden border border-slate-200">
                        <div className="flex bg-[#8C84C4] text-white">
                            {tabs.map((tab, index) => (
                                <div 
                                    key={tab}
                                    onClick={() => setActiveTab(index)}
                                    className={`flex-1 py-4 px-2 text-center text-sm font-bold tracking-wide cursor-pointer transition-colors duration-200
                                        ${activeTab === index ? 'bg-[#7A73AB]' : 'hover:bg-[#837BB8]'}
                                        ${index !== tabs.length - 1 ? 'border-r border-[#9E97CD]' : ''}
                                    `}
                                >
                                    {tab}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 md:p-10">
                            {/* TAB 1: PERSONAL DETAILS */}
                            {activeTab === 0 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">First Name</label>
                                            <input type="text" value={enquiryData.firstName} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Last Name</label>
                                            <input type="text" value={enquiryData.lastName} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Flat/Building Name <span className="text-red-500">*</span></label>
                                            <input type="text" name="flatBuildingName" value={admissionData.flatBuildingName} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Street Area <span className="text-red-500">*</span></label>
                                            <input type="text" name="streetArea" value={admissionData.streetArea} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Country</label>
                                            <input type="text" name="country" value={admissionData.country} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">State</label>
                                            <div className="relative" ref={dropdownRef}>
                                                <div 
                                                    className={`w-full px-3 py-2 border rounded focus:border-[#8C84C4] bg-white cursor-pointer flex justify-between items-center ${stateDropdownOpen ? 'border-[#8C84C4] ring-1 ring-[#8C84C4]' : 'border-slate-300'}`}
                                                    onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                                                >
                                                    <span className={admissionData.state ? 'text-slate-800' : 'text-slate-400'}>
                                                        {admissionData.state || "Select State"}
                                                    </span>
                                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                                </div>
                                                
                                                {stateDropdownOpen && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-60 flex flex-col">
                                                        <div className="p-2 border-b border-slate-200 sticky top-0 bg-white">
                                                            <input 
                                                                type="text" 
                                                                placeholder="Search state..." 
                                                                value={stateSearch}
                                                                onChange={e => setStateSearch(e.target.value)}
                                                                className="w-full px-2 py-1.5 outline-none text-sm bg-slate-50 border border-slate-200 rounded focus:border-[#8C84C4]"
                                                                autoFocus
                                                            />
                                                        </div>
                                                        <div className="overflow-y-auto flex-1 py-1">
                                                            {filteredStates.length > 0 ? filteredStates.map(st => (
                                                                <div 
                                                                    key={st}
                                                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 ${admissionData.state === st ? 'bg-slate-50 font-medium text-[#8C84C4]' : 'text-slate-700'}`}
                                                                    onClick={() => {
                                                                        setAdmissionData(prev => ({ ...prev, state: st }));
                                                                        setStateDropdownOpen(false);
                                                                        setStateSearch("");
                                                                    }}
                                                                >
                                                                    {st}
                                                                </div>
                                                            )) : (
                                                                <div className="px-3 py-3 text-sm text-slate-500 text-center">No state found.</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">City</label>
                                            <input type="text" value={enquiryData.city} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Pin Code <span className="text-red-500">*</span></label>
                                            <input type="text" name="pinCode" value={admissionData.pinCode} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Mobile</label>
                                            <input type="text" value={enquiryData.mobileNumber} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">WhatsApp</label>
                                            <input type="text" name="whatsapp" value={admissionData.whatsapp} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none mb-1" />
                                            <span className="text-[10px] text-red-500 block leading-tight">If not same as the registered number, please enter the correct WhatsApp number.</span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Email</label>
                                            <input type="email" value={enquiryData.email} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Date of Birth <span className="text-red-500">*</span></label>
                                            <input type="date" name="dob" value={admissionData.dob} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none text-slate-600" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Gender <span className="text-red-500">*</span></label>
                                            <select name="gender" value={admissionData.gender} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none bg-white">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">CPT/PCC/IPCC Rank</label>
                                            <input type="text" name="cptRank" value={admissionData.cptRank} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: FAMILY DETAILS */}
                            {activeTab === 1 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Father's Name <span className="text-red-500">*</span></label>
                                            <input type="text" value={enquiryData.fatherName} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Father Mobile <span className="text-red-500">*</span></label>
                                            <input type="text" name="fatherMobile" value={admissionData.fatherMobile} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Father Occupation <span className="text-red-500">*</span></label>
                                            <input type="text" name="fatherOccupation" value={admissionData.fatherOccupation} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Mother's Name <span className="text-red-500">*</span></label>
                                            <input type="text" name="motherName" value={admissionData.motherName} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Mother Mobile <span className="text-red-500">*</span></label>
                                            <input type="text" name="motherMobile" value={admissionData.motherMobile} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Mother Occupation <span className="text-red-500">*</span></label>
                                            <input type="text" name="motherOccupation" value={admissionData.motherOccupation} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <label className="block text-sm font-bold text-[#8C84C4] mb-3">Mention if any of your family is CA:</label>
                                        <div className="flex items-center gap-6">
                                            {['Father', 'Mother', 'Sibling', 'Others'].map(opt => (
                                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name="familyCa" 
                                                        value={opt} 
                                                        checked={admissionData.familyCa === opt}
                                                        onChange={handleAdmissionChange}
                                                        className="w-4 h-4 text-[#8C84C4] focus:ring-[#8C84C4]"
                                                    />
                                                    <span className="text-sm text-slate-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB 3: COURSE DETAILS */}
                            {activeTab === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Course</label>
                                            <input type="text" value={enquiryData.course} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Level</label>
                                            <input type="text" value={enquiryData.level} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Branch</label>
                                            <input type="text" value={enquiryData.branch} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">Attempt</label>
                                            <input type="text" value={enquiryData.attempt} disabled className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-100 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#8C84C4] mb-1">ICAI Registration No</label>
                                            <input type="text" name="icaiRegistrationNo" value={admissionData.icaiRegistrationNo} onChange={handleAdmissionChange} className="w-full px-3 py-2 border border-slate-300 rounded focus:border-[#8C84C4] outline-none" />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input 
                                                    type="checkbox" 
                                                    name="agreeTerms" 
                                                    checked={admissionData.agreeTerms}
                                                    onChange={handleAdmissionChange}
                                                    className="appearance-none w-5 h-5 border border-[#8C84C4] rounded bg-white checked:bg-[#8C84C4] transition-colors cursor-pointer"
                                                />
                                                <Check className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" style={{ opacity: admissionData.agreeTerms ? 1 : 0 }} />
                                            </div>
                                            <span className="text-sm text-slate-700">I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions & Privacy Policy</a></span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* TAB 4: PAYMENT DETAILS */}
                            {activeTab === 3 && (
                                <div className="space-y-6">
                                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                        <h3 className="text-lg font-bold text-[#8C84C4] mb-4 border-b border-slate-200 pb-2">Transaction Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between md:block">
                                                <span className="text-slate-500 block mb-1">Transaction ID</span>
                                                <span className="font-semibold text-slate-800">{txnid || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between md:block">
                                                <span className="text-slate-500 block mb-1">Status</span>
                                                <span className={`font-semibold ${stat.toLowerCase() === 'success' ? 'text-green-600' : 'text-slate-800'}`}>
                                                    {stat || 'N/A'}
                                                </span>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons for Step 2 */}
                            <div className="mt-10 flex justify-between">
                                <button 
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="border border-[#8C84C4] text-[#8C84C4] hover:bg-slate-50 px-8 py-2.5 rounded transition-colors font-medium text-sm tracking-wide"
                                >
                                    Back to Enquiry
                                </button>

                                {activeTab < tabs.length - 1 ? (
                                    <button 
                                        type="button"
                                        onClick={handleNextTab}
                                        className="bg-[#8C84C4] hover:bg-[#7A73AB] text-white px-8 py-2.5 rounded shadow transition-colors font-medium text-sm tracking-wide"
                                    >
                                        Save & Next
                                    </button>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={handleFinalSubmit}
                                        disabled={isSubmitting}
                                        className="bg-[#8C84C4] hover:bg-[#7A73AB] text-white px-8 py-2.5 rounded shadow transition-colors font-medium text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Registration"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
