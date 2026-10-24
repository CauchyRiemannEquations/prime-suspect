# Tech-noir art production

Generated with OpenAI's built-in image generation tool on 2026-10-24 at the repository owner's request. These are original AI-generated production drafts, not photographs or commissioned human illustrations.

## Completed portrait milestone

11 in-game suspects × neutral/shaken = 22 transparent PNG originals are stored in `assets/portraits/`. See [BATCHES.md](BATCHES.md) for the complete filename mapping and current scope.

Han's neutral master establishes the approved visual style. Other actors use that style reference with distinct identities; each shaken variant edits its own neutral master. Choi's final clean coat supersedes the earlier blood-stained preview, avoiding an unsupported evidence cue.

[INGAME_ASSET_SPEC_KO.md](INGAME_ASSET_SPEC_KO.md) and [PROMPTS.json](PROMPTS.json) reconcile the supplied brief with the actual game. Proposed appearances are distinguished from canonical facts. Completed next checkpoint: Case 1 office background (1672×941 horizontal), two evidence icons (1254×1254), four chapter blueprints (960×720 SVG), and three original procedural WAV SFX prototypes. Third/fourth expressions, protagonist, remaining backgrounds/items/UI/VFX/BGM/SFX remain unproduced. Map special routes require reveal gating before game use. Audio is numerically validated but not auditioned.

## Integration status

This branch adds assets and production documentation only. `assets/manifest.js`, gameplay logic, story, map connectivity and the built single HTML are unchanged. The game currently has one portrait slot per actor; expression switching requires a later implementation. No merge or deployment was performed. PNG transparency and upload Git blob hashes were checked; production resizing and in-game/mobile visual review remain.
