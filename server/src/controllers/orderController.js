const Order = require('../models/Order');
const Product = require('../models/Product');
const paginate = require('../utils/paginate');
const sendEmail = require('../utils/sendEmail');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res) => {
    try {
        const {
            user,
            items,
            customerInfo,
            shippingAddress,
            billingAddress,
            totalAmount,
            paymentMethod,
            paymentId
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No items in order'
            });
        }

        const order = await Order.create({
            user: user || undefined,
            items,
            customerInfo,
            shippingAddress,
            billingAddress,
            totalAmount,
            paymentMethod,
            paymentId,
            status: 'Processing' // Start with Processing if payment is successful/COD
        });

        // Decrement product quantities
        // 1. Stock Validation Check
        for (const item of items) {
            if (item.productType === 'book' || item.productType === 'test-series') {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ success: false, message: `Product ${item.title} not found` });
                }

                if (product.isVariable && item.variantId) {
                    const variant = product.variants.find(v => v._id && v._id.toString() === item.variantId.toString());
                    if (!variant) {
                        return res.status(404).json({ success: false, message: `Variant for ${item.title} not found` });
                    }
                    if ((variant.quantity || 0) < item.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Only ${variant.quantity || 0} units of ${item.title} (${item.variantName}) available`
                        });
                    }
                } else {
                    if ((product.quantity || 0) < item.quantity) {
                        return res.status(400).json({
                            success: false,
                            message: `Only ${product.quantity || 0} units of ${item.title} available`
                        });
                    }
                }
            }
        }

        // 2. Decrement Stock
        for (const item of items) {
            try {
                if (item.productType === 'book' || item.productType === 'test-series') {
                    const product = await Product.findById(item.productId);
                    if (product) {
                        if (product.isVariable && item.variantId) {
                            // Find the variant and decrement its quantity
                            const variantIndex = product.variants.findIndex(v => v._id && v._id.toString() === item.variantId.toString());
                            if (variantIndex !== -1) {
                                product.variants[variantIndex].quantity = (product.variants[variantIndex].quantity || 0) - item.quantity;
                                if (product.variants[variantIndex].quantity < 0) product.variants[variantIndex].quantity = 0;
                            }
                        } else {
                            // Simple product decrement
                            product.quantity = (product.quantity || 0) - item.quantity;
                            if (product.quantity < 0) product.quantity = 0;
                        }
                        await product.save();
                    }
                }
            } catch (err) {
                console.error(`Error updating stock for product ${item.productId}:`, err);
            }
        }

        // Send confirmation email
        try {
            const itemsHtml = items.map(item => `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title} x ${item.quantity}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
                </tr>
            `).join('');

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #E94B64;">Order Placed Successfully!</h2>
                    <p>Hi ${customerInfo.name},</p>
                    <p>Thank you for your order. We are processing it and will notify you once it's shipped.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order ID:</strong> ORD-${order._id.toString().slice(-6).toUpperCase()}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #eee;">
                                    <th style="padding: 10px; text-align: left;">Item</th>
                                    <th style="padding: 10px; text-align: right;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                                <tr>
                                    <td style="padding: 10px; font-weight: bold;">Total</td>
                                    <td style="padding: 10px; font-weight: bold; text-align: right;">₹${totalAmount}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                        <div>
                            <h4 style="margin-bottom: 5px; color: #E94B64;">Shipping Address</h4>
                            <p style="margin: 0; font-size: 14px; line-height: 1.4;">
                                ${shippingAddress.addressLine}<br>
                                ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
                                ${shippingAddress.country || 'India'}
                            </p>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 5px; color: #E94B64;">Billing Address</h4>
                            <p style="margin: 0; font-size: 14px; line-height: 1.4;">
                                ${(shippingAddress.addressLine === billingAddress.addressLine &&
                    shippingAddress.city === billingAddress.city &&
                    shippingAddress.pincode === billingAddress.pincode)
                    ? '<span style="color: #777; font-style: italic;">Same as shipping address</span>'
                    : `${billingAddress.addressLine}<br>${billingAddress.city}, ${billingAddress.state} - ${billingAddress.pincode}<br>${billingAddress.country || 'India'}`
                }
                            </p>
                        </div>
                    </div>

                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 12px;">
                        <p style="margin: 5px 0;"><strong>JK Shah Classes</strong></p>
                        <p style="margin: 5px 0;">Official Website: <a href="https://jkshahclasses.com" style="color: #E94B64; text-decoration: none;">jkshahclasses.com</a></p>
                        <p style="margin: 5px 0;">Need help? Contact us at <a href="mailto:support@jkshahclasses.com" style="color: #E94B64; text-decoration: none;">support@jkshahclasses.com</a></p>
                        <p style="margin: 15px 0 0 0; font-size: 10px;">&copy; ${new Date().getFullYear()} JK Shah Classes. All rights reserved.</p>
                    </div>
                </div>
            `;

            // Send confirmation email in background to prevent hanging
            sendEmail({
                email: customerInfo.email,
                subject: `Order Confirmation - JK Shah Classes (ORD-${order._id.toString().slice(-6).toUpperCase()})`,
                html: emailHtml
            }).catch(emailError => {
                console.error('Error sending order confirmation email in background:', emailError);
            });
        } catch (emailBuildError) {
            console.error('Error building order confirmation email:', emailBuildError);
            // Don't fail the request if email building fails
        }

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const paginatedResults = await paginate(Order, req.query, {
            searchFields: ['status', 'customerInfo.name', 'customerInfo.email'],
            populate: [
                { path: 'user', select: 'name email' }
            ],
            sort: { createdAt: -1 }
        });

        res.status(200).json({
            success: true,
            ...paginatedResults
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status, trackingInfo } = req.body;

        const updateData = { ...req.body };

        // Ensure we explicitly process tracking info if present
        if (trackingInfo) {
            updateData['trackingInfo'] = trackingInfo;
        }

        const oldOrder = await Order.findById(orderId);

        if (!oldOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        const order = await Order.findByIdAndUpdate(orderId, updateData, {
            new: true,
            runValidators: true
        });

        // Send Shipping Email if status changed to Shipped
        if (oldOrder.status !== 'Shipped' && status === 'Shipped') {
            try {
                // Determine which order items to show
                const itemsHtml = order.items.map(item => `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.title} x ${item.quantity}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price * item.quantity}</td>
                    </tr>
                `).join('');

                let trackingHtml = '';
                if (order.trackingInfo && order.trackingInfo.awbNumber) {
                    trackingHtml = `
                        <div style="background: #e6f7ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #1890ff;">
                            <h3 style="margin-top: 0; color: #1890ff;">Track Your Shipment</h3>
                            <p><strong>Courier:</strong> ${order.trackingInfo.courierName || 'Standard Shipping'}</p>
                            <p><strong>Tracking Number (AWB):</strong> ${order.trackingInfo.awbNumber}</p>
                            ${order.trackingInfo.trackingUrl ? `<p><a href="${order.trackingInfo.trackingUrl}" style="display: inline-block; background: #1890ff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Track Order Online</a></p>` : ''}
                        </div>
                     `;
                }

                const emailHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                        <h2 style="color: #1890ff;">Your Order Has Been Shipped!</h2>
                        <p>Hi ${order.customerInfo.name},</p>
                        <p>Great news! Your order is on its way. We have successfully dispatched your items.</p>
                        
                        ${trackingHtml}

                        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="margin-top: 0;">Order Details</h3>
                            <p><strong>Order ID:</strong> ORD-${order._id.toString().slice(-6).toUpperCase()}</p>
                            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead>
                                    <tr style="background: #eee;">
                                        <th style="padding: 10px; text-align: left;">Item</th>
                                        <th style="padding: 10px; text-align: right;">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                    <tr>
                                        <td style="padding: 10px; font-weight: bold;">Total</td>
                                        <td style="padding: 10px; font-weight: bold; text-align: right;">₹${order.totalAmount}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 12px;">
                            <p style="margin: 5px 0;"><strong>JK Shah Classes</strong></p>
                            <p style="margin: 5px 0;">Need help? Contact us at <a href="mailto:support@jkshahclasses.com" style="color: #E94B64; text-decoration: none;">support@jkshahclasses.com</a></p>
                        </div>
                    </div>
                `;

                // Fire and forget email
                sendEmail({
                    email: order.customerInfo.email,
                    subject: `Your Order has been Shipped! (ORD-${order._id.toString().slice(-6).toUpperCase()})`,
                    html: emailHtml
                }).catch(e => console.error("Error sending shipment email: ", e));
            } catch (emailBuildError) {
                console.error("Error building shipment email: ", emailBuildError);
            }
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Error in updateOrder API: ", error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const paginatedResults = await paginate(Order, req.query, {
            baseQuery: { user: req.user._id },
            sort: { createdAt: -1 }
        });

        res.status(200).json({
            success: true,
            ...paginatedResults
        });
    } catch (error) {
        console.error('Error fetching my orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
