export const BASE_URL = import.meta.env.VITE_API_URL;
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

export const authApi = {
    async login(credentials) {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        return { ok: response.ok, status: response.status, data: await response.json() };
    },

    async register(userData) {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return { ok: response.ok, status: response.status, data: await response.json() };
    },

    async forgotPassword(email) {
        const response = await fetch(`${BASE_URL}/auth/forgotpassword`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return { ok: response.ok, status: response.status, data: await response.json() };
    },

    async resetPassword(token, password) {
        const response = await fetch(`${BASE_URL}/auth/resetpassword/${token}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        return { ok: response.ok, status: response.status, data: await response.json() };
    }
};

export const categoryApi = {
    async getCategories(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page);
        if (params.limit) query.append('limit', params.limit);
        if (params.search) query.append('search', params.search);
        if (params.filter) query.append('filter', params.filter);
        if (params.sort) query.append('sort', params.sort);

        const response = await fetch(`${BASE_URL}/categories?${query.toString()}`);
        return { ok: response.ok, data: await response.json() };
    },

    async addCategory(name, description, parent, slug, metaTitle, metaDescription, metaKeywords, whyTitle, whyContent, whyJKShahTitle, whyJKShahContent, whyPoints, whyJKShahPoints, sequence, bannerTitle, bannerSubtitle, bannerBadges, bannerBadgeIcons, bannerStats) {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name, description, parent, slug, metaTitle, metaDescription, metaKeywords, whyTitle, whyContent, whyJKShahTitle, whyJKShahContent, whyPoints, whyJKShahPoints, sequence,
                bannerTitle, bannerSubtitle, bannerBadges, bannerBadgeIcons, bannerStats
            }),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateCategory(id, categoryData) {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteCategory(id) {
        const response = await fetch(`${BASE_URL}/categories/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const levelApi = {
    async getLevels(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/levels${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async addLevel(name, description) {
        const response = await fetch(`${BASE_URL}/levels`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteLevel(id) {
        const response = await fetch(`${BASE_URL}/levels/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const landingPageApi = {
    async getLandingContent() {
        const response = await fetch(`${BASE_URL}/content/landing`);
        return { ok: response.ok, data: await response.json() };
    },

    async updateLandingContent(contentData) {
        const response = await fetch(`${BASE_URL}/content/landing`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contentData),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async exportBranches() {
        const response = await fetch(`${BASE_URL}/content/branches/export`);
        if (response.ok) {
            const blob = await response.blob();
            return { ok: true, data: blob };
        }
        return { ok: false, data: null };
    },
    async bulkUploadBranches(formData) {
        const response = await fetch(`${BASE_URL}/content/branches/bulk`, {
            method: "POST",
            body: formData,
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteAllBranches() {
        const response = await fetch(`${BASE_URL}/content/branches`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};



export const courseApi = {
    async getCourses(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/courses${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async getCourse(id) {
        const response = await fetch(`${BASE_URL}/courses/${id}`);
        return { ok: response.ok, data: await response.json() };
    },

    async addCourse(courseData) {
        const response = await fetch(`${BASE_URL}/courses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateCourse(id, courseData) {
        const response = await fetch(`${BASE_URL}/courses/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(courseData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteCourse(id) {
        const response = await fetch(`${BASE_URL}/courses/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const facultyApi = {
    async getFaculties(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/faculties${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async addFaculty(facultyData) {
        const response = await fetch(`${BASE_URL}/faculties`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(facultyData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateFaculty(id, facultyData) {
        const response = await fetch(`${BASE_URL}/faculties/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(facultyData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteFaculty(id) {
        const response = await fetch(`${BASE_URL}/faculties/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteAllFaculties() {
        const response = await fetch(`${BASE_URL}/faculties`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
    async exportFaculties() {
        const response = await fetch(`${BASE_URL}/faculties/export`);
        if (response.ok) {
            const blob = await response.blob();
            return { ok: true, data: blob };
        }
        return { ok: false, data: null };
    },
    async bulkUploadFaculties(formData) {
        const response = await fetch(`${BASE_URL}/faculties/bulk`, {
            method: "POST",
            body: formData,
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const userApi = {
    async getUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/users${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async updateUser(id, userData) {
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateContent(data) {
        const response = await fetch(`${BASE_URL}/content`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const orderApi = {
    async getOrders(params = {}) {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page);
        if (params.limit) query.append('limit', params.limit);
        if (params.search) query.append('search', params.search);
        if (params.filter) query.append('filter', params.filter);
        if (params.sort) query.append('sort', params.sort);

        const response = await fetch(`${BASE_URL}/orders?${query.toString()}`);
        return { ok: response.ok, data: await response.json() };
    },

    async updateOrder(id, data) {
        const response = await fetch(`${BASE_URL}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return { ok: response.ok, data: await response.json() };
    },

    async createOrder(orderData) {
        const token = localStorage.getItem('token');
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await fetch(`${BASE_URL}/orders`, {
            method: "POST",
            headers,
            body: JSON.stringify(orderData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteOrder(id) {
        const response = await fetch(`${BASE_URL}/orders/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
    async getMyOrders(params = {}) {
        const token = localStorage.getItem('token');
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page);
        if (params.limit) query.append('limit', params.limit);

        const response = await fetch(`${BASE_URL}/orders/myorders?${query.toString()}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const batchApi = {
    async getBatches(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/batches${queryString ? `?${queryString}` : ""}`;
        const response = await fetch(url);
        return { ok: response.ok, data: await response.json() };
    },

    async addBatch(batchData) {
        const response = await fetch(`${BASE_URL}/batches`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batchData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateBatch(id, batchData) {
        const response = await fetch(`${BASE_URL}/batches/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batchData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteBatch(id) {
        const response = await fetch(`${BASE_URL}/batches/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const dashboardApi = {
    async getStats() {
        const response = await fetch(`${BASE_URL}/dashboard/stats`);
        return { ok: response.ok, data: await response.json() };
    }
};

export const rankHolderApi = {
    async getRankHolders(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/rank-holders${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async exportRankHolders() {
        const response = await fetch(`${BASE_URL}/rank-holders/export`);
        // Handle Blob for download
        if (response.ok) {
            const blob = await response.blob();
            return { ok: true, data: blob };
        }
        return { ok: false, data: null };
    },

    async addRankHolder(rankData) {
        const response = await fetch(`${BASE_URL}/rank-holders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rankData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateRankHolder(id, rankData) {
        const response = await fetch(`${BASE_URL}/rank-holders/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rankData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteRankHolder(id) {
        const response = await fetch(`${BASE_URL}/rank-holders/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteAllRankHolders() {
        const response = await fetch(`${BASE_URL}/rank-holders`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },

    async bulkUploadRankHolders(formData) {
        const response = await fetch(`${BASE_URL}/rank-holders/bulk`, {
            method: "POST",
            body: formData,
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const courseTimelineApi = {
    async getTimelines(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/course-timelines${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async addOrUpdateTimeline(timelineData) {
        const response = await fetch(`${BASE_URL}/course-timelines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(timelineData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteTimeline(id) {
        const response = await fetch(`${BASE_URL}/course-timelines/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const careerOpportunityApi = {
    async getCareerOpportunities(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/career-opportunities${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async addOrUpdateCareerOpportunity(configData) {
        const response = await fetch(`${BASE_URL}/career-opportunities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(configData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteCareerOpportunity(id) {
        const response = await fetch(`${BASE_URL}/career-opportunities/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const placementApi = {
    async getActivePlacements(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/placements/active${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async createPlacement(placementData) {
        const response = await fetch(`${BASE_URL}/placements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(placementData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async applyForPlacement(id, applicationData) {
        const response = await fetch(`${BASE_URL}/placements/${id}/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(applicationData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async getAdminPlacements(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/placements/admin${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async exportPlacements() {
        const response = await fetch(`${BASE_URL}/placements/export`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Placements_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            return { ok: true };
        }
        return { ok: false };
    },

    async bulkUploadPlacements(formData) {
        const response = await fetch(`${BASE_URL}/placements/bulk`, {
            method: "POST",
            body: formData,
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updatePlacementStatus(id, status) {
        const response = await fetch(`${BASE_URL}/placements/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updatePlacement(id, placementData) {
        const response = await fetch(`${BASE_URL}/placements/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(placementData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async getApplications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/placements/applications${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },
    async exportApplications() {
        const response = await fetch(`${BASE_URL}/placements/applications/export`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Job_Applications_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            return { ok: true };
        }
        return { ok: false };
    },
    async deletePlacement(id) {
        const response = await fetch(`${BASE_URL}/placements/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const careerApi = {
    async getActiveListings(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/careers/active${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },
    async submitApplication(applicationData) {
        const response = await fetch(`${BASE_URL}/careers/apply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(applicationData),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async getAdminListings(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/careers/admin${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },
    async addOrUpdateListing(listingData) {
        const response = await fetch(`${BASE_URL}/careers/admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(listingData),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteListing(id) {
        const response = await fetch(`${BASE_URL}/careers/admin/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
    async getApplications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/careers/applications${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },
    async exportApplications() {
        const response = await fetch(`${BASE_URL}/careers/applications/export`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Career_Applications_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            return { ok: true };
        }
        return { ok: false };
    },
    async deleteApplication(id) {
        const response = await fetch(`${BASE_URL}/careers/applications/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const alumniApi = {
    async getAlumni(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/alumni${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },
    async addAlumni(data) {
        const response = await fetch(`${BASE_URL}/alumni`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateAlumni(id, data) {
        const response = await fetch(`${BASE_URL}/alumni/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteAlumni(id) {
        const response = await fetch(`${BASE_URL}/alumni/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
};

export const alumniWorkAtApi = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/alumni-work-at${query ? `?${query}` : ''}`);
        return { ok: response.ok, data: await response.json() };
    },
    async add(data) {
        const response = await fetch(`${BASE_URL}/alumni-work-at`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async update(id, data) {
        const response = await fetch(`${BASE_URL}/alumni-work-at/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async remove(id) {
        const response = await fetch(`${BASE_URL}/alumni-work-at/${id}`, {
            method: 'DELETE',
        });
        return { ok: response.ok, data: await response.json() };
    },
};

export const blogApi = {
    async getCategories(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/blogs/categories${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },


    async addCategory(categoryData) {
        const response = await fetch(`${BASE_URL}/blogs/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateCategory(id, categoryData) {
        const response = await fetch(`${BASE_URL}/blogs/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteCategory(id) {
        const response = await fetch(`${BASE_URL}/blogs/categories/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },

    async getBlogs(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/blogs${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },

    async getBlog(id) {
        const response = await fetch(`${BASE_URL}/blogs/${id}`);
        return { ok: response.ok, data: await response.json() };
    },

    async addBlog(blogData) {
        const response = await fetch(`${BASE_URL}/blogs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(blogData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateBlog(id, blogData) {
        const response = await fetch(`${BASE_URL}/blogs/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(blogData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteBlog(id) {
        const response = await fetch(`${BASE_URL}/blogs/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const branchEnquiryApi = {
    async getBranchEnquiries() {
        const response = await fetch(`${BASE_URL}/branch-enquiries`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });
        const data = response.headers.get("content-type")?.includes("application/json")
            ? await response.json()
            : { success: false, message: `Server error: ${response.status}` };
        return { ok: response.ok, data };
    },
    async sendOtp(email) {
        const response = await fetch(`${BASE_URL}/branch-enquiries/send-otp`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async verifyOtp(email, otp) {
        const response = await fetch(`${BASE_URL}/branch-enquiries/verify-otp`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async submitBranchEnquiry(data) {
        const response = await fetch(`${BASE_URL}/branch-enquiries`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateBranchEnquiryReadStatus(id, isRead) {
        const response = await fetch(`${BASE_URL}/branch-enquiries/${id}/read`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ isRead }),
        });
        const data = response.headers.get("content-type")?.includes("application/json")
            ? await response.json()
            : { success: false, message: `Server error: ${response.status}` };
        return { ok: response.ok, data };
    },
    async deleteBranchEnquiry(id) {
        const response = await fetch(`${BASE_URL}/branch-enquiries/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
        });
        const data = response.headers.get("content-type")?.includes("application/json")
            ? await response.json()
            : { success: false, message: `Server error: ${response.status}` };
        return { ok: response.ok, data };
    }
};
export const productApi = {
    // Categories
    async getCategories() {
        const response = await fetch(`${BASE_URL}/products/categories`);
        return { ok: response.ok, data: await response.json() };
    },
    async getProductFilterOptions(type = 'book') {
        const response = await fetch(`${BASE_URL}/products/product-filters?type=${type}`);
        return { ok: response.ok, data: await response.json() };
    },
    async addCategory(name, type) {
        const response = await fetch(`${BASE_URL}/products/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, type }),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteCategory(id) {
        const response = await fetch(`${BASE_URL}/products/categories/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateCategory(id, name, type) {
        const response = await fetch(`${BASE_URL}/products/categories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, type }),
        });
        return { ok: response.ok, data: await response.json() };
    },

    // Subcategories
    async getSubCategories(categoryId) {
        const query = categoryId ? `?category=${categoryId}` : "";
        const response = await fetch(`${BASE_URL}/products/subcategories${query}`);
        return { ok: response.ok, data: await response.json() };
    },
    async addSubCategory(name, categoryId) {
        const response = await fetch(`${BASE_URL}/products/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category: categoryId }),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteSubCategory(id) {
        const response = await fetch(`${BASE_URL}/products/subcategories/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateSubCategory(id, name, categoryId) {
        const response = await fetch(`${BASE_URL}/products/subcategories/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category: categoryId }),
        });
        return { ok: response.ok, data: await response.json() };
    },

    // Attributes
    async getAttributes(subcategoryId, productId) {
        const query = new URLSearchParams();
        if (subcategoryId) query.append('subcategory', subcategoryId);
        if (productId) query.append('product', productId);
        const response = await fetch(`${BASE_URL}/products/attributes?${query.toString()}`);
        return { ok: response.ok, data: await response.json() };
    },
    async addAttribute(name, subcategoryId, productId, sequence = 0, isGlobal = false) {
        const response = await fetch(`${BASE_URL}/products/attributes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, subcategory: subcategoryId, product: productId, sequence, isGlobal }),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateAttribute(id, data) {
        const response = await fetch(`${BASE_URL}/products/attributes/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteAttribute(id) {
        const response = await fetch(`${BASE_URL}/products/attributes/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },

    // Attribute Values
    async getAttributeValues(attributeId) {
        const query = attributeId ? `?attribute=${attributeId}` : "";
        const response = await fetch(`${BASE_URL}/products/attribute-values${query}`);
        return { ok: response.ok, data: await response.json() };
    },
    async addAttributeValue(value, attributeId, amount = 0, quantity = 0) {
        const response = await fetch(`${BASE_URL}/products/attribute-values`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value, attribute: attributeId, amount, quantity }),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateAttributeValue(id, data) {
        const response = await fetch(`${BASE_URL}/products/attribute-values/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteAttributeValue(id) {
        const response = await fetch(`${BASE_URL}/products/attribute-values/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },

    // Faculties
    async getFaculties() {
        const response = await fetch(`${BASE_URL}/products/faculties`);
        return { ok: response.ok, data: await response.json() };
    },
    async addFaculty(facultyData) {
        const response = await fetch(`${BASE_URL}/products/faculties`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(facultyData),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateFaculty(id, facultyData) {
        const response = await fetch(`${BASE_URL}/products/faculties/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(facultyData),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteFaculty(id) {
        const response = await fetch(`${BASE_URL}/products/faculties/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    },

    // Products
    async getProducts(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/products${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },
    async getProduct(id) {
        const response = await fetch(`${BASE_URL}/products/${id}`);
        return { ok: response.ok, data: await response.json() };
    },
    async addProduct(productData) {
        const response = await fetch(`${BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateProduct(id, productData) {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteProduct(id) {
        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: "DELETE",
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const announcementApi = {
    async getAnnouncements(activeOnly = false) {
        const response = await fetch(`${BASE_URL}/announcements${activeOnly ? '?activeOnly=true' : ''}`);
        return { ok: response.ok, data: await response.json() };
    },

    async getAnnouncement(id) {
        const response = await fetch(`${BASE_URL}/announcements/${id}`);
        return { ok: response.ok, data: await response.json() };
    },

    async createAnnouncement(announcementData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/announcements`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(announcementData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async updateAnnouncement(id, announcementData) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/announcements/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(announcementData),
        });
        return { ok: response.ok, data: await response.json() };
    },

    async deleteAnnouncement(id) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/announcements/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const erpCourseApi = {
    async getMappings(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/erp-course-mappings${query ? `?${query}` : ""}`);
        return { ok: response.ok, data: await response.json() };
    },
    async saveMapping(mappingData) {
        const response = await fetch(`${BASE_URL}/erp-course-mappings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mappingData)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async getBatchVisibilities() {
        const response = await fetch(`${BASE_URL}/erp-batch-visibility`);
        return { ok: response.ok, data: await response.json() };
    },
    async saveBatchVisibility(visibilityData) {
        const response = await fetch(`${BASE_URL}/erp-batch-visibility`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(visibilityData)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async fetchExternalERPCourses() {
        const response = await fetch(`https://edu.jkshahcloud.com:5004/courses/api/course/list`, {
            method: 'POST',
            headers: {
                'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
            }
        });
        return { ok: response.ok, data: await response.json() };
    },
    async fetchExternalERPBatchDetails(courseId, levelId) {
        const response = await fetch(`https://edu.jkshahcloud.com:5004/courses/api/course/batchDetails`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
            },
            body: JSON.stringify({ courseId: courseId.toString(), levelId: levelId.toString() })
        });
        return { ok: response.ok, data: await response.json() };
    },
    async fetchExternalERPBranchDetails() {
        const response = await fetch(`https://edu.jkshahcloud.com:5004/courses/api/course/branchDetails`, {
            method: 'POST',
            headers: {
                'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
            }
        });
        return { ok: response.ok, data: await response.json() };
    },
    async fetchExternalERPFeeCategoryDetails() {
        const response = await fetch(`https://edu.jkshahcloud.com:5004/courses/api/course/feeCatgDetails`, {
            method: 'POST',
            headers: {
                'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
            }
        });
        return { ok: response.ok, data: await response.json() };
    },
    async fetchExternalERPFeeData(params) {
        const response = await fetch(`https://edu.jkshahcloud.com:5004/courses/api/course/feebyclsData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
            },
            body: JSON.stringify(params)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async initiateEasebuzzPayment(params) {
        const response = await fetch(`https://edu.jkshahcloud.com:5004/easebuzz/paymentintiatedbystu`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-key': 'jkshah_cloud_secret_auth_live_2025'
            },
            body: JSON.stringify(params)
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const timeTableApi = {
    async getTimetables(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${BASE_URL}/timetables${query ? `?${query}` : ""}`, {
            cache: 'no-store',
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache"
            }
        });
        return { ok: response.ok, data: await response.json() };
    },
    async createTimetable(data) {
        const response = await fetch(`${BASE_URL}/timetables`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(data)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async updateTimetable(id, data) {
        const response = await fetch(`${BASE_URL}/timetables/${id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(data)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async deleteTimetable(id) {
        const response = await fetch(`${BASE_URL}/timetables/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });
        return { ok: response.ok, data: await response.json() };
    },
    async bulkImportTimetables(data) {
        const response = await fetch(`${BASE_URL}/timetables/bulk`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(data)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async uploadPdf(file) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`${BASE_URL}/upload/file`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: formData
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const paymentEnquiryApi = {
    async getEnquiry(stuEnqSno) {
        const response = await fetch(`${BASE_URL}/payment-enquiry/${stuEnqSno}`);
        return { ok: response.ok, data: await response.json() };
    },
    async getEnquiryByMobile(mobile) {
        const response = await fetch(`${BASE_URL}/payment-enquiry/mobile/${mobile}`);
        return { ok: response.ok, data: await response.json() };
    },
    async sendOtp(data) {
        const response = await fetch(`${BASE_URL}/payment-enquiry/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async createEnquiry(data) {
        const response = await fetch(`${BASE_URL}/payment-enquiry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return { ok: response.ok, data: await response.json() };
    },
    async getAllEnquiries(token) {
        const response = await fetch(`${BASE_URL}/payment-enquiry`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return { ok: response.ok, data: await response.json() };
    }
};

export const admissionApi = {};

