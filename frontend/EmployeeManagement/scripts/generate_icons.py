from PIL import Image, ImageDraw, ImageFont
import os

# Colors from our theme
PRIMARY_COLOR = "#00a19a"  # Teal/blue-green
SECONDARY_COLOR = "#2c3e50"  # Dark blue/slate
BACKGROUND_COLOR = "#ffffff"  # White
GRADIENT_TOP = "#00a19a"  # Teal
GRADIENT_BOTTOM = "#006d68"  # Darker teal

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

def create_icon(size):
    # Create base image with gradient
    image = create_gradient(size, hex_to_rgb(GRADIENT_TOP), hex_to_rgb(GRADIENT_BOTTOM))
    draw = ImageDraw.Draw(image)
    
    # Calculate font sizes based on icon size
    main_font_size = int(size * 0.35)  # Larger MG text
    sub_font_size = int(size * 0.18)   # Smaller TECH text
    
    # Get fonts
    main_font = get_system_font(main_font_size)
    sub_font = get_system_font(sub_font_size)
    
    # Draw rounded rectangle for background
    corner_radius = size * 0.2
    
    # Calculate text positions for "MG"
    text_mg = "MG"
    mg_bbox = draw.textbbox((0, 0), text_mg, font=main_font)
    mg_width = mg_bbox[2] - mg_bbox[0]
    mg_height = mg_bbox[3] - mg_bbox[1]
    
    # Calculate text positions for "TECH"
    text_tech = "TECH"
    tech_bbox = draw.textbbox((0, 0), text_tech, font=sub_font)
    tech_width = tech_bbox[2] - tech_bbox[0]
    tech_height = tech_bbox[3] - tech_bbox[1]
    
    # Position both texts with proper spacing
    spacing = size * 0.02  # 2% of icon size for spacing
    total_height = mg_height + tech_height + spacing
    start_y = (size - total_height) / 2
    
    # Draw "MG" text
    x_mg = (size - mg_width) / 2
    y_mg = start_y
    # Add subtle shadow effect
    shadow_offset = max(1, int(size * 0.01))
    draw.text((x_mg + shadow_offset, y_mg + shadow_offset), text_mg, 
              font=main_font, fill=(0, 0, 0, 100))
    draw.text((x_mg, y_mg), text_mg, font=main_font, fill="white")
    
    # Draw "TECH" text
    x_tech = (size - tech_width) / 2
    y_tech = y_mg + mg_height + spacing
    draw.text((x_tech + shadow_offset, y_tech + shadow_offset), text_tech,
              font=sub_font, fill=(0, 0, 0, 100))
    draw.text((x_tech, y_tech), text_tech, font=sub_font, fill="white")
    
    # Add shine effect
    shine_height = int(size * 0.4)
    shine = Image.new('RGBA', (size, shine_height), (0, 0, 0, 0))
    shine_draw = ImageDraw.Draw(shine)
    
    # Create diagonal shine
    for y in range(shine_height):
        alpha = int(255 * (1 - y / shine_height) * 0.15)  # 15% max opacity
        shine_draw.line([(0, y), (size, y)], fill=(255, 255, 255, alpha))
    
    # Rotate and position shine
    rotated_shine = shine.rotate(45, expand=True)
    shine_x = int((size - rotated_shine.width) / 2)
    shine_y = int((size - rotated_shine.height) / 2)
    image.paste(rotated_shine, (shine_x, shine_y), rotated_shine)
    
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
