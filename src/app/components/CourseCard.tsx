import { Clock, Users, BookOpen, Star, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export interface CourseCardProps {
  title: string;
  description: string;
  imageUrl: string;
  duration: string;
  students: number;
  lessons: number;
  price: string;
  level: string;
  instructor?: string;
  rating?: number;
  discount?: string;
  startDate?: string;
}

export function CourseCard({
  title,
  description,
  imageUrl,
  duration,
  students,
  lessons,
  price,
  level,
  instructor = "Expert Faculty",
  rating = 4.8,
  discount,
  startDate = "Starts Soon",
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-border group">
      {/* Course Image with Overlay */}
      <div className="relative h-40 overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Floating badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <span className="px-2 py-0.5 text-xs bg-primary text-white rounded">
            {level}
          </span>
          {discount && (
            <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded animate-pulse">
              {discount} OFF
            </span>
          )}
        </div>

        {/* Rating overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded text-xs">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-foreground">{rating}</span>
        </div>

        {/* Enrollment badge */}
        <div className="absolute bottom-2 right-2 bg-accent/95 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
          {startDate}
        </div>
      </div>

      {/* Dense Content */}
      <div className="p-3">
        <h3 className="mb-1 text-base text-foreground line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2 leading-snug">
          {description}
        </p>

        <p className="text-xs text-primary mb-3">{instructor}</p>

        {/* Compact Meta Grid */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{students}+</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span>{lessons}</span>
          </div>
        </div>

        {/* Price and Action - Compact */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex flex-col">
            <span className="text-lg text-primary">{price}</span>
            {discount && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{parseInt(price.replace(/[₹,]/g, '')) * 1.3}
              </span>
            )}
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3">
            Enroll
          </Button>
        </div>
      </div>
    </div>
  );
}