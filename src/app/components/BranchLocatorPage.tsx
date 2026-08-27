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
import { MerittoFormModal } from "./modals/MerittoFormModal";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { landingPageApi } from "../api/api";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ClientPagination } from "./ClientPagination";
import { useCourseContext } from "../admin/context/CourseContext";

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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

const defaultPinIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div class="relative flex items-center justify-center w-6 h-6 group cursor-pointer transition-transform duration-300 hover:-translate-y-1 drop-shadow-sm">
      <div class="absolute inset-0 bg-white rounded-full border-[1.5px] border-[#373081]"></div>
      <div class="relative z-10 w-4 h-4 flex items-center justify-center bg-white rounded-full">
        <img src="/favicon.png" class="w-3 h-3 object-contain" alt="JK Shah Classes" />
      </div>
      <div class="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-[1.5px] border-r-[1.5px] border-[#373081] rotate-45"></div>
    </div>
  `,
  iconSize: [24, 28],
  iconAnchor: [12, 28],
  popupAnchor: [0, -28]
});

const activePinIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8 z-50 transition-transform duration-300 scale-110 drop-shadow-lg">
      <div class="absolute inset-0 bg-[#373081] rounded-full border-2 border-white"></div>
      <div class="relative z-10 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-inner">
        <img src="/favicon.png" class="w-3.5 h-3.5 object-contain" alt="JK Shah Classes" />
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#373081] rotate-45"></div>
    </div>
  `,
  iconSize: [32, 38],
  iconAnchor: [16, 38],
  popupAnchor: [0, -38]
});

const MapUpdater = ({ branches, selectedBranch }: { branches: Branch[], selectedBranch: number | null }) => {
  const map = useMap();

  useEffect(() => {
    if (branches.length === 0) return;
    
    let selectedCoords = null;

    branches.forEach(b => {
      if (b.id === selectedBranch) {
        const coords = extractCoordinates(b.mapUrl);
        if (coords) {
          selectedCoords = coords;
        }
      }
    });

    if (selectedCoords) {
      map.setView([selectedCoords.lat, selectedCoords.lng], 15);
    } else {
      // Just show India map by default
      map.setView([20.5937, 78.9629], 5);
    }
  }, [branches, selectedBranch, map]);

  return null;
};

