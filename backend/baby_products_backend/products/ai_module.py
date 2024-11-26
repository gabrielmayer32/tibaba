import cv2
from PIL import Image

def assess_image_quality(file_path):
    """
    Assess the quality of an image by checking for blurriness and resolution.

    Parameters:
        file_path (str): Path to the image file.

    Returns:
        dict: A dictionary with the status ('Good' or 'Bad') and feedback.
    """
    feedback = []

    # Load the image using OpenCV
    image = cv2.imread(file_path)

    # Check if the image is successfully loaded
    if image is None:
        return {"status": "Bad", "feedback": "Unable to load the image."}

    # Check for blurriness using Laplacian variance
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var < 100:  # Adjust threshold for blurriness
        feedback.append("The image appears blurry.")

    # Check resolution
    height, width, _ = image.shape
    if height < 800 or width < 800:  # Minimum acceptable resolution
        feedback.append(f"The resolution is too low ({width}x{height}). Minimum is 800x800.")

    # Optional: Check aspect ratio
    aspect_ratio = width / height
    if aspect_ratio < 0.5 or aspect_ratio > 2.0:  # Example acceptable range
        feedback.append("The aspect ratio is unusual. Ensure the image is not distorted.")

    # Return results
    if feedback:
        return {"status": "Bad", "feedback": "; ".join(feedback)}
    return {"status": "Good"}
