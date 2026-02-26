import { useState } from "react";
import { Button } from "./ui/button";
import { 
  Award, 
  BookOpen, 
  Star, 
  GraduationCap, 
  Users, 
  Trophy,
  Sparkles,
  ArrowRight,
  Quote,
  Play,
  TrendingUp,
  Crown,
  Zap,
  CheckCircle2,
  Target,
  MessageCircle,
  Video
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Faculty {
  id: number;
  name: string;
  designation: string;
  expertise: string;
  experience: number;
  rating: string;
  totalStudents: string;
  coursesTaught: string[];
  image: string;
  specialization: string;
  qualifications: string[];
  tagline: string;
  achievements: string[];
}

export function UniqueFacultyShowcase() {
  const [selectedFaculty, setSelectedFaculty] = useState<number>(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const facultyMembers: Faculty[] = [
    {
      id: 1,
      name: "Dr. Rajesh Kumar",
      designation: "Senior Faculty - Financial Accounting",
      expertise: "Accounts",
      experience: 22,
      rating: "4.9",
      totalStudents: "12,000+",
      coursesTaught: ["CA Foundation", "CA Inter", "CA Final"],
      image: "https://images.unsplash.com/photo-1649433658557-54cf58577c68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      specialization: "Financial Reporting & Advanced Accounting",
      qualifications: ["CA", "PhD in Commerce", "M.Com"],
      tagline: "Making complex accounting simple for 22 years",
      achievements: ["450+ All India Rankers", "Published 12 books", "Featured in Forbes Education"]
    },
    {
      id: 2,
      name: "Prof. Anjali Mehta",
      designation: "Head Faculty - Corporate & Business Laws",
      expertise: "Law",
      experience: 18,
      rating: "4.9",
      totalStudents: "10,500+",
      coursesTaught: ["CS Executive", "CS Professional", "CA Inter"],
      image: "https://images.unsplash.com/photo-1704927768421-bc9549b5097d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      specialization: "Corporate Governance & Compliance",
      qualifications: ["CS", "LLB", "MBA"],
      tagline: "Empowering students with legal excellence",
      achievements: ["380+ Top Rankers", "Supreme Court Advocate", "TEDx Speaker"]
    },
    {
      id: 3,
      name: "CA Vikram Singh",
      designation: "Senior Faculty - Taxation & Audit",
      expertise: "Tax",
      experience: 20,
      rating: "4.8",
      totalStudents: "11,200+",
      coursesTaught: ["CA Inter", "CA Final", "CMA Final"],
      image: "https://images.unsplash.com/photo-1645856046662-6c2116952317?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      specialization: "Direct & Indirect Taxation",
      qualifications: ["CA", "CFA", "B.Com (Hons)"],
      tagline: "Taxation simplified, success guaranteed",
      achievements: ["420+ Top Rankers", "ICAI Gold Medalist", "Tax Advisory Expert"]
    },
    {
      id: 4,
      name: "Prof. Meera Desai",
      designation: "Senior Faculty - Cost & Management Accounting",
      expertise: "Costing",
      experience: 16,
      rating: "4.8",
      totalStudents: "9,800+",
      coursesTaught: ["CMA Inter", "CMA Final", "CA Inter"],
      image: "https://images.unsplash.com/photo-1546954552-eb2ada4a3654?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      specialization: "Strategic Cost Management",
      qualifications: ["CMA", "M.Com", "MBA Finance"],
      tagline: "Strategic thinking meets cost excellence",
      achievements: ["350+ Top Rankers", "Industry Consultant", "Research Scholar"]
    },
    {
      id: 5,
      name: "Dr. Aditya Kapoor",
      designation: "Associate Faculty - Economics & Statistics",
      expertise: "Economics",
      experience: 14,
      rating: "4.7",
      totalStudents: "8,600+",
      coursesTaught: ["CA Foundation", "CS Foundation", "CMA Foundation"],
      image: "https://images.unsplash.com/photo-1581125119293-4803aa54b372?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      specialization: "Business Economics & Quantitative Methods",
      qualifications: ["PhD Economics", "M.Sc Statistics", "B.Com"],
      tagline: "Data-driven insights for future leaders",
      achievements: ["300+ Top Rankers", "Published 8 Research Papers", "Economics Blogger"]
    },
    {
      id: 6,
      name: "CA Priya Nair",
      designation: "Faculty - Financial Management & Strategic Costing",
      expertise: "Finance",
      experience: 12,
      rating: "4.8",
      totalStudents: "7,400+",
      coursesTaught: ["CA Final", "CMA Inter", "CMA Final"],
      image: "https://images.unsplash.com/photo-1593442808882-775dfcd90699?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
      specialization: "Financial Strategy & Performance Management",
      qualifications: ["CA", "CMA", "MBA"],
      tagline: "Your partner in financial mastery",
      achievements: ["280+ Top Rankers", "CFO Advisory", "Young Achiever Award"]
    }
  ];

  const expertiseColors: Record<string, { bg: string; text: string; gradient: string }> = {
    "Accounts": { bg: "bg-blue-500/10", text: "text-blue-400", gradient: "from-blue-500 to-cyan-500" },
    "Law": { bg: "bg-purple-500/10", text: "text-purple-400", gradient: "from-purple-500 to-pink-500" },
    "Tax": { bg: "bg-amber-500/10", text: "text-amber-400", gradient: "from-amber-500 to-orange-500" },
    "Costing": { bg: "bg-emerald-500/10", text: "text-emerald-400", gradient: "from-emerald-500 to-teal-500" },
    "Economics": { bg: "bg-indigo-500/10", text: "text-indigo-400", gradient: "from-indigo-500 to-blue-500" },
    "Finance": { bg: "bg-rose-500/10", text: "text-rose-400", gradient: "from-rose-500 to-pink-500" }
  };

  const selectedFacultyData = facultyMembers[selectedFaculty];
  const expertiseColor = expertiseColors[selectedFacultyData.expertise];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-200 px-5 py-2.5 rounded-full mb-6">
            <Award className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-gray-900">World-Class Faculty</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Learn from the{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
                Best Minds
              </span>
              <span className="absolute -bottom-2 left-0 w-full h-3 bg-amber-200 -rotate-1"></span>
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Meet the educators who've mentored 50,000+ successful professionals across India. Their expertise is your advantage.
          </p>
        </div>

        {/* Split Screen Layout - Unique Design */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          {/* Left Side - Featured Faculty (Large) */}
          <div className="lg:col-span-7">
            <div className="relative group">
              {/* Decorative Elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-amber-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                {/* Image Container with Overlay */}
                <div className="relative h-[600px] overflow-hidden">
                  <ImageWithFallback
                    src={selectedFacultyData.image}
                    alt={selectedFacultyData.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                  <div className={`absolute inset-0 bg-gradient-to-tr ${expertiseColor.gradient} opacity-20 mix-blend-overlay`}></div>
                  
                  {/* Floating Stats Badges */}
                  <div className="absolute top-6 right-6 flex flex-col gap-3">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        <span className="text-2xl font-black text-gray-900">{selectedFacultyData.rating}</span>
                      </div>
                      <p className="text-xs text-gray-600">Student Rating</p>
                    </div>
                    
                    <div className={`bg-gradient-to-r ${expertiseColor.gradient} rounded-2xl px-4 py-3 shadow-lg text-white`}>
                      <p className="text-2xl font-black leading-none mb-1">{selectedFacultyData.experience}+</p>
                      <p className="text-xs opacity-90">Years Exp.</p>
                    </div>
                  </div>

                  {/* Bottom Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
                    {/* Expertise Badge */}
                    <div className="inline-flex">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold ${expertiseColor.bg} ${expertiseColor.text} border border-current/20 backdrop-blur-sm`}>
                        {selectedFacultyData.expertise} Expert
                      </span>
                    </div>

                    {/* Name & Title */}
                    <div>
                      <h2 className="text-4xl font-black text-white mb-2 leading-tight">
                        {selectedFacultyData.name}
                      </h2>
                      <p className="text-lg text-gray-300 mb-3">
                        {selectedFacultyData.designation}
                      </p>
                      
                      {/* Tagline with Quote */}
                      <div className="flex items-start gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <Quote className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                        <p className="text-white/90 italic leading-relaxed">
                          {selectedFacultyData.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats Row */}
                    <div className="flex items-center gap-6 pt-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{selectedFacultyData.totalStudents}</p>
                          <p className="text-xs text-gray-400">Students Taught</p>
                        </div>
                      </div>
                      
                      <div className="w-px h-12 bg-white/20"></div>
                      
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{selectedFacultyData.achievements[0].split(' ')[0]}</p>
                          <p className="text-xs text-gray-400">Top Rankers</p>
                        </div>
                      </div>

                      <div className="w-px h-12 bg-white/20"></div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-2xl font-black text-white leading-none">{selectedFacultyData.coursesTaught.length}</p>
                          <p className="text-xs text-gray-400">Programs</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section Below Image */}
                <div className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white">
                  {/* Qualifications */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Qualifications</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFacultyData.qualifications.map((qual, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full text-sm font-bold"
                        >
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Specialization</p>
                    <p className="text-lg text-gray-900 font-medium">{selectedFacultyData.specialization}</p>
                  </div>

                  {/* Achievements */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Achievements</p>
                    <div className="space-y-2">
                      {selectedFacultyData.achievements.map((achievement, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${expertiseColor.text}`} />
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Courses Taught */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Courses Taught</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFacultyData.coursesTaught.map((course, idx) => (
                        <span
                          key={idx}
                          className={`px-4 py-2 ${expertiseColor.bg} ${expertiseColor.text} rounded-lg text-sm font-semibold border border-current/20`}
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button className={`flex-1 bg-gradient-to-r ${expertiseColor.gradient} text-white hover:opacity-90 py-6 rounded-xl text-base group`}>
                      <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Watch Demo Class
                    </Button>
                    <Button variant="outline" className="flex-1 border-2 border-gray-300 hover:border-gray-900 py-6 rounded-xl text-base">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Faculty Selection Grid */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-24 space-y-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Select Faculty Member</h3>
              
              {facultyMembers.map((faculty, idx) => {
                const isSelected = selectedFaculty === idx;
                const isHovered = hoveredCard === idx;
                const colors = expertiseColors[faculty.expertise];
                
                return (
                  <div
                    key={faculty.id}
                    onClick={() => setSelectedFaculty(idx)}
                    onMouseEnter={() => setHoveredCard(idx)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className={`relative cursor-pointer group transition-all duration-300 ${
                      isSelected ? 'scale-100' : 'scale-95 hover:scale-100'
                    }`}
                  >
                    {/* Glow Effect */}
                    {(isSelected || isHovered) && (
                      <div className={`absolute -inset-1 bg-gradient-to-r ${colors.gradient} rounded-2xl blur-lg opacity-50`}></div>
                    )}
                    
                    {/* Card */}
                    <div className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected 
                        ? `${colors.bg} border-current shadow-lg`
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}>
                      {/* Image */}
                      <div className="relative">
                        <div className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                          isSelected ? 'border-current' : 'border-gray-200'
                        }`}>
                          <ImageWithFallback
                            src={faculty.image}
                            alt={faculty.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Experience Badge */}
                        <div className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${colors.gradient} text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg`}>
                          {faculty.experience}Y
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold text-sm mb-1 truncate ${
                          isSelected ? colors.text : 'text-gray-900'
                        }`}>
                          {faculty.name}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 truncate">{faculty.expertise} Expert</p>
                        
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-gray-700 font-semibold">{faculty.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600">{faculty.totalStudents}</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow Indicator */}
                      <ArrowRight className={`w-5 h-5 transition-all duration-300 ${
                        isSelected 
                          ? `${colors.text} translate-x-1` 
                          : 'text-gray-400 group-hover:translate-x-1'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 p-12 mb-20">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
          
          <div className="relative grid md:grid-cols-4 gap-8 text-center text-white">
            {[
              { icon: GraduationCap, value: "100+", label: "Expert Faculty", sublabel: "Across all programs" },
              { icon: Users, value: "50,000+", label: "Students Mentored", sublabel: "Pan India reach" },
              { icon: Trophy, value: "1,850+", label: "Top Rankers", sublabel: "All India ranks" },
              { icon: TrendingUp, value: "98%", label: "Success Rate", sublabel: "Industry leading" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-3">
                <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-5xl font-black mb-1">{stat.value}</p>
                  <p className="text-lg font-semibold mb-1">{stat.label}</p>
                  <p className="text-sm opacity-80">{stat.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-3xl p-12">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-4xl font-black text-gray-900 mb-4">
            Ready to Learn from the Best?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book a free consultation with our faculty and discover your path to success
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg group">
              <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Book Free Demo Class
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button size="lg" variant="outline" className="border-2 border-gray-300 hover:border-gray-900 px-8 py-6 text-lg rounded-xl">
              <Video className="w-5 h-5 mr-2" />
              Watch Faculty Interviews
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 mt-8 pt-8 border-t border-gray-200">
            {[
              { icon: CheckCircle2, text: "100% Expert Faculty" },
              { icon: Award, text: "Industry Certified" },
              { icon: Target, text: "Result-Oriented Teaching" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-600">
                <item.icon className="w-5 h-5 text-gray-900" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
