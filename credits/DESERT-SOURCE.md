# Desert decoration

The decorative scene uses Minecraft Bedrock block textures from Mojang's official [bedrock-samples resource pack](https://github.com/Mojang/bedrock-samples/tree/main/resource_pack/textures/blocks):

- `cactus_side.tga` and `cactus_top.tga`: converted to PNG for browser support, without repainting the texture.
- `sand.png`: unchanged.

The SVG arranges these textures on block faces with light face shading. This is a project-composed scene using original game textures, not a screenshot from Minecraft. The textures belong to Mojang/Microsoft and are not covered by the project's code license.

The character uses [丛雨 by Konata on LittleSkin (513373)](https://littleskin.cn/skinlib/show/513373), selected by the project owner. The original 64×64 PNG is stored in `public/skins/congyu.png` and mapped onto an Alex model (3-pixel arms), including its outer layers. Skin rights remain with the respective creator; it is not covered by the project's code license.

`scripts/render-desert.py` composes the scene into `public/art/desert-scene.svg`. The seated pose is project-created, not an official Minecraft animation.
