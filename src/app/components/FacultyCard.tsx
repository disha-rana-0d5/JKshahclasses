import { Award, BookOpen, Star, Users, GraduationCap, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface FacultyCardProps {
  name: string;
  designation: string;
  imageUrl: string;
  experience: string;
  specialization: string;
  rating: number;
  studentsCount: number;
  coursesCount?: number;
  successRate?: number;
}

export function FacultyCard({
  name,
  designation,
  imageUrl,
  experience,
  specialization,
  rating,
  studentsCount,
  coursesCount = 12,
  successRate = 92,
}: FacultyCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-muted/30 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border group">
      {/* Compact Faculty Image */}
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
        <ImageWithFallback
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Name on Image */}
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="text-sm text-white drop-shadow-lg">{name}</h3>
          <p className="text-xs text-white/90">{designation}</p>
        </div>
      </div>

      {/* Dense Info Grid */}
      <div className="p-3">
        {/* Specialization Pill */}
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full border border-accent/20">
            {specialization}
          </span>
        </div>

        {/* Info Grid - 2 columns */}
        <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
          <div className="bg-muted/50 rounded p-2">
            <div className="flex items-center gap-1 text-primary mb-0.5">
              <Award className="w-3 h-3" />
              <span className="text-[10px] text-muted-foreground uppercase">Experience</span>
            </div>
            <p className="text-foreground">{experience}</p>
          </div>

          <div className="bg-accent/5 rounded p-2 border border-accent/20">
            <div className="flex items-center gap-1 text-accent mb-0.5">
              <BookOpen className="w-3 h-3" />
              <span className="text-[10px] text-muted-foreground uppercase">Courses</span>
            </div>
            <p className="text-accent">{coursesCount}+</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-primary" />
            <div>
              <p className="text-xs text-foreground">{(studentsCount / 1000).toFixed(1)}k+</p>
              <p className="text-[10px] text-muted-foreground">Students</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-accent" />
            <div>
              <p className="text-xs text-accent">{successRate}%</p>
              <p className="text-[10px] text-muted-foreground">Success</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-accent" />
            <div>
              <p className="text-xs text-foreground">Top</p>
              <p className="text-[10px] text-muted-foreground">Expert</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}