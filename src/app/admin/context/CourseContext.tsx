import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { categoryApi, courseApi, levelApi, facultyApi, rankHolderApi, courseTimelineApi, careerOpportunityApi } from "../../api/api";

import { toast } from "sonner";

export interface Course {
    _id: string;
    slug: string;
    title: string;
    description: string;
    overview?: string;
    category: string;
    subCategory: string;
    price: number;
    originalPrice?: number;
    duration: string;
    lessons: number;
    rating: number;
    reviews: number;
    facultyName: string;
    facultyImage: string;
    discount?: string;
    highlights: string[];
    tags: string[];
    enrolledTotal: number;
    enrolledRecent: number;
    status: "Active" | "Draft" | "Archived";
    image: string;
    batchInfo?: string;
    level: string;
    // New fields
    syllabusModules?: {
        title: string;
        topics: any[];
        duration: string;
        pdfUrl?: string;
    }[];
    facultyDesignation?: string;
    facultySpecialization?: string;
    facultyExperience?: string;
    facultyStudents?: string;
    facultyRating?: number;
    facultyBio?: string;
    courseFeatures?: string[];
    whatYouLearn?: string[];
    whoShouldEnroll?: string[];
    reviewsList?: {
        name: string;
        rating: number;
        date: string;
        text: string;
        achievement: string;
        image: string;
    }[];
    videos?: {
        title: string;
        url: string;
        description?: string;
    }[];
    faqs?: {
        category: string;
        topics: {
            title: string;
            questions: {
                question: string;
                answer: string;
            }[];
        }[];
    }[];
    testimonials?: {
        category: string;
        items: {
            name: string;
            message: string;
            image: string;
            designation: string;
            videoUrl: string;
        }[];
    }[];
    brochureUrl?: string;
    syllabusPdf?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
}

export interface Level {
    _id: string;
    name: string;
    description?: string;
}


export interface Category {
    _id: string;
    name: string;
    description?: string;
    parent?: string;
    whyTitle?: string;
    whyContent?: string;
    whyJKShahTitle?: string;
    whyJKShahContent?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    sequence?: number; // Add sequence field
}

export interface Faculty {
    _id: string;
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

export interface RankHolder {
    _id: string;
    name: string;
    image: string;
    category: string;
    globalRank: string;
    indiaRank: string;
    course: string;
    session: string;
}

export interface CourseTimeline {
    _id: string;
    subCategory: string;
    image: string;
}

export interface CareerOpportunityConfig {
    _id: string;
    subCategory: string;
    image: string;
    opportunities: string[];
}
interface CourseContextType {
    courses: Course[];
    categories: Category[];
    levels: Level[];
    rankHolders: RankHolder[];
    addCourse: (course: Partial<Course>) => Promise<void>;
    updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
    deleteCourse: (id: string) => Promise<void>;
    addCategory: (name: string, description?: string, parent?: string, slug?: string, metaTitle?: string, metaDescription?: string, metaKeywords?: string, whyTitle?: string, whyContent?: string, whyJKShahTitle?: string, whyJKShahContent?: string, sequence?: number) => Promise<void>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string, name: string) => Promise<void>;
    addLevel: (name: string) => Promise<void>;
    deleteLevel: (id: string, name: string) => Promise<void>;
    addRankHolder: (rankData: Partial<RankHolder>) => Promise<void>;
    updateRankHolder: (id: string, rankData: Partial<RankHolder>) => Promise<void>;
    deleteRankHolder: (id: string) => Promise<void>;
    courseTimelines: CourseTimeline[];
    addOrUpdateTimeline: (timelineData: Partial<CourseTimeline>) => Promise<void>;
    deleteTimeline: (id: string) => Promise<void>;
    careerConfigs: CareerOpportunityConfig[];
    addOrUpdateCareerConfig: (config: Partial<CareerOpportunityConfig>) => Promise<void>;
    deleteCareerConfig: (id: string) => Promise<void>;
    faculties: Faculty[];
    allCategories: Category[];
    allLevels: Level[];
    allFaculties: Faculty[];
    allCourses: Course[];
    loading: boolean;
    pagination: {
        courses: any;
        categories: any;
        levels: any;
        rankHolders: any;
        courseTimelines: any;
        careerConfigs: any;
    };
    refreshCourses: (params?: any) => Promise<void>;
    refreshRankHolders: (params?: any) => Promise<void>;
    refreshCategories: (params?: any) => Promise<void>;
    refreshLevels: (params?: any) => Promise<void>;
    refreshTimelines: (params?: any) => Promise<void>;
    refreshCareerConfigs: (params?: any) => Promise<void>;
}


