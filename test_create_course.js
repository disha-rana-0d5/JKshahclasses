const BASE_URL = 'http://localhost:5003/api';

async function testUniqueness() {
    const course12 = {
        title: "Test Course Cat 12 " + Date.now(),
        description: "Test Description",
        category: "12",
        subCategory: "", // Empty sub-category
        level: "Level 1",
        price: 1500,
        originalPrice: 2000,
        duration: "2 Months",
        facultyName: "Test Faculty Cat 12",
        image: "/uploads/placeholder.png",
        status: "Draft",
        highlights: ["Feature A"],
        tags: ["Test"],
        enrolledTotal: 0,
        enrolledRecent: 0
    };

    try {
        console.log('Sending request for Category 12...');
        const response = await fetch(`${BASE_URL}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(course12)
        });
        const data = await response.json();
        console.log('Response status:', response.status);
        if (response.ok) {
            console.log('Success! Course for Category 12 created.');
            console.log('Course ID:', data.data._id);
        } else {
            console.log('Failed:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testUniqueness();
