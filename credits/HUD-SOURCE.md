# Experience bar textures

Original Minecraft Bedrock textures from [Mojang/bedrock-samples](https://github.com/Mojang/bedrock-samples/tree/main/resource_pack/textures/ui):

- `experiencebarempty.png` → `public/textures/experience-empty.png`
- `experiencebarfull.png` → `public/textures/experience-full.png`

`experiencenub.png` → `public/textures/experience-notch.png` is the 11 × 5 repeating overlay used by the official HUD.

The original empty and full assets are unmodified 13 × 5 PNGs. The current empty track is project-drawn CSS with a plain dark inset, replacing the stretched empty texture. The official metadata specifies horizontal nine-slicing with 1-pixel end caps. The website preserves those caps at 2× scale and stretches the middle. The bar is capped at 380 CSS pixels, and the notch overlay repeats at 2× scale rather than stretching. Implementation checked against Mojang’s `resource_pack/ui/hud_screen.json` (`full_progress_bar`, `empty_progress_bar`, `progress_bar_nub`). Remaining time clips the full layer instead of scaling the texture.

Minecraft assets belong to Mojang/Microsoft and are not covered by the project's code license. The diamond sword cursor is a project-drawn SVG; it is not an extracted game texture.
