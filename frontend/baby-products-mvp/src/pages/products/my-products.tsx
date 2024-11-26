import { useEffect, useState } from "react";
import axios from "axios";
import api from "../../utils/apiClient"; // Import your Axios instance
import Link from "next/link";
import React from "react";

interface Product {
  id: number;
  title: string;
  category: string;
  description: string;
  price: string;
  images: { id: number; file: string }[];
  status: string; // "available" or "sold"
}

const MyProducts = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [products, setProducts] = useState<Product[]>([]);
  const [expandedRow, setExpandedRow] = useState<number | null>(null); // Track expanded row
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyProducts = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await api.get(`${baseUrl}/products/my-products/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data);
        console.log(response.data)
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load your products.");
      }
    };
    fetchMyProducts();
  }, [baseUrl]);

  const handleDelete = async (productId: number) => {
    try {
      await api.delete(`/products/${productId}/`);
      setProducts(products.filter((product) => product.id !== productId));
      setSuccessMessage("Product deleted successfully.");
    } catch (err: any) {
      console.error("Failed to delete product:", err);
      setError("Failed to delete the product. Please try again.");
    }
  };

  const handlePriceUpdate = async (productId: number) => {
    try {
      await api.patch(`/products/${productId}/`, 
        { price: editingPrice }, 
        {
          headers: {
            "Content-Type": "application/json", // Set the content type explicitly
          },
        }
      );
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, price: editingPrice } : product
        )
      );
      setExpandedRow(null); // Collapse the row after saving
      setSuccessMessage("Price updated successfully.");
    } catch (err) {
      console.error("Failed to update price:", err);
      setError("Failed to update price. Please try again.");
    }
  };
  

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">My Selling Dashboard</h1>
      {successMessage && (
        <div className="text-center mb-4 text-green-600">{successMessage}</div>
      )}
      {error && <div className="text-center mb-4 text-red-600">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
  {products.map((product) => (
    <React.Fragment key={product.id}>
      <tr
        className={`border-b hover:bg-gray-100 ${
          expandedRow === product.id ? "bg-gray-50" : ""
        }`}
      >
        <td className="px-4 py-2 text-center">
          <img
            src={
              product.images.length > 0
                ? `${process.env.NEXT_PUBLIC_MEDIA_URL || baseUrl}${product.images[0].file}`
                : "/placeholder.png"
            }
            alt={product.title}
            className="w-16 h-16 object-cover rounded mx-auto"
          />
        </td>
        <td className="px-4 py-2 text-center">{product.title}</td>
        <td className="px-4 py-2 text-center">{product.category}</td>
        <td className="px-4 py-2 text-center">{product.description}</td>
        <td className="px-4 py-2 text-center">
          ${parseFloat(product.price).toFixed(2)}
        </td>
        <td className="px-4 py-2 text-center">
          <span
            className={`font-bold ${
              product.status === "sold" ? "text-red-600" : "text-green-600"
            }`}
          >
            {product.status}
          </span>
        </td>
        <td className="px-4 py-2 text-center">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setExpandedRow(product.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Price
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expandedRow === product.id && (
        <tr>
          <td colSpan={7} className="px-4 py-4 bg-gray-50 text-center">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="font-medium">Update Price:</label>
                <input
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                  className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`$${parseFloat(product.price).toFixed(2)}`}
                />
              </div>
              <button
                onClick={() => handlePriceUpdate(product.id)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>

        </table>
      </div>
    </div>
  );
};

export default MyProducts;