const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [allLevels, setAllLevels] = useState<Level[]>([]);
    const [allFaculties, setAllFaculties] = useState<Faculty[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [rankHolders, setRankHolders] = useState<RankHolder[]>([]);
    const [courseTimelines, setCourseTimelines] = useState<CourseTimeline[]>([]);
    const [careerConfigs, setCareerConfigs] = useState<CareerOpportunityConfig[]>([]);
    const [loading, setLoading] = useState(true);


    const [pagination, setPagination] = useState({
        courses: null,
        categories: null,
        levels: null,
        rankHolders: null,
        courseTimelines: null,
        careerConfigs: null
    });

    const refreshCourses = async (params = {}) => {
        try {
            const { ok, data } = await courseApi.getCourses(params);
            if (ok && data.success) {
                setCourses(data.data);
                setPagination(prev => ({ ...prev, courses: data.pagination }));
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    const refreshRankHolders = async (params = {}) => {
        try {
            const { ok, data } = await rankHolderApi.getRankHolders(params);
            if (ok && data.success) {
                setRankHolders(data.data);
                setPagination(prev => ({ ...prev, rankHolders: data.pagination }));
            }
        } catch (error) {
            console.error("Failed to fetch rank holders:", error);
        }
    };

    const refreshCategories = async (params = {}) => {
        try {
            const { ok, data } = await categoryApi.getCategories(params);
            if (ok && data.success) {
                setCategories(data.data);
                setPagination(prev => ({ ...prev, categories: data.pagination }));
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const refreshLevels = async (params = {}) => {
        try {
            const { ok, data } = await levelApi.getLevels(params);
            if (ok && data.success) {
                setLevels(data.data);
                setPagination(prev => ({ ...prev, levels: data.pagination }));
            }
        } catch (error) {
            console.error("Failed to fetch levels:", error);
        }
    };

    const refreshTimelines = async (params = {}) => {
        try {
            const { ok, data } = await courseTimelineApi.getTimelines(params);
            if (ok && data.success) {
                setCourseTimelines(data.data);
                setPagination(prev => ({ ...prev, courseTimelines: data.pagination }));
            }
        } catch (error) {
            console.error("Failed to fetch timelines:", error);
        }
    };

    const refreshCareerConfigs = async (params = {}) => {
        try {
            const { ok, data } = await careerOpportunityApi.getCareerOpportunities(params);
            if (ok && data.success) {
                setCareerConfigs(data.data);
                setPagination(prev => ({ ...prev, careerConfigs: data.pagination }));
            }
        } catch (error) {
            console.error("Failed to fetch career opportunities:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Master Lists (for dropdowns/filters)
                const [catRes, lvlRes, facRes, crsRes] = await Promise.all([
                    categoryApi.getCategories({ limit: 1000 }),
                    levelApi.getLevels({ limit: 1000 }),
                    facultyApi.getFaculties(), // Assuming faculty already returns all
                    courseApi.getCourses({ limit: 1000 })
                ]);

                if (catRes.ok && catRes.data.success) setAllCategories(catRes.data.data);
                if (lvlRes.ok && lvlRes.data.success) setAllLevels(lvlRes.data.data);
                if (facRes.ok && facRes.data.success) {
                    setFaculties(facRes.data.data);
                    setAllFaculties(facRes.data.data);
                }
                if (crsRes.ok && crsRes.data.success) setAllCourses(crsRes.data.data);

                // Fetch Paginated Lists (for initial display)
                await Promise.all([
                    refreshCategories({ limit: 10 }),
                    refreshCourses({ limit: 10 }),
                    refreshLevels({ limit: 10 }),
                    refreshRankHolders({ limit: 10 }),
                    refreshTimelines({ limit: 10 }),
                    refreshCareerConfigs({ limit: 10 })
                ]);

            } catch (error) {
                console.error("Failed to fetch initial data:", error);
                toast.error("Failed to load data from server");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const addCourse = async (courseData: Partial<Course>) => {
        try {
            const { ok, data } = await courseApi.addCourse(courseData);
            if (ok && data.success) {
                setCourses((prev) => [...prev, data.data]);
                toast.success("Course added successfully");
            } else {
                toast.error(data.message || "Failed to add course");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const updateCourse = async (id: string, courseData: Partial<Course>) => {
        try {
            const { ok, data } = await courseApi.updateCourse(id, courseData);
            if (ok && data.success) {
                setCourses((prev) => prev.map(c => c._id === id ? data.data : c));
                toast.success("Course updated successfully");
            } else {
                toast.error(data.message || "Failed to update course");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const deleteCourse = async (id: string) => {
        try {
            const { ok, data } = await courseApi.deleteCourse(id);
            if (ok && data.success) {
                setCourses((prev) => prev.filter(c => c._id !== id));
                toast.success("Course deleted successfully");
            } else {
                toast.error(data.message || "Failed to delete course");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const addCategory = async (name: string, description?: string, parent?: string, slug?: string, metaTitle?: string, metaDescription?: string, metaKeywords?: string, whyTitle?: string, whyContent?: string, whyJKShahTitle?: string, whyJKShahContent?: string, sequence?: number) => {
        if (!name.trim()) return;

        try {
            const { ok, data } = await categoryApi.addCategory(name.trim(), description, parent, slug, metaTitle, metaDescription, metaKeywords, whyTitle, whyContent, whyJKShahTitle, whyJKShahContent, sequence);
            if (ok && data.success) {
                setCategories((prev) => [...prev, data.data]);
                toast.success("Category added successfully");
            } else {
                toast.error(data.message || "Failed to add category");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const updateCategory = async (id: string, categoryData: Partial<Category>) => {
        try {
            const { ok, data } = await categoryApi.updateCategory(id, categoryData);
            if (ok && data.success) {
                setCategories((prev) => prev.map(c => c._id === id ? data.data : c));
                toast.success("Category updated successfully");
            } else {
                toast.error(data.message || "Failed to update category");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const deleteCategory = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete category "${name}"?`)) {
            try {
                const { ok, data } = await categoryApi.deleteCategory(id);
                if (ok && data.success) {
                    setCategories((prev) => prev.filter((c) => c._id !== id));
                    setCourses(prev => prev.map(c => c.category === name ? { ...c, category: "Uncategorized" } : c));
                    toast.success("Category deleted successfully");
                } else {
                    toast.error(data.message || "Failed to delete category");
                }
            } catch (error) {
                toast.error("Failed to connect to server");
            }
        }
    };

    const addLevel = async (name: string) => {
        if (!name.trim()) return;

        try {
            const { ok, data } = await levelApi.addLevel(name.trim());
            if (ok && data.success) {
                setLevels((prev) => [...prev, data.data]);
                toast.success("Level added successfully");
            } else {
                toast.error(data.message || "Failed to add level");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const deleteLevel = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete level "${name}"?`)) {
            try {
                const { ok, data } = await levelApi.deleteLevel(id);
                if (ok && data.success) {
                    setLevels((prev) => prev.filter((l) => l._id !== id));
                    setCourses(prev => prev.map(c => c.level === name ? { ...c, level: "All" } : c));
                    toast.success("Level deleted successfully");
                } else {
                    toast.error(data.message || "Failed to delete level");
                }
            } catch (error) {
                toast.error("Failed to connect to server");
            }
        }
    };

    // Rank Holder Methods
    const addRankHolder = async (rankData: Partial<RankHolder>) => {
        try {
            const { ok, data } = await rankHolderApi.addRankHolder(rankData);
            if (ok && data.success) {
                setRankHolders((prev) => [...prev, data.data]);
                toast.success("Rank holder added successfully");
            } else {
                toast.error(data.message || "Failed to add rank holder");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const updateRankHolder = async (id: string, rankData: Partial<RankHolder>) => {
        try {
            const { ok, data } = await rankHolderApi.updateRankHolder(id, rankData);
            if (ok && data.success) {
                setRankHolders((prev) => prev.map(r => r._id === id ? data.data : r));
                toast.success("Rank holder updated successfully");
            } else {
                toast.error(data.message || "Failed to update rank holder");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const deleteRankHolder = async (id: string) => {
        if (confirm("Are you sure you want to delete this rank holder?")) {
            try {
                const { ok, data } = await rankHolderApi.deleteRankHolder(id);
                if (ok && data.success) {
                    setRankHolders((prev) => prev.filter(r => r._id !== id));
                    toast.success("Rank holder deleted successfully");
                } else {
                    toast.error(data.message || "Failed to delete rank holder");
                }
            } catch (error) {
                toast.error("Failed to connect to server");
            }
        }
    };

    // Course Timeline Methods
    const addOrUpdateTimeline = async (timelineData: Partial<CourseTimeline>) => {
        try {
            const { ok, data } = await courseTimelineApi.addOrUpdateTimeline(timelineData);
            if (ok && data.success) {
                const existingIndex = courseTimelines.findIndex(t => t.subCategory === data.data.subCategory);
                if (existingIndex > -1) {
                    setCourseTimelines(prev => prev.map(t => t.subCategory === data.data.subCategory ? data.data : t));
                } else {
                    setCourseTimelines(prev => [...prev, data.data]);
                }
                toast.success("Timeline saved successfully");
            } else {
                toast.error(data.message || "Failed to save timeline");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const deleteTimeline = async (id: string) => {
        if (confirm("Are you sure you want to delete this course timeline?")) {
            try {
                const { ok, data } = await courseTimelineApi.deleteTimeline(id);
                if (ok && data.success) {
                    setCourseTimelines(prev => prev.filter(t => t._id !== id));
                    toast.success("Timeline deleted successfully");
                } else {
                    toast.error(data.message || "Failed to delete timeline");
                }
            } catch (error) {
                toast.error("Failed to connect to server");
            }
        }
    };

    // Career Opportunity Methods
    const addOrUpdateCareerConfig = async (configData: Partial<CareerOpportunityConfig>) => {
        try {
            const { ok, data } = await careerOpportunityApi.addOrUpdateCareerOpportunity(configData);
            if (ok && data.success) {
                const existingIndex = careerConfigs.findIndex(c => c.subCategory === data.data.subCategory);
                if (existingIndex > -1) {
                    setCareerConfigs(prev => prev.map(c => c.subCategory === data.data.subCategory ? data.data : c));
                } else {
                    setCareerConfigs(prev => [...prev, data.data]);
                }
                toast.success("Career config saved successfully");
            } else {
                toast.error(data.message || "Failed to save career config");
            }
        } catch (error) {
            toast.error("Failed to connect to server");
        }
    };

    const deleteCareerConfig = async (id: string) => {
        if (confirm("Are you sure you want to delete this career opportunity config?")) {
            try {
                const { ok, data } = await careerOpportunityApi.deleteCareerOpportunity(id);
                if (ok && data.success) {
                    setCareerConfigs(prev => prev.filter(c => c._id !== id));
                    toast.success("Config deleted successfully");
                } else {
                    toast.error(data.message || "Failed to delete config");
                }
            } catch (error) {
                toast.error("Failed to connect to server");
            }
        }
    };


    return (
        <CourseContext.Provider value={{
            courses, categories, levels, faculties, rankHolders,
            addCourse, updateCourse, deleteCourse,
            addCategory, updateCategory, deleteCategory,
            addLevel, deleteLevel,
            addRankHolder, updateRankHolder, deleteRankHolder,
            courseTimelines, addOrUpdateTimeline, deleteTimeline,
            careerConfigs, addOrUpdateCareerConfig, deleteCareerConfig,
            loading, pagination,
            allCategories, allLevels, allFaculties, allCourses,
            refreshCourses, refreshRankHolders, refreshCategories,
            refreshLevels, refreshTimelines, refreshCareerConfigs
        }}>

            {children}
        </CourseContext.Provider>
    );
}

export function useCourseContext() {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("useCourseContext must be used within a CourseProvider");
    }
    return context;
}
