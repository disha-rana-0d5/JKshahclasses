import { useState } from "react";
import { Button } from "./ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Building2,
  Users,
  Award,
  CheckCircle2,
  ArrowRight,
  ChevronsUpDown,
  BookOpen
} from "lucide-react";
import { CitySelectorModal } from "./modals/CitySelectorModal";
import { BranchEnquiryModal } from "./modals/BranchEnquiryModal";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { landingPageApi } from "../api/api";

interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  timings: string;
  image: string;
  mapUrl: string;
  courses: string[];
  facilities?: string[]; // Fallback for transition
  faculties?: string[];
  students: string;
}

export function BranchLocatorPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [content, setContent] = useState<any>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryBranchData, setEnquiryBranchData] = useState<{ name: string, courses: string[] }>({ name: "", courses: [] });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        const { ok, data } = await landingPageApi.getLandingContent();
        if (ok && data.success) {
          setContent(data.data);
          if (data.data.branches) {
            setBranches(data.data.branches);
          }
        }
      } catch (error) {
        console.error("Failed to fetch branches");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    document.title = "Our Branches | JK Shah Classes";
  }, []);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";

    // Check if it's a full iframe code and extract src
    if (url.trim().startsWith('<iframe')) {
      const srcMatch = url.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
    }

    // If it's already an embed URL, return it
    if (url.includes("/embed")) return url;

    // Try to extract coordinates from standard Google Maps URL
    // Pattern: @lat,lng
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match && match.length >= 3) {
      const lat = match[1];
      const lng = match[2];
      return `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=16&output=embed`;
    }

    // Fallback: search query if no coordinates
    // This might not work effectively for all URLs due to X-Frame-Options
    return url;
  };

  const cities = ["all", ...Array.from(new Set(branches.map(b => b.city)))];

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.pincode.includes(searchQuery);
    const matchesCity = selectedCity === "all" || branch.city === selectedCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-muted/20 to-white py-12 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>{content?.branchPage?.header?.badge || "35+ Branches Pan India"}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl mb-3 text-foreground">{content?.branchPage?.header?.title || "Find a Branch Near You"}</h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {content?.branchPage?.header?.description || "Visit our state-of-the-art learning centers equipped with modern facilities and experienced faculty"}
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-border shadow-sm p-4">
              <div className="grid md:grid-cols-12 gap-3">
                {/* Search Input */}
                <div className="md:col-span-7 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by city, branch name, or pincode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                {/* City Filter */}
                <div className="md:col-span-3">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-[42px] border-border rounded-lg text-sm font-normal text-muted-foreground hover:bg-gray-50 bg-white"
                    onClick={() => setIsCityModalOpen(true)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className={selectedCity === "all" ? "" : "text-foreground font-medium"}>
                        {selectedCity === "all" ? "All Cities" : selectedCity}
                      </span>
                    </div>
                    <ChevronsUpDown className="w-4 h-4 opacity-50 shrink-0" />
                  </Button>
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white h-full">
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filteredBranches.length}</span> {filteredBranches.length === 1 ? 'branch' : 'branches'}
                {selectedCity !== "all" && <span> in <span className="text-foreground font-medium">{selectedCity}</span></span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Split Layout */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left - Branch List */}
            <div className="lg:col-span-7 space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg text-foreground mb-2">No branches found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              ) : (
                filteredBranches.map((branch) => (
                  <div
                    key={branch.id}
                    onClick={() => {
                      setSelectedBranch(branch.id);
                      navigate(`/branch/${branch.name.toLowerCase().replace(/\s+/g, '-')}`);
                    }}
                    className={`bg-muted/30 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer border-2 ${selectedBranch === branch.id ? 'border-primary shadow-md' : 'border-transparent'
                      }`}
                  >
                    <div className="grid md:grid-cols-12 gap-0">
                      {/* Branch Image */}
                      <div className="md:col-span-4">
                        <div className="relative h-48 md:h-full overflow-hidden">
                          <ImageWithFallback
                            src={branch.image}
                            alt={branch.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                            <span className="text-xs text-foreground font-medium">{branch.city}</span>
                          </div>
                        </div>
                      </div>

                      {/* Branch Details */}
                      <div className="md:col-span-8 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg text-foreground mb-1">{branch.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {branch.students} students
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                ICAI Approved
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2.5 mb-4">
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {branch.address}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {branch.city}, {branch.state} - {branch.pincode}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                            <a href={`tel:${branch.phone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                              {branch.phone}
                            </a>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                            <a href={`mailto:${branch.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                              {branch.email}
                            </a>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{branch.timings}</p>
                          </div>
                        </div>

                        {/* Available Courses */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-primary" />
                            Available Courses
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {(branch.courses || branch.facilities || []).slice(0, 4).map((course, i) => (
                              <div key={i} className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-100 italic">
                                {course}
                              </div>
                            ))}
                            {(branch.courses?.length || branch.facilities?.length || 0) > 4 && (
                              <span className="text-[10px] text-muted-foreground flex items-center">+{(branch.courses?.length || branch.facilities?.length || 0) - 4} more</span>
                            )}
                          </div>
                        </div>

                        {/* Expert Faculties */}
                        {branch.faculties && branch.faculties.length > 0 && (
                          <div className="space-y-3 mt-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-primary" />
                              Expert Faculties
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {branch.faculties.slice(0, 3).map((faculty, i) => (
                                <div key={i} className="px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-medium border border-primary/10">
                                  {faculty}
                                </div>
                              ))}
                              {branch.faculties.length > 3 && (
                                <span className="text-[10px] text-muted-foreground flex items-center">+{branch.faculties.length - 3} more</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t border-border/50 mt-4">
                          <div className="flex items-center gap-2">
                            {branch.faculties && branch.faculties.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-primary border-primary/20 hover:bg-primary/5 hover:text-primary h-8 text-xs font-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/faculty', { state: { branchFaculties: branch.faculties, branchName: branch.name } });
                                }}
                              >
                                View Faculty
                              </Button>
                            )}
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-white h-8 text-xs font-bold"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEnquiryBranchData({
                                  name: branch.name,
                                  courses: branch.courses || []
                                });
                                setIsEnquiryModalOpen(true);
                              }}
                            >
                              Enquire Now
                            </Button>
                          </div>
                          <Button
                            variant="link"
                            className="text-primary font-bold gap-1 p-0 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/branch/${branch.name.toLowerCase().replace(/\s+/g, '-')}`);
                            }}
                          >
                            View Branch Details <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right - Map Placeholder */}
            <div className="lg:col-span-5">
              <div className="sticky top-20">
                <div className="bg-muted/30 rounded-lg border-2 border-border overflow-hidden">
                  {/* Map Placeholder */}
                  <div className="relative h-[600px] bg-gradient-to-br from-muted/50 to-muted/30">

                    {selectedBranch ? (
                      <iframe
                        src={getEmbedUrl(branches.find(b => b.id === selectedBranch)?.mapUrl || "")}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="bg-white rounded-full p-6 w-24 h-24 mx-auto mb-4 shadow-lg">
                            <MapPin className="w-12 h-12 text-primary" />
                          </div>
                          <h3 className="text-lg text-foreground mb-2">Interactive Map</h3>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            Click on any branch to view its location on the map
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Card Below Map */}
                <div className="mt-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-5 border border-border">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base text-foreground mb-1">Can't find a nearby branch?</h3>
                      <p className="text-sm text-muted-foreground">
                        Join our online classes and learn from anywhere
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    onClick={() => navigate('/courses')}
                  >
                    Explore Online Learning
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            {(content?.branchPage?.stats || [
              { value: "35+", label: "Branches Across India" },
              { value: "50,000+", label: "Active Students" },
              { value: "450+", label: "Rank Holders" },
              { value: "98%", label: "Success Rate" }
            ]).map((stat: any, idx: number) => (
              <div key={idx} className="bg-white rounded-lg p-5 text-center border border-border">
                <div className="bg-primary/10 rounded-full p-3 w-fit mx-auto mb-3">
                  {/* Icons are hardcoded for now as we don't have icon selection in CMS yet */}
                  {idx === 0 && <MapPin className="w-6 h-6 text-primary" />}
                  {idx === 1 && <Users className="w-6 h-6 text-primary" />}
                  {idx === 2 && <Award className="w-6 h-6 text-primary" />}
                  {idx === 3 && <CheckCircle2 className="w-6 h-6 text-primary" />}
                </div>
                <p className="text-2xl text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl text-white mb-3">{content?.branchPage?.cta?.title || "Visit Our Nearest Branch"}</h2>
          <p className="text-base text-white/90 mb-6">
            {content?.branchPage?.cta?.description || "Experience our world-class infrastructure and meet our expert faculty in person"}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              {content?.branchPage?.cta?.scheduleBtn || "Schedule a Visit"}
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
              <Phone className="w-5 h-5 fill-primary" />
              <span className="font-bold">+91 8010 441 044</span>
            </Button>
          </div>
        </div>
      </section>

      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelect={(city) => {
          setSelectedCity(city.name);
        }}
        currentCity={selectedCity === "all" ? "" : selectedCity}
        availableCities={Array.from(new Set(branches.map(b => b.city))).filter(Boolean)}
      />

      <BranchEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        branchName={enquiryBranchData.name}
        courses={enquiryBranchData.courses}
      />
    </div>
  );
}
