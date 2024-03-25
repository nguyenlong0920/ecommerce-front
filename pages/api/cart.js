import {Product} from "@/models/Product";
import {mongooseConnect} from "@/lib/mongoose";

export default async function handler(req, res) {
    await mongooseConnect();
    const ids = req.body.ids;
    res.json(await Product.find({_id:ids}));
}