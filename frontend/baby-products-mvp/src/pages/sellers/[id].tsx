import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import api from "../../utils/apiClient";


interface Product {
    id: number;
    title: string;
    price: string;
    images: { id: number; image: string }[];
}

interface Seller {
    id: number;
    first_name: string;
    email: string;
    bio?: string; // If the user has a bio
}

const SellerProfile = () => {
    const router = useRouter();
    const { id } = router.query;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const baseImageUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:8000";

    const [seller, setSeller] = useState<Seller | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const fetchSeller = async () => {
                try {
                    const response = await api.get(`${baseUrl}/users/sellers/${id}/`);
                    setSeller(response.data.seller);
                    setProducts(response.data.products);
                    console.log('WA');
                    console.log(response.data);
                } catch (err) {
                    console.error("Failed to fetch seller data:", err);
                    setError("Seller not found.");
                }
            };
            fetchSeller();
        }
    }, [id, baseUrl]);

    if (error) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-3xl font-bold text-red-600">{error}</h1>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-3xl font-bold">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-4xl font-bold mb-4">{seller.first_name}'s Profile</h1>
            <p className="text-gray-600 mb-6">
                <strong>Email:</strong> {seller.email}
            </p>
            {seller.bio && (
                <p className="text-gray-500 mb-6">
                    <strong>About:</strong> {seller.bio}
                </p>
            )}
            <h2 className="text-3xl font-bold mb-4">Selling items </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white shadow-md rounded overflow-hidden">
                        <Link href={`/products/${product.id}`}>
                            <img
                                src={
                                    product.images.length > 0
                                        ? `${baseImageUrl}${product.images[0].image}`
                                        : "/placeholder.png"
                                }
                                alt={product.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-bold">{product.title}</h3>
                                <p className="text-blue-600 font-bold mt-2">
                                    ${parseFloat(product.price).toFixed(2)}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default SellerProfile;
