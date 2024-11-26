import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import api from "../../utils/apiClient";


interface Product {
    id: number;
    title: string;
    description: string;
    price: string;
    category: string;
    images: { id: number; image: string }[];
    seller: { id: number; first_name: string; email: string };
}

const ProductDetail = () => {
    const router = useRouter();
    const { id } = router.query;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>(""); // State for the selected image
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                try {
                    const response = await api.get(`${baseUrl}/products/${id}/`);
                    console.log(response.data);
                    setProduct(response.data);
                    if (response.data.images.length > 0) {
                        setSelectedImage(response.data.images[0].image); // Set the first image as default
                    }
                } catch (err) {
                    console.error("Failed to fetch product:", err);
                    setError("Product not found.");
                }
            };
            fetchProduct();
        }
    }, [id, baseUrl]);

    if (error) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-3xl font-bold text-red-600">{error}</h1>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-3xl font-bold">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Product Images */}
                <div>
                    {/* Thumbnails */}
                    <div className="flex gap-2 mb-4">
                        {product.images.map((img) => (
                            <img
                                key={img.id}
                                src={img.image}
                                alt={product.title}
                                className={`w-24 h-24 object-cover rounded border cursor-pointer ${
                                    selectedImage === img.image ? "border-blue-500" : "border-gray-300"
                                }`}
                                onClick={() => setSelectedImage(img.image)} // Update selected image on click
                            />
                        ))}
                    </div>
                    {/* Main Image */}
                    <img
                        src={selectedImage || "/placeholder.png"}
                        alt={product.title}
                        className="w-full rounded shadow"
                    />
                </div>

                {/* Product Details */}
                <div>
                    <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <p className="text-xl font-bold text-blue-600 mb-4">
                        ${parseFloat(product.price).toFixed(2)}
                    </p>
                    <p className="text-gray-500 mb-4">
                        <strong>Category:</strong> {product.category}
                    </p>

                    {/* Seller Information */}
                    <div className="bg-gray-100 p-4 rounded shadow-md mb-6">
                        <h2 className="text-lg font-bold mb-2">Seller Information</h2>
                        <p className="mb-1">
                            <strong>Name:</strong> {product.seller.first_name}
                        </p>
                        <p className="mb-1">
                            <strong>Email:</strong> {product.seller.email}
                        </p>
                    </div>

                    {/* Contact Seller */}
                    <button
                        className="px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
                        onClick={() => (window.location.href = `mailto:${product.seller.email}`)}
                    >
                        Contact Seller
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
