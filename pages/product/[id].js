import styled from "styled-components";
import Title from "@/components/Title";
import WhiteBox from "@/components/WhiteBox";
import {Product} from "@/models/Product";
import Center from "@/components/Center";
import Header from "@/components/Header";
import CartIcon from "@/components/icons/CartIcon";
import FlyingButton from "@/components/FlyingButton";
import ProductImages from "@/components/ProductImages";
import ProductReviews from "@/components/ProductReviews";
import {mongooseConnect} from "@/lib/mongoose";

const ColWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media screen and (min-width: 768px) {
    grid-template-columns: .8fr 1.2fr;
  }
  gap: 40px;
  margin: 40px 0;
`;
const PriceRow = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;
const Price = styled.span`
  font-size: 1.4rem;
`;

export default function ProductPage({product}) {
    return (
        <>
            <Header/>
            <Center>
                <ColWrapper>
                    <WhiteBox>
                        <ProductImages images={product.images}/>
                    </WhiteBox>
                    <div>
                        <Title>{product.title}</Title>
                        <p>{product.description}</p>
                        <PriceRow>
                            <div>
                                <Price>${product.price}</Price>
                            </div>
                            <div>
                                <FlyingButton main={1} _id={product._id} src={product.images?.[0]}>
                                    <CartIcon/> Add to cart
                                </FlyingButton>
                            </div>
                        </PriceRow>
                    </div>
                </ColWrapper>
                <ProductReviews product={product} />
            </Center>
        </>
    )
}

export async function getServerSideProps(context) {
    await mongooseConnect();
    const {id} = context.query;
    const product = await Product.findById(id);
    return {
        props: {
            product: JSON.parse(JSON.stringify(product)),
        }
    }
}