import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

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

const Products = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string>("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Open the message modal and set the selected product
    const openMessageModal = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeMessageModal = () => {
        setIsModalOpen(false);
        setMessage("");
        setSelectedProduct(null); // Clear the selected product
    };

    const sendMessage = async () => {
        if (!selectedProduct) return;

        try {
            const token = localStorage.getItem("accessToken");

            await api.post(
                `/users/messages/`,
                {
                    receiver: selectedProduct.seller.id, // Seller ID
                    message,
                    product_id: selectedProduct.id, // Include product ID in the payload
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            alert("Message sent successfully!");
            closeMessageModal();
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message. Please try again.");
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const response = await api.get(`${baseUrl}/products/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setProducts(response.data);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError("Failed to load products. Please try again later.");
            }
        };
        fetchProducts();
    }, [baseUrl]);

    if (error) {
        return (
            <div className="container mx-auto py-12 text-center">
                <h1 className="text-3xl font-bold text-red-600">{error}</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-4xl font-bold text-center mb-8">Explore Products</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {products.map((product) => (
                    <div key={product.id} className="bg-white shadow-md rounded overflow-hidden">
                        <Link href={`/products/${product.id}`}>
                            <div className="cursor-pointer">
                                <img
                                    src={
                                        product.images.length > 0
                                            ? product.images[0].image
                                            : "/placeholder.png"
                                    }
                                    alt={product.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h2 className="text-lg font-bold">{product.title}</h2>
                                    <p className="text-gray-500">{product.category}</p>
                                    <p className="text-blue-600 font-bold mt-2">
                                        ${parseFloat(product.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </Link>
                        <div className="mt-2 flex justify-between items-center">
                            <Link href={`/sellers/${product.seller.id}`}>
                                <p className="text-sm text-gray-500 cursor-pointer hover:underline">
                                    Sold by: {product.seller.first_name}
                                </p>
                            </Link>
                            <button
                                onClick={() => openMessageModal(product)} // Pass product to the modal
                                className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                            >
                                Message Seller
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded p-6 w-96">
                        <h2 className="text-lg font-bold mb-4">
                            Message {selectedProduct.seller.first_name}
                        </h2>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border rounded px-3 py-2 mb-4"
                            rows={5}
                            placeholder="Type your message here..."
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={closeMessageModal}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={sendMessage}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
