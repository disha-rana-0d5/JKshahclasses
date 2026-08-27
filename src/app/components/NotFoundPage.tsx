import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Home, Search, BookOpen } from "lucide-react";
import { useEffect } from "react";

export function NotFoundPage() {
  useEffect(() => {
    document.title = "Page Not Found | JK Shah Classes";
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-white">
      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-9xl font-black text-primary/10 mb-4">404</h1>
        <div className="bg-primary/5 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-inner">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 text-lg">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist anymore.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white h-12 px-8 rounded-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" className="w-full sm:w-auto border-border h-12 px-8 rounded-full">
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
