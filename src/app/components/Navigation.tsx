import { useState, useEffect } from "react";
import { Menu, X, Megaphone } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LayoutDashboard, LogOut, User as UserIcon, Bell, Settings, ChevronDown, ChevronRight, ChevronUp, Book, Newspaper, Zap, FileText, History, Users, GraduationCap, Briefcase, Heart, Globe } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useCourseContext } from "../admin/context/CourseContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart as CartIcon } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import {
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "./ui/dropdown-menu";
import React from "react";
import { landingPageApi } from "../api/api";
import { generateSlug } from "../admin/utils/slugify";


export function Navigation() {
  const { categories, courses } = useCourseContext();
  const { cartCount, setIsDrawerOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState({ messages: [] as string[], show: false });
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (name: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { ok, data } = await landingPageApi.getLandingContent();
        if (ok && data.success) {
          setAnnouncement({
            messages: data.data.announcements || [data.data.announcementText] || [],
            show: data.data.showAnnouncement !== undefined ? data.data.showAnnouncement : true
          });
        }
      } catch (error) {
        console.error("Failed to fetch announcement", error);
      }
    };
    fetchAnnouncement();
  }, []);

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAuthenticated = !!localStorage.getItem("token") && user?.role === "student";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };
  const toggleExpanded = (name: string) => {
    setExpandedItem(expandedItem === name ? null : name);
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    // Home page exact match
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  }
  // Build dynamic navigation items
  const dynamicNavigationItems = [
    // { name: "Home", href: "/" },
    {
      name: "About Us",
      href: "/about/history",
      isMega: true,
      children: [
        {
          name: "Our History",
          href: "/about/history",
          description: "The journey of India's leading CA coaching institute since 1983.",
          icon: History,
          color: "primary"
        },
        {
          name: "Alumni",
          href: "/alumni",
          description: "Success stories of our students making a mark across industries.",
          icon: Users,
          color: "accent"
        },
        // {
        //   name: "Faculty",
        //   href: "/faculty",
        //   description: "Learn from some of the best minds in professional education.",
        //   icon: GraduationCap,
        //   color: "primary"
        // },
        {
          name: "Careers",
          href: "/careers",
          description: "Join our team and build a rewarding professional career.",
          icon: Briefcase,
          color: "accent"
        },
        {
          name: "CSR",
          href: "/about/csr",
          description: "Our commitment to giving back to the community.",
          icon: Heart,
          color: "primary"
        },
        // {
        //   name: "Media Coverage",
        //   href: "/about/press",
        //   description: "JK Shah Classes featured in news and media coverage.",
        //   icon: Globe,
        //   color: "accent"
        // }
      ]
    },
    {
      name: "Courses",
      href: "/courses",
      children: categories
        .filter(c => !c.parent)
        .map(parent => {
          const subCategories = categories.filter(c => c.parent === parent._id);

          if (subCategories.length === 0) {
            // No subcategories, find the first course in this category
            const course = courses.find(course => course.category === parent.name);
            return {
              name: parent.name,
              href: course ? `/course/${generateSlug(course.title)}` : `/courses/category/${parent._id}`
            };
          }

          return {
            name: parent.name,
            href: `/courses/category/${parent._id}`,
            children: subCategories.map(child => {
              const course = courses.find(course => course.subCategory === child.name);
              return {
                name: child.name,
                href: course ? `/course/${generateSlug(course.title)}` : `/courses/category/${child._id}`
              };
            })
          };
        })
    },
    { name: "Branches", href: "/branches" },
    {
      name: "Our Achievers",
      // href: "/ourachievers",
      children: [
        { name: "Alumni", href: "/alumni" },
        { name: "Hall of Fame", href: "/ourachievers" },
      ]
    },
    // { name: "Faculty", href: "/faculty" },
    // { name: "Placement", href: "/live-sessions" },
    { name: "Placement", href: "/placements" },
    // { name: "Careers", href: "/careers", requiresAuth: true },
    // { name: "Blog", href: "/blog" },
    // {
    //   name: "Resources",
    //   href: "/resources",
    //   isMega: true,
    //   children: [
    //     {
    //       name: "Books & Study Material",
    //       href: "/resources/books",
    //       description: "Curated study kits, textbooks, and practice manuals.",
    //       icon: Book,
    //       color: "primary",
    //       isComingSoon: true
    //     },
    //     {
    //       name: "Test Series",
    //       href: "/resources/test-series",
    //       description: "All-India mock tests with detailed performance analytics.",
    //       icon: FileText,
    //       color: "accent"
    //     },
    //     {
    //       name: "Blogs",
    //       href: "/blog",
    //       description: "Expert exam preparation tips and subject updates.",
    //       icon: Newspaper,
    //       color: "primary"
    //     },
    //     // {
    //     //   name: "Announcements",
    //     //   href: "/resources/announcements",
    //     //   description: "Important exam notifications and class schedules.",
    //     //   icon: Bell,
    //     //   color: "accent"
    //     // },
    //     {
    //       name: "Free Resources",
    //       href: "/resources/free",
    //       description: "Downloadable notes, charts, and video tutorials.",
    //       icon: Zap,
    //       color: "primary"
    //     }
    //   ]
    // },
    // { name: "Test Series", href: "/test-series" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* Announcement Marquee Strip */}
      {announcement.show && announcement.messages.length > 0 && (
        <div className="bg-primary text-white py-1.5 overflow-hidden border-b border-white/10 relative z-[60]">
          <div className="max-w-full mx-auto relative flex items-center px-2">
            {/* <div className="flex items-center gap-2 bg-primary px-4 absolute left-0 z-10 shadow-[5px_0_10px_rgba(0,0,0,0.1)]">
              <Megaphone className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Latest:</span>
            </div> */}

            <div className="whitespace-nowrap flex animate-marquee">
              {announcement.messages.map((msg, idx) => (
                <span key={`msg-1-${idx}`} className="text-xs font-medium px-8 border-r border-white/20 last:border-r-0">{msg}</span>
              ))}
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
            .animate-marquee {
              animation: marquee 25s linear infinite;
              display: inline-flex;
            }
            .animate-marquee:hover {
              animation-play-state: paused;
            }
          `}} />
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-border">
        <div className="max-w-full mx-auto pl-0 pr-1 sm:px-4">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                onClick={handleNavClick}
                className="flex items-center gap-1 sm:gap-2 cursor-pointer"
              >
                <img
                  src="/uploads/2026/02/J K Shah_New logo 24-01.png"
                  alt="JK Shah Classes"
                  className="h-10 sm:h-14 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:items-center lg:space-x-0.5">
              {dynamicNavigationItems.map((item) => (
                item.children ? (
                  <DropdownMenu
                    key={item.name}
                    open={activeDropdown === item.name}
                    onOpenChange={(open) => !open && setActiveDropdown(null)}
                  >
                    <DropdownMenuTrigger asChild>
                      {item.href === "#" ? (
                        <button
                          onMouseEnter={() => handleMouseEnter(item.name)}
                          onMouseLeave={handleMouseLeave}
                          className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm relative flex items-center gap-1 ${isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted/50"
                            }`}
                        >
                          {item.name}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </button>
                      ) : (
                        <Link
                          to={(item as any).requiresAuth && !isAuthenticated ? "/login" : item.href}
                          onMouseEnter={() => handleMouseEnter(item.name)}
                          onMouseLeave={handleMouseLeave}
                          className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm relative flex items-center gap-1 ${isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-muted/50"
                            }`}
                        >
                          {item.name}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                          {isActive(item.href) && (
                            <span className="absolute -bottom-[9px] left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                          )}
                        </Link>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      sideOffset={2}
                      className={item.isMega ? "w-[600px] p-4" : "w-48"}
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {item.isMega ? (
                        <div className="grid grid-cols-2 gap-4">
                          {item.children.map((child: any) => (
                            <DropdownMenuItem
                              key={child.name}
                              onClick={() => !child.isComingSoon && navigate((child as any).requiresAuth && !isAuthenticated ? "/login" : child.href)}
                              className={`flex items-start gap-4 p-3 rounded-xl transition-all group ${child.isComingSoon ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/50 focus:bg-muted/50 cursor-pointer"}`}
                            >
                              <div className={`bg-${child.color}/10 rounded-lg p-2 ${!child.isComingSoon && `group-hover:bg-${child.color}/20`} transition-colors`}>
                                <child.icon className={`w-5 h-5 text-${child.color}`} />
                              </div>
                              <div className="space-y-1 min-w-0 flex-1">
                                <p className={`text-sm font-bold text-foreground ${!child.isComingSoon && 'group-hover:text-primary'} transition-colors flex items-center gap-2 flex-wrap`}>
                                  <span>{child.name}</span>
                                  {child.isComingSoon && (
                                    <span className="text-[9px] bg-[#373081] text-accent px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0">Coming Soon</span>
                                  )}
                                </p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{child.description}</p>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      ) : (
                        item.children.map((child) => (
                          child.children ? (
                            <DropdownMenuSub key={child.name}>
                              <DropdownMenuSubTrigger>
                                <span>{child.name}</span>
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {child.children.map((subChild) => (
                                  <DropdownMenuItem
                                    key={subChild.name}
                                    onClick={() => navigate((subChild as any).requiresAuth && !isAuthenticated ? "/login" : subChild.href)}
                                  >
                                    {subChild.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                          ) : (
                            <DropdownMenuItem
                              key={child.name}
                              onClick={() => navigate((child as any).requiresAuth && !isAuthenticated ? "/login" : child.href)}
                            >
                              {child.name}
                            </DropdownMenuItem>
                          )
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.name}
                    to={(item as any).requiresAuth && !isAuthenticated ? "/login" : item.href}
                    className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm relative ${isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted/50"
                      }`}
                  >
                    {item.name}
                    {isActive(item.href) && (
                      <span className="absolute -bottom-[9px] left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></span>
                    )}
                  </Link>
                )
              ))}
            </div>

            {/* Login/Sign Up or Profile - Desktop */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {/* Cart Icon */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <CartIcon className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#EF4444] text-white text-[10px] font-bold min-w-[17px] h-[17px] flex items-center justify-center rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </button>

              <div className="h-6 w-px bg-border mx-1" />

              {!isAuthenticated ? (
                <>
                  <Link to="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-8"
                    >
                      Login
                    </Button>
                  </Link>
                  {/* <Link to="/signup">
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-8"
                    >
                      Sign Up
                    </Button>
                  </Link> */}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {/* <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-muted">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">Notifications</h4>
                        <span className="text-xs text-primary hover:underline cursor-pointer">Mark all as read</span>
                      </div>
                      <div className="space-y-3">
                        <div className="flex gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                          <div className="space-y-1">
                            <p className="font-medium leading-none">New Lecture Added</p>
                            <p className="text-xs text-muted-foreground">CA Foundation - Accounting</p>
                            <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="h-2 w-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                          <div className="space-y-1">
                            <p className="font-medium leading-none">Assignment Due Soon</p>
                            <p className="text-xs text-muted-foreground">Submit by tomorrow, 11:59 PM</p>
                            <p className="text-[10px] text-muted-foreground">5 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs h-8">View All Notifications</Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                      <Settings className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Account Settings</DropdownMenuItem>
                    <DropdownMenuItem>Learning Preferences</DropdownMenuItem>
                    <DropdownMenuItem>Privacy Policy</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/student-dashboard")}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>My Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <div className="flex items-center gap-2">
                {!isOpen && (
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="relative p-1.5 text-muted-foreground"
                  >
                    <CartIcon className="w-5 h-5 text-gray-600" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 bg-[#EF4444] text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                {!isOpen && isAuthenticated && (
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                      {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-1.5 rounded-md text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent"
                  aria-expanded={isOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isOpen ? (
                    <X className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <CartDrawer />

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-border bg-white shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-3 pt-2 pb-6 space-y-0.5">
              {dynamicNavigationItems.map((item) => (
                <div
                  key={item.name}
                  onMouseLeave={() => setExpandedItem(null)}
                >
                  {item.children ? (
                    <div className="space-y-0.5">
                      <div
                        className={`group flex items-center justify-between w-full rounded-md transition-all ${expandedItem === item.name ? "bg-primary/5" : "hover:bg-muted"
                          }`}
                        onMouseEnter={() => setExpandedItem(item.name)}
                      >
                        <Link
                          to={item.href}
                          onClick={handleNavClick}
                          className={`flex-1 px-3 py-2 font-medium text-sm transition-colors ${expandedItem === item.name ? "text-primary" : "text-foreground"
                            }`}
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleExpanded(item.name);
                          }}
                          className={`px-4 py-2 border-l border-border/50 text-muted-foreground hover:text-primary transition-colors ${expandedItem === item.name ? "text-primary bg-primary/10" : ""}`}
                        >
                          {expandedItem === item.name ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {expandedItem === item.name && (
                        <div className="mt-1 ml-2 pl-2 border-l-2 border-primary/10 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                          {item.children.map((child: any) => (
                            <div key={child.name} className="space-y-0.5">
                              {child.children ? (
                                <>
                                  <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                    {child.name}
                                  </div>
                                  {child.children.map((subChild: any) => (
                                    <Link
                                      key={subChild.name}
                                      to={(subChild as any).requiresAuth && !isAuthenticated ? "/login" : subChild.href}
                                      onClick={handleNavClick}
                                      className={`block w-full text-left px-6 py-2 rounded-md transition-all duration-200 text-sm ${isActive(subChild.href)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-foreground hover:bg-muted"
                                        }`}
                                    >
                                      {subChild.name}
                                    </Link>
                                  ))}
                                </>
                              ) : child.isComingSoon ? (
                                <div
                                  key={child.name}
                                  className="flex items-start gap-4 w-full text-left px-3 py-3 rounded-md opacity-60 grayscale-[0.5]"
                                >
                                  {child.icon && (
                                    <div className={`p-1.5 rounded-lg bg-${child.color}/10 mt-0.5`}>
                                      <child.icon className={`h-4 w-4 text-${child.color}`} />
                                    </div>
                                  )}
                                  <div className="space-y-0.5 min-w-0 flex-1">
                                    <p className="text-sm font-bold text-foreground flex items-center gap-2 flex-wrap">
                                      <span>{child.name}</span>
                                      <span className="text-[9px] bg-[#373081] text-accent px-2 py-0.5 rounded-full font-black uppercase tracking-wider whitespace-nowrap flex-shrink-0">Coming Soon</span>
                                    </p>
                                    {child.description && (
                                      <p className="text-[10px] opacity-70 leading-tight">{child.description}</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <Link
                                  key={child.name}
                                  to={(child as any).requiresAuth && !isAuthenticated ? "/login" : child.href}
                                  onClick={handleNavClick}
                                  className={`flex items-start gap-4 w-full text-left px-3 py-3 rounded-md transition-all duration-200 ${isActive(child.href)
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                                    }`}
                                >
                                  {child.icon && (
                                    <div className={`p-1.5 rounded-lg bg-${child.color}/10 mt-0.5`}>
                                      <child.icon className={`h-4 w-4 text-${child.color}`} />
                                    </div>
                                  )}
                                  <div className="space-y-0.5">
                                    <p className="text-sm font-bold">{child.name}</p>
                                    {child.description && (
                                      <p className="text-[10px] opacity-70 leading-tight">{child.description}</p>
                                    )}
                                  </div>
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={(item as any).requiresAuth && !isAuthenticated ? "/login" : item.href}
                      onClick={handleNavClick}
                      className={`block w-full text-left px-3 py-2 rounded-md transition-all duration-200 text-sm ${isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                        }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-2 pb-1 space-y-1.5 border-t border-border/50 mt-2">
                {!isAuthenticated ? (
                  <>
                    <Link to="/login" onClick={handleNavClick}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-border text-foreground hover:bg-muted hover:!text-foreground text-sm h-8"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup" onClick={handleNavClick}>
                      <Button
                        size="sm"
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm h-8"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="space-y-1">
                    <Link to="/student-dashboard" onClick={handleNavClick}>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-sm h-9">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to="/profile" onClick={handleNavClick}>
                      <Button variant="ghost" size="sm" className="w-full justify-start text-sm h-9">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile Settings
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { handleLogout(); handleNavClick(); }}
                      className="w-full justify-start text-sm h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}