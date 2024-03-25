import {Order} from "@/models/Order";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {mongooseConnect} from "@/lib/mongoose";
import {getServerSession} from "next-auth";

export default async function handle(req, res) {
    await mongooseConnect();
    const {user} = await getServerSession(req, res, authOptions);
    res.json(
        await Order.find({userEmail:user.email})
    );
}