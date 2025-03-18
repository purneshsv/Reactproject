from PIL import Image, ImageDraw, ImageFont
import os

# Colors from our theme
PRIMARY_COLOR = "#0D47A1"  # Deep blue from MG logo
SECONDARY_COLOR = "#FF5722"  # Orange from MG logo
BACKGROUND_COLOR = "#ffffff"  # White
ORIGINAL_LOGO_COLOR = "#FF5722"  # Orange from MG logo

# Get absolute paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(
    PROJECT_ROOT,
    "ios",
    "EmployeeManagement",
    "Images.xcassets",
    "AppIcon.appiconset"
)

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient(size, color1, color2):
    base = Image.new('RGBA', (size, size), color1)
    top = Image.new('RGBA', (size, size), color2)
    mask = Image.new('L', (size, size))
    mask_data = []
    for y in range(size):
        mask_data.extend([int(255 * (y / size))] * size)
    mask.putdata(mask_data)
    return Image.composite(base, top, mask)

def get_system_font(size):
    """Try to get a system font, with fallbacks"""
    font_paths = [
        "/System/Library/Fonts/SFPro-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/SFPro-Regular.ttf"
    ]
    
    for path in font_paths:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            continue
    
    return ImageFont.load_default()

def create_mg_logo(size):
    """Create the MG logo as seen in the uploaded image"""
    # Create a new image with transparent background
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Draw the orange circle
    circle_color = hex_to_rgb(ORIGINAL_LOGO_COLOR)
    circle_padding = int(size * 0.05)  # 5% padding
    circle_size = size - (2 * circle_padding)
    
    # Draw the circle
    draw.ellipse(
        [(circle_padding, circle_padding), 
         (size - circle_padding, size - circle_padding)],
        fill=circle_color
    )
    
    # Calculate font size for 'mg' text
    font_size = int(size * 0.5)  # 50% of the icon size
    font = get_system_font(font_size)
    
    # Draw 'mg' text in white
    text = "mg"
    text_bbox = draw.textbbox((0, 0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    # Position text in the center, slightly higher
    x = (size - text_width) / 2
    y = (size - text_height) / 2 - (size * 0.05)  # Slightly higher
    
    # Draw the text
    draw.text((x, y), text, font=font, fill="white")
    
    # Add the small dot in the top right
    dot_size = int(size * 0.05)
    dot_x = size - int(size * 0.25)  # 25% from right
    dot_y = int(size * 0.25)  # 25% from top
    draw.ellipse(
        [(dot_x - dot_size/2, dot_y - dot_size/2),
         (dot_x + dot_size/2, dot_y + dot_size/2)],
        fill="white"
    )
    
    # Add the "crack" effect (simplified)
    crack_width = int(size * 0.03)
    crack_points = [
        (size - int(size * 0.25), int(size * 0.25)),  # Start at the dot
        (size - int(size * 0.15), int(size * 0.15)),  # Go toward edge
        (size - int(size * 0.05), int(size * 0.05))   # End near edge
    ]
    
    # Draw the crack line
    for i in range(len(crack_points) - 1):
        draw.line(
            [crack_points[i], crack_points[i+1]],
            fill="white",
            width=crack_width
        )
    
    return image

def create_icon(size):
    # Create the MG logo
    image = create_mg_logo(size)
    
    # No need for additional effects as the logo is already complete
    return image

def generate_all_icons():
    # Define all required sizes
    sizes = {
        "40": "20x20@2x",
        "60": "20x20@3x",
        "58": "29x29@2x",
        "87": "29x29@3x",
        "80": "40x40@2x",
        "120": ["40x40@3x", "60x60@2x"],
        "180": "60x60@3x",
        "1024": "1024x1024"
    }
    
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Creating icons in: {OUTPUT_DIR}")
    
    # Generate icons for all sizes
    for size, names in sizes.items():
        size = int(size)
        if isinstance(names, str):
            names = [names]
        
        try:
            icon = create_icon(size)
            
            for name in names:
                filename = f"icon_{name.replace('@', '_')}.png"
                output_path = os.path.join(OUTPUT_DIR, filename)
                icon.save(output_path, "PNG")
                print(f"Generated {filename}")
        except Exception as e:
            print(f"Error generating icon for size {size}: {str(e)}")

if __name__ == "__main__":
    generate_all_icons()
