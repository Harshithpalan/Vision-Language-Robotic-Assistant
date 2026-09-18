from typing import Optional


def generate_response(user_message: str, image_analysis: Optional[dict] = None) -> str:
    """Generate a response based on user message and optional image analysis."""
    message_lower = user_message.lower()

    if image_analysis:
        dims = image_analysis.get("dimensions", {})
        brightness = image_analysis.get("brightness", 0)

        if "describe" in message_lower or "what" in message_lower:
            return (
                f"I can see an image ({dims.get('width', '?')}x{dims.get('height', '?')}). "
                f"The scene appears to have {'good' if brightness > 128 else 'low'} lighting. "
                f"What would you like me to do with this visual input?"
            )

        if "color" in message_lower:
            avg = image_analysis.get("average_color", [0, 0, 0])
            return f"The dominant colors appear to be R:{avg[0]}, G:{avg[1]}, B:{avg[2]}. How can I help?"

    if any(w in message_lower for w in ["hello", "hi", "hey"]):
        return "Hello! I'm your Vision-Language Robotic Assistant. I can see through the camera and respond to your commands. What would you like me to do?"

    if any(w in message_lower for w in ["move", "go", "forward", "backward", "left", "right"]):
        return f"Robot received movement command: '{user_message}'. Executing navigation sequence..."

    if any(w in message_lower for w in ["pick", "grab", "grasp", "take"]):
        return f"Object manipulation command received: '{user_message}'. Planning grasp trajectory..."

    if any(w in message_lower for w in ["stop", "halt", "pause"]):
        return "Stopping all robot operations. Standing by for new commands."

    if "status" in message_lower:
        return "All systems nominal. Vision system active. Motors ready. Awaiting your instructions."

    if "?" in user_message:
        return f"I understand you're asking: '{user_message}'. As a robotic assistant, I can process visual data and execute physical commands. Could you be more specific about what you'd like me to do?"

    return f"Command received: '{user_message}'. Processing request through vision-language pipeline..."
