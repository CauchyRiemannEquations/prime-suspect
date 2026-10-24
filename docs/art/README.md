# Tech-noir art production

Generated with the OpenAI built-in image generation tool on 2026-10-24, at the repository owner's request. These are production drafts, not photographs or commissioned human illustrations.

## Batch 1: Case 1

Six transparent 1254 × 1254 PNG originals are stored in `assets/portraits/`:

| Character | Neutral master | Expression edit |
| --- | --- | --- |
| 박진우 / park | char_c1_park_neutral.png | char_c1_park_shaken.png |
| 최유리 / choi | char_c1_choi_neutral.png | char_c1_choi_shaken.png |
| 한도윤 / han | char_c1_han_neutral.png | char_c1_han_shaken.png |

Han's neutral master establishes the approved visual style. Park and Choi use that style reference with separate identities; each shaken variant uses its own neutral master. Choi's final clean coat supersedes an earlier blood-stained preview, avoiding an unsupported evidence cue.

`INGAME_ASSET_SPEC_KO.md` and `PROMPTS.json` reconcile the supplied art brief with the actual game. Proposed appearances are distinguished from canonical facts. All later-case images, backgrounds, music and sound effects listed there are specifications only until a later batch marks them complete.

## Integration status

This branch adds files only. `assets/manifest.js`, game logic, story, map connectivity and the built single HTML are unchanged. The current game has one portrait slot per actor; expression switching needs a later implementation. No integration, deployment or mobile performance claim is made. PNG decoding, RGBA transparency and Git blob hashes were checked; 512px production derivatives and in-game visual review remain to be done.
