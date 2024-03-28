import axios from "axios";
import styled from "styled-components";
import WhiteBox from "@/components/WhiteBox";
import Tabs from "@/components/Tabs";
import Input from "@/components/Input";
import Header from "@/components/Header";
import Center from "@/components/Center";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import ProductBox from "@/components/ProductBox";
import SingleOrder from "@/components/SingleOrder";
import {RevealWrapper} from "next-reveal";
import {useEffect, useState} from "react";
import {signIn, signOut, useSession} from "next-auth/react";

const ColsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  margin: 40px 0;
  p {
    margin: 5px;
  }
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const CityHolder = styled.div`
  display: flex;
  gap: 5px;
`;

const WishedProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
`;

export default function AccountPage() {
    const {data:session} = useSession();
    const [name,setName] = useState('');
    const [email,setEmail] = useState('');
    const [city,setCity] = useState('');
    const [postalCode,setPostalCode] = useState('');
    const [streetAddress,setStreetAddress] = useState('');
    const [country,setCountry] = useState('');
    const [addressLoaded,setAddressLoaded] = useState(true);
    const [wishlistLoaded,setWishlistLoaded] = useState(true);
    const [orderLoaded, setOrderLoaded] = useState(true);
    const [wishedProducts,setWishedProducts] = useState([]);
    const [activeTab, setActiveTab] = useState('Orders');
    const [orders, setOrders] = useState([]);
    async function logout() {
        await signOut({
            callbackUrl: process.env.NEXT_PUBLIC_URL,
        });
    }
    async function login() {
        await signIn('google');
    }
    function saveAddress() {
        const data = {name,email,city,streetAddress,postalCode,country};
        axios.put('/api/address', data);
    }
    useEffect(() => {
        if (!session) {
            return;
        }
        setAddressLoaded(false);
        setWishlistLoaded(false);
        setOrderLoaded(false);
        axios.get('/api/address').then(response => {
            setName(response.data?.name);
            setEmail(response.data?.email);
            setCity(response.data?.city);
            setPostalCode(response.data?.postalCode);
            setStreetAddress(response.data?.streetAddress);
            setCountry(response.data?.country);
            setAddressLoaded(true);
        });
        axios.get('/api/wishlist').then(response => {
            setWishedProducts(response.data.map(wp => wp.product));
            setWishlistLoaded(true);
        });
        axios.get('/api/orders').then(response => {
            setOrders(response.data);
            setOrderLoaded(true);
        });
    }, [session]);
    function productRemovedFromWishlist(idToRemove) {
        setWishedProducts(products => {
            return [...products.filter(p => p._id.toString() !== idToRemove)];
        });
    }
    return (
        <>
            <Header/>
            <Center>
                <ColsWrapper>
                    <div>
                        <RevealWrapper delay={0}>
                            <WhiteBox>
                                <Tabs tabs={['Orders', 'Wishlist']}
                                      active={activeTab}
                                      onChange={setActiveTab}/>
                                {activeTab === 'Orders' && (
                                    <>
                                        {!orderLoaded && (
                                            <Spinner fullWidth={true}/>
                                        )}
                                        {orderLoaded && (
                                            <div>
                                                {orders.length === 0 && (
                                                    <>
                                                        {session && (
                                                            <p>Your order is empty</p>
                                                        )}
                                                        {!session && (
                                                            <p>Login in to see your orders</p>
                                                        )}
                                                    </>
                                                )}
                                                {orders.length > 0 && orders
                                                    // Sort orders by createdAt, most recent first
                                                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                                    // Limit to the first 10 orders
                                                    .slice(0, 10)
                                                    .map(o => (
                                                        <SingleOrder key={o._id} {...o} />
                                                    ))
                                                }
                                            </div>
                                        )}
                                    </>
                                )}
                                {activeTab === 'Wishlist' && (
                                    <>
                                        {!wishlistLoaded && (
                                            <Spinner fullWidth={true}/>
                                        )}
                                        {wishlistLoaded && (
                                            <>
                                                <WishedProductGrid>
                                                    {wishedProducts.length > 0 && wishedProducts.map(wp => (
                                                        <ProductBox key={wp._id} {...wp} wished={true}
                                                                    onRemoveFromWishlist={productRemovedFromWishlist}>
                                                        </ProductBox>
                                                    ))}
                                                </WishedProductGrid>
                                                {wishedProducts.length === 0 && (
                                                    <>
                                                        {session && (
                                                            <p>Your wishlist is empty</p>
                                                        )}
                                                        {!session && (
                                                            <p>Login to add products to your wishlist</p>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </WhiteBox>
                        </RevealWrapper>
                    </div>
                    <div>
                        <RevealWrapper delay={100}>
                            <WhiteBox>
                                <h2>
                                    {session ? 'Account details' : 'Login'}
                                </h2>
                                {!addressLoaded && (
                                    <Spinner fullWidth={true}/>
                                )}
                                {addressLoaded && session && (
                                    <>
                                        <Input type="text" placeholder='Name' name='name'
                                               value={name} onChange={ev => setName(ev.target.value)}/>
                                        <Input type="text" placeholder='Email' name='email'
                                               value={email} onChange={ev => setEmail(ev.target.value)}/>
                                        <CityHolder>
                                            <Input type="text" placeholder='City' name='city'
                                                   value={city} onChange={ev => setCity(ev.target.value)}/>
                                            <Input type="text" placeholder='Postal Code' name='postalCode'
                                                   value={postalCode} onChange={ev => setPostalCode(ev.target.value)}/>
                                        </CityHolder>
                                        <Input type="text" placeholder='Street Address' name='streetAddress'
                                               value={streetAddress} onChange={ev => setStreetAddress(ev.target.value)}/>
                                        <Input type="text" placeholder='Country' name='country'
                                               value={country} onChange={ev => setCountry(ev.target.value)}/>
                                        <Button block={1} size={'l'} black={1} onClick={saveAddress}>
                                            Save
                                        </Button>
                                        <hr/>
                                    </>
                                )}
                                {session && (
                                    <Button primary={1} onClick={logout}>Logout</Button>
                                )}
                                {!session && (
                                    <Button primary={1} onClick={login}>Login with Google</Button>
                                )}
                            </WhiteBox>
                        </RevealWrapper>
                    </div>                    
                </ColsWrapper>
            </Center>
        </>
    );
}