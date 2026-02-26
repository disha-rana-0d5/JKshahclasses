// Native fetch is available in Node 18+

const testCreate = async () => {
    const response = await fetch('http://localhost:5003/api/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Test Faculty No Image",
            designation: "Test",
            expertise: "Test",
            experience: 5,
            rating: "5.0",
            tagline: "Test Tagline",
            specialization: "Test Spec",
            totalStudents: "100",
            image: "" // Explicitly empty
        })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.success && data.data) {
        console.log('Created Image:', data.data.image);
    }
};

testCreate();
