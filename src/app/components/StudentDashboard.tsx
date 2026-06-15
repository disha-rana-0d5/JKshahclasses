import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { BookOpen, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../api/api";
import { Pagination } from "../admin/components/Pagination";
import { toast } from "sonner";

interface StudentDashboardProps {
  onNavigateToCoursePlayer?: () => void;
}

export function StudentDashboard({ onNavigateToCoursePlayer }: StudentDashboardProps) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Get user from localStorage
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    document.title = "Student Dashboard | JK Shah Classes";
    fetchOrders(pagination.page);
  }, [pagination.page]);

  const fetchOrders = async (page = 1) => {
    setIsLoadingOrders(true);
    try {
      const { ok, data } = await orderApi.getMyOrders({ page, limit: 10 });
      if (ok && data.success) {
        setOrders(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
          page: data.pagination.page
        }));
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load your orders");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user?.name || "Student"}!</h1>
          <p className="text-gray-500 mt-1">Here is your purchase history.</p>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Purchase History</h2>
            <p className="text-sm text-gray-500">{orders.length} orders found</p>
          </div>

          {isLoadingOrders ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders yet</h3>
              <p className="text-gray-500 mb-6">You haven't made any purchases yet.</p>
              <Button onClick={() => navigate('/resources/books')} className="bg-blue-600 hover:bg-blue-700">
                Browse Books
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100">
                    <div className="flex gap-8">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order Placed</p>
                        <p className="text-sm font-semibold text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="text-sm font-bold text-blue-600">₹{order.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                        <p className="text-sm font-semibold text-gray-700">#{order._id.toString().slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                        order.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center p-2 border border-gray-100">
                            {item.image ? (
                              <img src={item.image} alt={item.title} className="w-full h-full object-contain mix-blend-multiply" />
                            ) : (
                              <BookOpen className="w-8 h-8 text-gray-200" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-semibold text-gray-900 truncate">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity} • {item.variantName || 'Standard'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.status === 'Shipped' && order.trackingInfo && (
                      <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tracking Details</p>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-700">{order.trackingInfo.courierName || 'Courier'}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-0.5 rounded">{order.trackingInfo.awbNumber}</span>
                          </div>
                        </div>
                        {order.trackingInfo.trackingUrl && (
                          <a
                            href={order.trackingInfo.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            Track Package
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
