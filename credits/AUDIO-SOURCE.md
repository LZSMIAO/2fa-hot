# Button sound source

- Local file: `public/audio/minecraft-click.ogg`
- Original asset: `minecraft/sounds/random/click_stereo.ogg`
- Sound event: `ui.button.click` → `random/click_stereo`
- Official asset index: [26.2](https://piston-meta.mojang.com/v1/packages/e6ac246e2a151ff254110f4ddb1a944ed184d140/32.json)
- Official download: [Mojang resource CDN](https://resources.download.minecraft.net/f0/f0ca66561f832bf2f60b393837297c2692367cd5)
- SHA-1: `f0ca66561f832bf2f60b393837297c2692367cd5` (verified after download)
- Size: 7188 bytes

The audio is an unmodified Minecraft asset from Mojang/Microsoft. It is not original project code and is not covered by the project's code license.

The interface defaults to muted (an explicit enabled preference is retained), stores only the on/off preference locally, and preloads and decodes the same-origin sounds when enabled. Playback uses a short-lived Web Audio source per interaction, with preloaded audio elements as a fallback. Pointer input and keyboard activation are deduplicated; touch scrolling does not trigger a click sound. No third-party audio requests are made at runtime.

## Tip entrance

- Local file: `public/audio/minecraft-toast.ogg`
- Official asset: `minecraft/sounds/ui/toast/in.ogg` (`ui.toast.in`)
- Download: https://resources.download.minecraft.net/50/506f2fdb1b7530df66134aa04c71e66513df0c93
- SHA-1: `506f2fdb1b7530df66134aa04c71e66513df0c93` (verified)
- Size: 21392 bytes. Unmodified Mojang/Microsoft asset, not covered by the project code license.
- Plays once when a tip mounts, only when the user has enabled sounds.

- Tip playback volume: 75%; ordinary clicks and experience sounds remain at 35%, for both Web Audio and media-element fallback.

## Experience pickup sound

Minecraft Java 1.20.1 `minecraft/sounds/random/orb.ogg`, from Mojang’s official asset index.

Source: https://resources.download.minecraft.net/e9/e9833a1512b57bcf88ac4fdcc8df4e5a7e9d701d

Owned by Mojang/Microsoft; excluded from the project code license.
