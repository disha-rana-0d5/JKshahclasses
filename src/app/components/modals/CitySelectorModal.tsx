import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Save, MapPin, Plus, Trash2, Edit, Type, Layout, Clock, BookOpen, GraduationCap, Laptop, Video, Trash, Landmark, Building, Building2, Castle, Church, Factory, Home, Hotel, Mountain, Store, Trees, University, Warehouse, MapPinned, Globe, Compass, Tent, School, TowerControl, Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { City, State } from "country-state-city";
import Fuse from "fuse.js";
import { cn } from "../ui/utils";

interface CitySelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (city: { name: string; state: string }) => void;
    currentCity?: string;
    availableCities?: string[];
}

// Popular Cities Data with Monument Icons (Simple SVGs)
const POPULAR_CITIES = [
    {
        name: "Mumbai",
        state: "Maharashtra",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M10 50 h80 v-2 h-80 z" fill="currentColor" opacity="0.1" />
                <path d="M15 48 v-25 h10 v25 M75 48 v-25 h10 v25" />
                <path d="M25 40 v-15 h10 v15 M65 40 v-15 h10 v15" />
                <path d="M35 48 v-30 h30 v30" />
                <path d="M35 30 a15 15 0 0 1 30 0" />
                <path d="M42 48 v-12 a8 8 0 0 1 16 0 v12" />
                <path d="M15 23 h10 v-2 h-10 z M75 23 h10 v-2 h-10 z" />
                <path d="M35 18 h30 v-2 h-30 z" />
                <circle cx="50" cy="22" r="1.5" />
            </svg>
        )
    },
    {
        name: "Kochi",
        state: "Kerala",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M10 50 h80" />
                <path d="M20 50 L45 15 L50 20 L55 15 L80 50" />
                <path d="M30 50 L48 25 M70 50 L52 25" />
                <path d="M45 15 q5 -5 10 0" />
                <path d="M25 45 q25 -15 50 0" />
                <path d="M30 40 q20 -10 40 0" />
                <path d="M40 50 v-5 M60 50 v-5" strokeWidth="2" />
            </svg>
        )
    },
    {
        name: "Delhi-NCR",
        state: "Delhi",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M25 50 h50" />
                <path d="M30 50 v-30 h5 v-5 h30 v5 h5 v30" />
                <path d="M35 50 v-20 a15 15 0 0 1 30 0 v20" />
                <path d="M42 50 v-12 a8 8 0 0 1 16 0 v12" />
                <path d="M30 25 h40 M30 30 h40" />
                <path d="M35 15 h30 v-2 h-30 z" />
            </svg>
        )
    },
    {
        name: "Bengaluru",
        state: "Karnataka",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="20" y="25" width="60" height="25" />
                <path d="M20 25 L15 25 v25 M80 25 L85 25 v25" />
                <path d="M40 25 v-10 q10 -10 20 0 v10" />
                <path d="M50 15 v-5 m-3 0 h6" />
                <path d="M25 25 v-8 h10 v8 M65 25 v-8 h10 v8" />
                <path d="M45 50 v-10 a5 5 0 0 1 10 0 v 10" />
                <path d="M20 35 h60 M20 42 h60" opacity="0.5" />
            </svg>
        )
    },
    {
        name: "Hyderabad",
        state: "Telangana",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="30" y="25" width="40" height="25" />
                <path d="M30 25 v-20 h4 v20 M38 25 v-20 h4 v20 M58 25 v-20 h4 v20 M66 25 v-20 h4 v20" />
                <path d="M30 10 h4 M38 10 h4 M58 10 h4 M66 10 h4" />
                <path d="M35 40 q15 -10 30 0" />
                <path d="M42 50 v-12 a8 8 0 0 1 16 0 v12" />
                <path d="M30 30 h40 M30 35 h40" opacity="0.5" />
            </svg>
        )
    },
    {
        name: "Chandigarh",
        state: "Chandigarh",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M50 50 v-20" strokeWidth="2" />
                <path d="M50 30 l-25 -10 v-5 l25 10 l25 -10 v5 z" fill="currentColor" opacity="0.1" />
                <path d="M50 30 l-20 -5 q-15 5 -10 15 q5 10 30 -5" />
                <path d="M50 30 l20 -5 q15 5 10 15 q-5 10 -30 -5" />
                <path d="M50 30 v-15 q0 -10 10 -10 q10 0 0 10 z" />
            </svg>
        )
    },
    {
        name: "Ahmedabad",
        state: "Gujarat",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M20 50 v-30 a30 30 0 0 1 60 0 v30" />
                <path d="M50 50 v-35 m0 0 c10 0 15 5 15 10 m-15 -10 c-10 0 -15 5 -15 10" />
                <path d="M50 25 c10 0 15 10 20 15 m-20 -15 c-10 0 -15 10 -20 15" />
                <path d="M30 50 v-10 h40 v10" />
                <path d="M40 50 v-15 a10 10 0 0 1 20 0 v15" />
            </svg>
        )
    },
    {
        name: "Pune",
        state: "Maharashtra",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M15 50 h70" />
                <path d="M20 50 v-20 l10 -10 h40 l10 10 v20" />
                <path d="M20 30 h60 M25 25 h50" />
                <path d="M35 50 v-15 h30 v15" />
                <path d="M40 50 v-10 a10 10 0 0 1 20 0 v15" />
                <path d="M20 35 h60 M20 40 h60" opacity="0.5" />
            </svg>
        )
    },
    {
        name: "Chennai",
        state: "Tamil Nadu",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M30 50 L40 10 h20 L70 50" />
                <path d="M35 40 h30 M38 30 h24 M42 20 h16" />
                <path d="M40 10 l10 -5 l10 5" />
                <path d="M45 50 v-8 a5 5 0 0 1 10 0 v8" />
                <path d="M32 45 h36 M35 35 h30" opacity="0.5" />
            </svg>
        )
    },
    {
        name: "Kolkata",
        state: "West Bengal",
        icon: (
            <svg viewBox="0 0 100 60" className="w-16 h-12" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M10 40 Q50 10 90 40" strokeWidth="2" />
                <path d="M10 50 h80 M10 42 h80" />
                <path d="M15 42 v8 M25 40 v10 M35 35 v15 M45 32 v18 M55 32 v18 M65 35 v15 M75 40 v10 M85 42 v8" />
                <path d="M20 25 q30 -15 60 0" opacity="0.3" />
            </svg>
        )
    }
];