const extractCoordinates = (url: string) => {
  if (!url) return null;

  // Pattern 1: @lat,lng
  const match1 = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match1 && match1.length >= 3) {
    return { lat: parseFloat(match1[1]), lng: parseFloat(match1[2]) };
  }

  // Pattern 2: q=lat,lng
  const match2 = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (match2 && match2.length >= 3) {
    return { lat: parseFloat(match2[1]), lng: parseFloat(match2[2]) };
  }

  return null;
};

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
  const [nearestBranch, setNearestBranch] = useState<Branch | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const branchesPerPage = 5;

  const { allCourses } = useCourseContext();
  const getActiveCourses = (courses: string[]) => {
    if (!allCourses || allCourses.length === 0) return courses;
    return courses.filter(courseTitle => {
        const normalizedTitle = (courseTitle || "").trim().toLowerCase();
        const foundCourse = allCourses.find(c => (c.title || "").trim().toLowerCase() === normalizedTitle);
        if (foundCourse) {
            return foundCourse.status === "Active";
        }
        return true;
    });
  };

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
    if (branches.length > 0 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          let minDistance = Infinity;
          let closestBranch = null;

          branches.forEach(branch => {
            const coords = extractCoordinates(branch.mapUrl);
            if (coords) {
              const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
              if (distance < minDistance) {
                minDistance = distance;
                closestBranch = branch;
              }
            }
          });

          if (closestBranch) {
            setNearestBranch(closestBranch);
          }
        },
        (error) => {
          console.warn("Geolocation warning:", error.message);
        }
      );
    }
  }, [branches]);

  useEffect(() => {
    document.title = "Our Branches";
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

  if (userLocation) {
    filteredBranches.sort((a, b) => {
      const coordsA = extractCoordinates(a.mapUrl);
      const coordsB = extractCoordinates(b.mapUrl);
      
      const distA = coordsA ? calculateDistance(userLocation.lat, userLocation.lng, coordsA.lat, coordsA.lng) : Infinity;
      const distB = coordsB ? calculateDistance(userLocation.lat, userLocation.lng, coordsB.lat, coordsB.lng) : Infinity;
      
      return distA - distB;
    });
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCity]);

  const totalPages = Math.ceil(filteredBranches.length / branchesPerPage);
  const currentBranches = filteredBranches.slice(
    (currentPage - 1) * branchesPerPage,
    currentPage * branchesPerPage
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-muted/20 to-white py-6 sm:py-12 px-3 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[12px] sm:text-sm mb-3 sm:mb-4">
              <MapPin className="w-3.5 h-3.5 sm:w-4 h-4" />
              <span>{content?.branchPage?.header?.badge || "35+ Branches Pan India"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3 text-foreground font-bold">{content?.branchPage?.header?.title || "Find a Branch Near You"}</h1>
            <p className="text-[13px] sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {content?.branchPage?.header?.description || "Visit our state-of-the-art learning centers equipped with modern facilities and experienced faculty"}
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-border shadow-sm p-3 sm:p-4">
              <div className="flex flex-col gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search city, branch or pincode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-[13px] sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* City Filter */}
                  <Button
                    variant="outline"
                    className="w-full justify-between h-9 sm:h-[42px] border-border rounded-lg text-[12px] sm:text-sm font-normal text-muted-foreground hover:bg-gray-50 bg-white"
                    onClick={() => setIsCityModalOpen(true)}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                      <Filter className="w-3.5 h-3.5 sm:w-4 h-4 text-muted-foreground shrink-0" />
                      <span className={selectedCity === "all" ? "truncate" : "text-foreground font-medium truncate"}>
                        {selectedCity === "all" ? "All Cities" : selectedCity}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  </Button>

                  {/* Search Button */}
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white h-9 sm:h-full text-[12px] sm:text-sm font-bold">
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            {/* <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filteredBranches.length}</span> {filteredBranches.length === 1 ? 'branch' : 'branches'}
                {selectedCity !== "all" && <span> in <span className="text-foreground font-medium">{selectedCity}</span></span>}
              </p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Main Content - Split Layout */}
      <section className="py-6 sm:py-8 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left - Branch List */}
            <div className="lg:col-span-7 space-y-4">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4 text-primary font-medium animate-pulse">Loading branches...</p>
                </div>
              ) : filteredBranches.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg text-foreground mb-2">No branches found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                </div>
              ) : (
                <>
                  {currentBranches.map((branch) => (
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
                          <div className="relative h-32 sm:h-48 md:h-full overflow-hidden">
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
                        <div className="md:col-span-8 p-3 sm:p-5">
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <div className="overflow-hidden">
                              <h3 className="text-base sm:text-lg text-foreground mb-0.5 sm:mb-1 truncate">{branch.name}</h3>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {branch.students} students
                                </span>
                                {/* <span>•</span>
                              <span className="flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                ICAI Approved
                              </span> */}
                              </div>
                            </div>
                          </div>

                          {/* Address */}
                          <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-4">
                            <div className="flex items-start gap-2 sm:gap-2.5">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <div className="overflow-hidden">
                                <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed sm:truncate">
                                  {branch.address}
                                </p>
                                <p className="text-[13px] sm:text-sm text-muted-foreground truncate">
                                  {branch.city}, {branch.state} - {branch.pincode}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-2.5">
                              <Phone className="w-3.5 h-3.5 sm:w-4 h-4 text-primary flex-shrink-0" />
                              <a href={`tel:${branch.phone}`} className="text-[13px] sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                                {branch.phone}
                              </a>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-2.5 hidden xs:flex">
                              <Mail className="w-3.5 h-3.5 sm:w-4 h-4 text-primary flex-shrink-0" />
                              <a href={`mailto:${branch.email}`} className="text-[13px] sm:text-sm text-muted-foreground hover:text-primary transition-colors truncate">
                                {branch.email}
                              </a>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-2.5">
                              <Clock className="w-3.5 h-3.5 sm:w-4 h-4 text-primary flex-shrink-0" />
                              <p className="text-[13px] sm:text-sm text-muted-foreground truncate">{branch.timings}</p>
                            </div>
                          </div>

                          {/* Available Courses */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                              Available Courses
                            </h4>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {getActiveCourses(branch.courses || branch.facilities || []).slice(0, 3).map((course, i) => (
                                <div key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] sm:text-xs font-medium border border-gray-100 italic">
                                  {course}
                                </div>
                              ))}
                              {getActiveCourses(branch.courses || branch.facilities || []).length > 3 && (
                                <span className="text-[10px] text-muted-foreground flex items-center">+{getActiveCourses(branch.courses || branch.facilities || []).length - 3}</span>
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

                          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 pt-3 border-t border-border/50 mt-3 sm:mt-4">
                            <div className="flex items-center gap-2 w-full xs:w-auto">
                              {branch.faculties && branch.faculties.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 xs:flex-none text-primary border-primary/20 hover:bg-primary/5 hover:text-primary h-8 text-[11px] sm:text-xs font-bold"
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
                                className="flex-1 xs:flex-none bg-primary hover:bg-primary/90 text-white h-8 text-[11px] sm:text-xs font-bold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEnquiryBranchData({
                                    name: branch.name,
                                    courses: getActiveCourses(branch.courses || [])
                                  });
                                  setIsEnquiryModalOpen(true);
                                }}
                              >
                                Enquire Now
                              </Button>
                            </div>
                            <Button
                              variant="link"
                              className="text-primary font-bold gap-1 p-0 h-auto text-[11px] sm:text-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/branch/${branch.name.toLowerCase().replace(/\s+/g, '-')}`);
                              }}
                            >
                              Details <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <ClientPagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right - Map Placeholder */}
            <div className="lg:col-span-5">
              <div className="sticky top-20">
                <div className="bg-muted/30 rounded-lg border-2 border-border overflow-hidden">
                  {/* Map Placeholder */}
                  <div className="relative h-[600px] bg-gradient-to-br from-muted/50 to-muted/30 z-0">
                    <MapContainer 
                      center={[20.5937, 78.9629]} 
                      zoom={4} 
                      minZoom={3}
                      maxBounds={[
                        [6.7535, 68.1623], // South West
                        [37.0900, 97.3953]  // North East
                      ]}
                      maxBoundsViscosity={1.0}
                      style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                      <TileLayer
                        attribution='&copy; Google Maps'
                        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                      />
                      <MapUpdater branches={filteredBranches} selectedBranch={selectedBranch} />
                      {filteredBranches.map(branch => {
                        const coords = extractCoordinates(branch.mapUrl);
                        if (!coords) return null;
                        return (
                          <Marker
                            key={branch.id}
                            position={[coords.lat, coords.lng]}
                            icon={selectedBranch === branch.id ? activePinIcon : defaultPinIcon}
                            eventHandlers={{
                              click: () => {
                                setSelectedBranch(branch.id);
                              }
                            }}
                          >
                            <Popup>
                              <div className="text-center font-sans pb-2">
                                <h3 className="font-bold text-sm mb-1">{branch.name}</h3>
                                <p className="text-xs text-gray-600 mb-3">{branch.city}</p>
                                <Button
                                  size="sm"
                                  className="h-8 text-xs w-full bg-primary text-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/branch/${branch.name.toLowerCase().replace(/\s+/g, '-')}`);
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
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
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => {
                const targetBranch = nearestBranch || branches[0];
                if (targetBranch) {
                  setEnquiryBranchData({
                    name: targetBranch.name,
                    courses: getActiveCourses(targetBranch.courses || [])
                  });
                  setIsEnquiryModalOpen(true);
                }
              }}
            >
              {content?.branchPage?.cta?.scheduleBtn || "Schedule a Visit"}
              {nearestBranch && <span className="opacity-80 text-sm font-normal">({nearestBranch.name})</span>}
            </Button>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2" asChild>
              <a href={`tel:${nearestBranch?.phone || "+91 9757111333"}`}>
                <Phone className="w-5 h-5 fill-primary" />
                <span className="font-bold">{nearestBranch?.phone || "+91 9757111333"}</span>
              </a>
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

      <MerittoFormModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
      />
    </div>
  );
}
