import styled from "styled-components";
import Link from "next/link";
import {Product} from "@/models/Product";
import {Category} from "@/models/Category";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import {RevealWrapper} from 'next-reveal';
import {WishedProduct} from "@/models/WishedProduct";
import Header from "@/components/Header";
import Center from "@/components/Center";
import ProductBox from "@/components/ProductBox";
import {mongooseConnect} from "@/lib/mongoose";
import {getServerSession} from "next-auth";

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media  screen and (min-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`;

const CategoryTitle = styled.div`
  display: flex;
  margin-top: 10px;
  margin-bottom: 0;
  align-items: center;
  gap: 15px;
  h2{
    margin: 10px 0;
  }
  a{
    color: #555; 
    display: inline-block;
  }
`;

const CategoryWrapper = styled.div`
  margin-bottom: 40px;
`;

const ShowAllSquare = styled(Link)`
  background-color: #ddd;
  height: 160px;
  border-radius: 10px;
  align-items: center;
  display: flex;
  justify-content: center;
  color: #555;
  text-decoration: none;
`;

export default function CategoriesPage({mainCategories, categoriesProducts, wishedProducts=[]}) {
    return (
        <>
            <Header/>
            <Center>
                {mainCategories.map(cat => (
                    <CategoryWrapper key={cat._id}>
                        <CategoryTitle>
                            <h2>{cat.name}</h2>
                            <div>
                                <Link href={'/category/'+cat._id}>Show all</Link>
                            </div>
                        </CategoryTitle>
                        <CategoryGrid>
                            {categoriesProducts[cat._id].map((p,index) => (
                                <RevealWrapper key={index} delay={index*50}>
                                    <ProductBox {...p} wished={wishedProducts.includes(p._id)}/>
                                </RevealWrapper>
                            ))}
                            <RevealWrapper delay={categoriesProducts[cat._id].length*50}>
                                <ShowAllSquare href={'/category/'+cat._id}>
                                    Show all &rarr;
                                </ShowAllSquare>
                            </RevealWrapper>
                        </CategoryGrid>
                    </CategoryWrapper>
                ))}
            </Center>
        </>
    )
}

export async function getServerSideProps(ctx) {
    await mongooseConnect();
    const mainCategories = await Category.find();
    const categoriesProducts = {}; // catId => [products]
    const allFetchProductsId = [];
    for (const mainCat of mainCategories) {
        const mainCatId = mainCat._id.toString();
        const categoriesIds = [mainCatId];
        const products = await Product.find({category: categoriesIds}, null, {limit:3,sort:{'_id':-1}});
        allFetchProductsId.push(...products.map(p => p._id.toString()));
        categoriesProducts[mainCat._id] = products;
    }

    const session = await getServerSession(ctx.req, ctx.res, authOptions);
    const wishedProducts = session?.user
        ? await WishedProduct.find({
            userEmail: session?.user.email,
            product: allFetchProductsId,
        })
        : [];
    return {
        props: {
            mainCategories: JSON.parse(JSON.stringify(mainCategories)),
            categoriesProducts: JSON.parse(JSON.stringify(categoriesProducts)),
            wishedProducts: wishedProducts.map(i => i.product.toString()),
        },
    };
}