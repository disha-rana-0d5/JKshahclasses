import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Calendar, Clock, Users, Video, Filter, Search } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { batchApi } from "../api/api";
import { ClientPagination } from "./ClientPagination";
import { toast } from "sonner";

export function LiveSessionsPage() {
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    document.title = "Live Sessions";
  }, []);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchLiveSessions();
  }, [pagination.page, debouncedSearch]);

  const fetchLiveSessions = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch
      };
      // batchApi.getBatches(params) expects params object
      const response = await batchApi.getBatches(params);
      if (response.ok && response.data.success) {
        setLiveSessions(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error("Error fetching live sessions:", error);
      toast.error("Failed to load live sessions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-white to-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-accent mb-3">
            <Video className="w-5 h-5" />
            <span className="text-sm">Live Online Batches</span>
          </div>

          <h1 className="text-3xl lg:text-4xl mb-3 text-foreground">
            Upcoming Live Sessions
          </h1>

          <p className="text-base text-muted-foreground mb-6 max-w-3xl">
            Join faculty-led live interactive classes from anywhere. All sessions include recorded lectures, doubt-clearing, and structured study plans.
          </p>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by course or faculty..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="border border-border">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sessions Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : liveSessions.length > 0 ? (
            <>
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-5">
                {liveSessions.map((session: any, idx) => (
                  <div key={idx} className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all group">
                    <div className="p-4 border-b border-border bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{session.category}</div>
                          <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {session.courseName}
                          </h3>
                        </div>
                        <span className="bg-green-500/10 text-green-600 px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2">
                          {session.badge || "Live"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={session.faculty?.image}
                          alt={session.faculty?.name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                        <div>
                          <div className="text-xs text-muted-foreground">Faculty</div>
                          <div className="text-sm font-semibold">{session.faculty?.name}</div>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>Starts {session.batchStart}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{session.timing}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${parseInt(session.seats) < 20 ? 'bg-red-500' : 'bg-green-500'}`} />
                        <span>{session.students} Enrolled • <span className="font-medium text-foreground">{session.seats}</span></span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border flex items-center justify-between bg-muted/5">
                      <div className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                        {session.duration}
                      </div>
                      <Button size="sm" className="rounded-lg">
                        Register Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <ClientPagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
              />
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              No live sessions found.
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl mb-3 text-foreground">
            Can't Find Your Preferred Timing?
          </h2>
          <p className="text-base text-muted-foreground mb-6">
            We offer flexible batch schedules. Talk to our counselor to find the perfect batch for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Request Custom Schedule
            </Button>
            <Button size="lg" variant="outline">
              Talk to Counselor
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
