const BASE_URL = 'http://localhost:5003/api';

async function reproduceError() {
    const payload = {
        title: "11th - 12th Commerce",
        description: "11th - 12th Commerce",
        category: "11th - 12th Commerce",
        subCategory: "11",
        duration: "8 Years",
        facultyName: "", // This is required in model
        level: "Executive",
        price: 0,
        originalPrice: 0,
        status: "Active",
        image: "/uploads/placeholder.png",
        facultyImage: "/uploads/placeholder.png",
        facultyRating: 4.8,
        reviewsList: [],
        syllabusModules: [],
        videos: [],
        highlights: [],
        courseFeatures: [],
        whatYouLearn: [],
        whoShouldEnroll: [],
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        overview: "",
        batchInfo: "New Batch",
        brochureUrl: "",
        discount: "",
        enrolledRecent: 0,
        enrolledTotal: 0,
        facultyBio: "",
        facultyDesignation: "",
        facultyExperience: "",
        facultySpecialization: "",
        facultyStudents: "",
        lessons: 0,
        rating: 4.5,
        reviews: 0,
        tags: []
    };

    try {
        console.log('Sending user payload to:', `${BASE_URL}/courses`);
        const response = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response body:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

reproduceError();
