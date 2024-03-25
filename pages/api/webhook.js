import {Order} from "@/models/Order";
import {buffer} from "micro";
import {mongooseConnect} from "@/lib/mongoose";

const stripe = require('stripe')(process.env.STRIPE_SK);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_e6c1b8c6c69350f6333a7f9af2bdc15d120189b7b7bbef986381928b1f67060d";

export default async function handler(req, res) {
    await mongooseConnect();
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(await buffer(req), sig, endpointSecret);
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const data = event.data.object;
            const orderId = data.metadata.orderId;
            const paid = data.payment_status === 'paid';
            if (orderId && paid) {
                await Order.findByIdAndUpdate(orderId,{
                    paid: true,
                })
            }
            console.log(data);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('ok');
}

export const config = {
    api : {bodyParser: false}
}