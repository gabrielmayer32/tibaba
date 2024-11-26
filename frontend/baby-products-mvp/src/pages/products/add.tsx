import { useRouter } from "next/router";
import axios from "axios";
import { useState, useEffect } from "react";

const AddProduct = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [failedImages, setFailedImages] = useState<{ name: string; feedback: string }[]>([]);

    const router = useRouter();
    useEffect(() => {
        // Check if the user is logged in
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.log(token)
            // Redirect to login page if not authenticated
            router.push("/auth/login");
        }
    }, [router]);
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setFailedImages([]);

        if (parseFloat(price) <= 0) {
            setError("Price must be a positive number.");
            return;
        }

        // FOR PRODUCTION

        // if (images.length < 3) {
        //     setError("Please upload at least 3 images.");
        //     return;
        // }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("price", price);
        formData.append("category", category);
        images.forEach((image) => formData.append("images", image));

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("You must be logged in to add a product.");
                return;
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products/`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccess(true);
            resetForm();
        } catch (err: any) {
            if (err.response?.data?.failed_images) {
                setFailedImages(err.response.data.failed_images);
                setError("Some images failed the quality check. Please review the issues below.");
            } else {
                setError("Failed to add product. Please try again.");
            }
        }
    };



    const resetForm = () => {
        setTitle("");
        setDescription("");
        setPrice("");
        setCategory("");
        setImages([]);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setImages((prevImages) => {
                const allFiles = [...prevImages, ...fileList];
                const uniqueFiles = Array.from(
                    new Map(allFiles.map((file) => [file.name, file])).values()
                );
                return uniqueFiles;
            });
        }
    };

    const handleRemoveImage = (imageName: string) => {
        setImages((prevImages) => prevImages.filter((image) => image.name !== imageName));
    };

    const isImageFailed = (imageName: string) => {
        return failedImages.some((img) => img.name === imageName);
    };

    const getImageFeedback = (imageName: string) => {
        const failedImage = failedImages.find((img) => img.name === imageName);
        return failedImage ? failedImage.feedback : null;
    };

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold text-center mb-6">Add Product</h1>
            {success && <p className="text-green-500 text-center">Product added successfully!</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            <form
                className="max-w-md mx-auto bg-white shadow-lg p-6 rounded-xl"
                onSubmit={handleSubmit}
            >
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Price</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Category</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">Images</label>
                    <input
                        type="file"
                        multiple
                        onChange={handleImageChange}
                        className="w-full"
                        required
                    />
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-xl shadow hover:bg-blue-700 transition-colors">
                    Add Product
                </button>
                {images.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-medium mb-2">Selected Images:</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`relative border ${
                                        isImageFailed(image.name) ? "border-red-500" : "border-gray-300"
                                    } p-1 rounded`}
                                >
                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt={image.name}
                                        className="h-20 w-20 object-cover rounded"
                                    />
                                    {isImageFailed(image.name) && (
                                        <p className="text-xs text-red-500 mt-1 text-center">
                                            {getImageFeedback(image.name)}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => handleRemoveImage(image.name)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddProduct;