export function CitySelectorModal({ isOpen, onClose, onSelect, currentCity, availableCities }: CitySelectorModalProps) {
    const [search, setSearch] = useState("");
    const [showAllCities, setShowAllCities] = useState(false);
    const [detecting, setDetecting] = useState(false);

    // Clear search and reset view when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSearch("");
            setShowAllCities(false);
        }
    }, [isOpen]);

    // Get all Indian cities
    const allCities = useMemo(() => {
        return City.getCitiesOfCountry("IN") || [];
    }, []);

    // When availableCities is provided, use them; otherwise fall back to all Indian cities
    const cityPool = useMemo(() => {
        if (availableCities && availableCities.length > 0) {
            // Build city objects for just the available branch cities
            return availableCities.map(name => ({
                name,
                stateCode: "",
                state: ""
            }));
        }
        return allCities;
    }, [availableCities, allCities]);

    // Setup Fuse search
    const fuse = useMemo(() => {
        return new Fuse(cityPool, {
            keys: ["name"],
            threshold: 0.3
        });
    }, [cityPool]);

    // Filtered results
    const filteredCities = useMemo(() => {
        if (!search) return cityPool.slice(0, 50); // Show top 50 by default
        return fuse.search(search).map(r => r.item);
    }, [search, cityPool, fuse]);

    const handleSelect = (city: any) => {
        let stateName = city.state;
        // If it's a city object from country-state-city, it has stateCode
        if (city.stateCode && (!stateName || stateName === city.stateCode)) {
            const stateObj = State.getStateByCodeAndCountry(city.stateCode, "IN");
            stateName = stateObj?.name || city.stateCode;
        }
        onSelect({ name: city.name, state: stateName || "" });
        onClose();
    };

    const handleDetectLocation = async () => {
        setDetecting(true);

        // Strategy 1: IP-based lookup (ipapi.co)
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            if (data.city && data.region) {
                handleSelect({ name: data.city, state: data.region });
                return;
            }
        } catch (e) {
            console.warn("ipapi.co failed, trying fallback...");
        }

        // Strategy 2: IP-based lookup (ip-api.com)
        try {
            const response = await fetch('http://ip-api.com/json/');
            const data = await response.json();
            if (data.status === 'success' && data.city && data.regionName) {
                handleSelect({ name: data.city, state: data.regionName });
                return;
            }
        } catch (e) {
            console.warn("ip-api.com failed, trying browser geolocation...");
        }

        // Strategy 3: Browser Geolocation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        // Reverse geocode using OpenStreetMap (Nominatim) - free, no key
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        const city = data.address.city || data.address.town || data.address.village;
                        const state = data.address.state;

                        if (city && state) {
                            handleSelect({ name: city, state: state });
                        } else {
                            toast.error("Located but could not identify city name");
                        }
                    } catch (error) {
                        toast.error("Could not resolve location coordinates");
                    } finally {
                        setDetecting(false);
                    }
                },
                (error) => {
                    setDetecting(false);
                    toast.error("Location access denied or unavailable");
                },
                { timeout: 5000 }
            );
            return; // Browser geo is async with callbacks
        }

        setDetecting(false);
        toast.error("All location services failed. Please select manually.");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[1200px] w-[85vw] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-4 border-b bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3 bg-gray-50 border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-primary transition-all">
                        <Search className="h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search for your city"
                            className="border-none focus-visible:ring-0 p-0 shadow-none bg-transparent text-lg h-auto"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button
                        onClick={handleDetectLocation}
                        disabled={detecting}
                        className="flex items-center gap-2 text-primary font-medium mt-3 hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                        {detecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <MapPin className="h-4 w-4" />
                        )}
                        Detect my location
                    </button>
                    <DialogTitle className="sr-only">Select City</DialogTitle>
                </DialogHeader>

                <div className="p-6 bg-white">
                    {!search ? (
                        <>
                            {/* Popular Cities: show only those that have branches when availableCities is set */}
                            {(() => {
                                const popularToShow = availableCities && availableCities.length > 0
                                    ? POPULAR_CITIES.filter(c => availableCities.includes(c.name))
                                    : POPULAR_CITIES;
                                const popularNames = new Set(popularToShow.map(c => c.name));
                                const otherCities = cityPool.filter(c => !popularNames.has(c.name));

                                return (
                                    <>
                                        {popularToShow.length > 0 && (
                                            <div className="mb-10">
                                                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-6 text-center">
                                                    {availableCities ? "Available Cities" : "Popular Cities"}
                                                </h3>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-10 gap-x-4">
                                                    {popularToShow.map((city) => (
                                                        <button
                                                            key={city.name}
                                                            onClick={() => handleSelect(city)}
                                                            className="flex flex-col items-center group transition-transform hover:scale-105"
                                                        >
                                                            <div className="text-gray-400 group-hover:text-primary transition-colors mb-2">
                                                                {city.icon}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">{city.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Other cities not in the popular list */}
                                        {otherCities.length > 0 && (
                                            <div>
                                                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-6 text-center">Other Cities</h3>
                                                <div className={cn(
                                                    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-y-4 gap-x-6",
                                                    !showAllCities && "max-h-[300px] overflow-hidden mask-fade-bottom"
                                                )}>
                                                    {(availableCities ? otherCities : otherCities.slice(0, 100)).map((city, idx) => (
                                                        <button
                                                            key={`${city.name}-${idx}`}
                                                            onClick={() => handleSelect(city)}
                                                            className="text-left text-[11px] text-gray-400 hover:text-primary transition-colors py-1 leading-tight"
                                                        >
                                                            {city.name}
                                                        </button>
                                                    ))}
                                                </div>
                                                {!availableCities && (
                                                    <div className="flex justify-center mt-8">
                                                        <Button
                                                            variant="ghost"
                                                            className="text-primary hover:text-primary/80 font-semibold flex items-center gap-2"
                                                            onClick={() => setShowAllCities(!showAllCities)}
                                                        >
                                                            {showAllCities ? (
                                                                <>Hide all cities <ChevronUp className="h-4 w-4" /></>
                                                            ) : (
                                                                <>View all cities <ChevronDown className="h-4 w-4" /></>
                                                            )}
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </>
                    ) : (
                        /* Search Results */
                        <div className="min-h-[400px]">
                            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-6">Search Results</h3>
                            {filteredCities.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-y-4 gap-x-6">
                                    {filteredCities.map((city, idx) => (
                                        <button
                                            key={`${city.name}-${idx}`}
                                            onClick={() => handleSelect(city)}
                                            className="text-left text-[11px] text-gray-400 hover:text-primary transition-colors py-1 leading-tight"
                                        >
                                            {city.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <X className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No cities found matching "{search}"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Add these styles to global CSS if needed, but here we can use tailwind and inline styles
// .mask-fade-bottom {
//   mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
// }
