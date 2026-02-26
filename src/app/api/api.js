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

    async addCategory(name, description, parent, slug, metaTitle, metaDescription, metaKeywords, whyTitle, whyContent, whyJKShahTitle, whyJKShahContent, sequence) {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description, parent, slug, metaTitle, metaDescription, metaKeywords, whyTitle, whyContent, whyJKShahTitle, whyJKShahContent, sequence }),
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

    async updatePlacementStatus(id, status) {
        const response = await fetch(`${BASE_URL}/placements/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
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
    }
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
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`
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
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`
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
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`
            },
        });
        const data = response.headers.get("content-type")?.includes("application/json")
            ? await response.json()
            : { success: false, message: `Server error: ${response.status}` };
        return { ok: response.ok, data };
    }
};

