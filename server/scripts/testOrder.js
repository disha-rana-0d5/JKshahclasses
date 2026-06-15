const fetch = require('node-fetch');

async function test() {
    const orderData = {
        items: [{
            productId: '64d2d6c6e11fcd68c5b2a099', // Some valid 24 char hex
            productType: 'book',
            title: 'Test Book',
            price: 500,
            quantity: 1,
            image: '',
            variantId: '',
            variantName: ''
        }],
        customerInfo: {
            name: "John Doe",
            email: "john@example.com",
            mobile: "9876543210"
        },
        shippingAddress: {
            addressLine: "123 Main St",
            city: "Mumbai",
            state: "MH",
            pincode: "400001",
            country: "India"
        },
        billingAddress: {
            addressLine: "123 Main St",
            city: "Mumbai",
            state: "MH",
            pincode: "400001",
            country: "India"
        },
        totalAmount: 500,
        paymentMethod: "COD",
        paymentId: "COD-123456"
    };

    try {
        const res = await fetch('http://localhost:5003/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}
test();
