import base64
from io import BytesIO
from PIL import Image
import numpy as np


def decode_image(base64_string: str) -> Image.Image:
    """Decode base64 image string to PIL Image."""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    image_data = base64.b64decode(base64_string)
    return Image.open(BytesIO(image_data))


def analyze_image(image: Image.Image) -> dict:
    """Analyze image and return basic features."""
    img_array = np.array(image)
    height, width = img_array.shape[:2]

    avg_color = img_array.mean(axis=(0, 1)).tolist()

    brightness = np.mean(img_array)

    return {
        "dimensions": {"width": width, "height": height},
        "average_color": [int(c) for c in avg_color[:3]],
        "brightness": float(brightness),
        "description": f"Image {width}x{height}, brightness: {brightness:.1f}/255"
    }
