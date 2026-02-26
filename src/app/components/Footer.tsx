import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { landingPageApi } from "../api/api";

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();
  const [content, setContent] = useState<any>(null);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { ok, data } = await landingPageApi.getLandingContent();
        if (ok && data.success) {
          // Use fetched content or fallback to defaults if globalFooter is missing
          setContent(data.data.globalFooter || defaultFooter);
        } else {
          setContent(defaultFooter);
        }
      } catch (error) {
        console.error("Failed to load footer content");
        setContent(defaultFooter);
      }
    };
    fetchContent();
  }, []);

  const defaultFooter = {
    description: 'Professional education platform empowering students in CA, CS, CMA courses with expert guidance.',
    contactInfo: {
      address: 'Multiple locations across Mumbai, Delhi, Bangalore, Pune, India',
      phone: '+91 123 456 7890',
      email: 'info@jkshah.com'
    },
    quickLinks: [
      { name: "Home", path: "/" },
      { name: "Our History", path: "/about/history" },
      { name: "Courses", path: "/courses" },
      { name: "Branches", path: "/branches" },
      { name: "Faculty", path: "/faculty" },
      { name: "Online Learning", path: "/live-sessions" },
      { name: "Student Dashboard", path: "/" }
    ],
    popularCourses: [
      { name: "CA Foundation", path: "/courses/ca-foundation" },
      { name: "CA Intermediate", path: "/courses/ca-intermediate" },
      { name: "CA Final", path: "/courses/ca-final" },
      { name: "CS Executive", path: "/courses/cs-executive" },
      { name: "CS Professional", path: "/courses/cs-professional" },
      { name: "CMA Intermediate", path: "/courses/cma-intermediate" },
      { name: "CMA Final", path: "/courses/cma-final" }
    ],
    stats: [
      { value: "25k+", label: "Students" },
      { value: "50+", label: "Courses" },
      { value: "94%", label: "Success" }
    ],
    socialLinks: [
      { platform: "Facebook", url: "#" },
      { platform: "Twitter", url: "#" },
      { platform: "Instagram", url: "#" },
      { platform: "LinkedIn", url: "#" },
      { platform: "YouTube", url: "#" }
    ]
  };

  const socialIcons: any = {
    Facebook,
    Twitter,
    Instagram,
    LinkedIn: Linkedin,
    YouTube: Youtube
  };

  if (!content) return null; // Or show static fallback

  return (
    <footer className="bg-gradient-to-br from-foreground to-foreground/95 text-white">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isHomePage ? 'pb-16' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* About Section */}
          <div>
            <div className="mb-4">
              <img
                src="/uploads/2026/02/J K Shah_New logo 24-01.png"
                alt="JK Shah Classes"
                className="h-12 w-auto object-contain bg-white rounded-md p-1"
              />
            </div>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              {content.description}
            </p>
            <div className="flex gap-2">
              {content.socialLinks?.map((link: any) => {
                const Icon = socialIcons[link.platform] || Facebook;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label={link.platform}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm text-white">Quick Links</h4>
            <ul className="space-y-1.5 text-xs">
              {content.quickLinks?.map((link: any) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                    <span className="w-1 h-1 bg-white rounded-full"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="mb-3 text-sm text-white">Popular Courses</h4>
            <ul className="space-y-1.5 text-xs">
              {content.popularCourses?.map((course: any, idx: number) => {
                const courseName = typeof course === 'string' ? course : course.name;
                const coursePath = typeof course === 'string' ? "/courses" : course.path;
                return (
                  <li key={idx}>
                    <Link to={coursePath} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                      <span className="w-1 h-1 bg-white rounded-full"></span>
                      {courseName}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-3 text-sm text-white">Get In Touch</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 leading-relaxed">
                  {content.contactInfo?.address}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-white mt-0.5 flex-shrink-0" />
                <a href={`tel:${content.contactInfo?.phone}`} className="text-gray-400 hover:text-white transition-colors">
                  {content.contactInfo?.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 text-white mt-0.5 flex-shrink-0" />
                <a href={`mailto:${content.contactInfo?.email}`} className="text-gray-400 hover:text-white transition-colors">
                  {content.contactInfo?.email}
                </a>
              </li>
            </ul>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {content.stats?.map((stat: any, idx: number) => (
                <div key={idx} className="bg-white/5 rounded p-2">
                  <p className="text-sm text-white">{stat.value}</p>
                  <p className="text-[9px] text-gray-400 uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-400">
            <p>© {currentYear} JK Shah Classes. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="/refund-policy" className="hover:text-white transition-colors">
                Refund policy
              </Link>
              {/* <button
                onClick={() => navigate("/admin")}
                className="hover:text-white transition-colors text-xs opacity-50 hover:opacity-100"
              >
                Admin Portal
              </button> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}