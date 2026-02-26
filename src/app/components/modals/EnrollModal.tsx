import { useState } from "react";
import { X, CreditCard, GraduationCap, User, Mail, Phone, MapPin, Calendar, FileText } from "lucide-react";
import { Button } from "../ui/button";

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName?: string;
  coursePrice?: string;
}

export function EnrollModal({ isOpen, onClose, courseName = "", coursePrice = "" }: EnrollModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    city: "",
    address: "",
    education: "",
    paymentMode: "",
    referralCode: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);

    // Simulate enrollment
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Enrollment Successful! Redirecting to payment...");
      onClose();
      setStep(1);
      setFormData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        city: "",
        address: "",
        education: "",
        paymentMode: "",
        referralCode: ""
      });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="pr-12">
            <h2 className="text-2xl text-foreground mb-2">Enroll</h2>
            {courseName && (
              <p className="text-sm text-muted-foreground mb-2">{courseName}</p>
            )}
            {coursePrice && (
              <p className="text-xl text-primary">{coursePrice}</p>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all ${step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                  {s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-primary' : 'bg-muted'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <>
              <h3 className="text-lg text-foreground flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </h3>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Current Education *
                  </label>
                  <select
                    required
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
                  >
                    <option value="">Select Education Level</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Post Graduation">Post Graduation</option>
                    <option value="Professional Course">Professional Course</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Address & Location */}
          {step === 2 && (
            <>
              <h3 className="text-lg text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Address & Location
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Full Address *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                    placeholder="Enter your complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    City *
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
                  >
                    <option value="">Select City</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <>
              <h3 className="text-lg text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Details
              </h3>

              <div className="space-y-4">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Course Fee:</span>
                    <span className="text-2xl text-primary">{coursePrice || "₹45,000"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Registration Fee:</span>
                    <span className="text-foreground">₹500</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Payment Mode *
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: "full", label: "Pay Full Amount", desc: "Get 5% instant discount" },
                      { value: "installment", label: "Pay in Installments", desc: "EMI options available" }
                    ].map((mode) => (
                      <label
                        key={mode.value}
                        className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all ${formData.paymentMode === mode.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value={mode.value}
                          required
                          checked={formData.paymentMode === mode.value}
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                          className="mt-1 accent-primary"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{mode.label}</p>
                          <p className="text-xs text-muted-foreground">{mode.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    placeholder="Enter referral code for additional discount"
                  />
                </div>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-foreground">
                    <strong>Note:</strong> You'll be redirected to our secure payment gateway after submission.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1 py-6 rounded-lg"
              >
                Previous
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-6 rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : step < 3 ? (
                "Next Step"
              ) : (
                "Proceed to Payment"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}