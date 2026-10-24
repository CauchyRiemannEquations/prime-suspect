# Portrait production milestone

Generated with OpenAI’s built-in image tool on 2026-10-24. Approved art direction: hardboiled tech-noir, textured ink/cel shading, restrained cyan rim light. Each neutral master establishes the actor; shaken variants edit the matching master.

| Case | Actors / file stems | Files |
| --- | --- | --- |
| 1 | char_c1_park, char_c1_choi, char_c1_han | 6 |
| 2 | char_c2_kim, char_c2_lee, char_c2_kang | 6 |
| 3 | char_c3_oh, char_c3_jung | 4 |
| 4 | char_c4_song, char_c4_yoon, char_c4_baek | 6 |

All 22 originals are in assets/portraits, with _neutral.png and _shaken.png suffixes. Appearance choices are proposed art, not changes to canonical roles. Choi’s final clean coat removes a noncanonical evidence cue. Original files retain transparency. Git blob hashes are verified against local files.

The game manifest and all gameplay/story/build files are unchanged. No merge or deployment was performed. Expressions are not yet switched in-game. 512px derivatives, mobile compositing and performance checks remain. Third/fourth expressions, protagonist, remaining backgrounds/items/UI/VFX/BGM/SFX remain unproduced. See the next checkpoint below.

## Case 1 scene, maps and MVP audio checkpoint

- assets/backgrounds/bg_c1_office.png: 1672×941 horizontal original, approximately 16:9 for the current scene layout. Not the initially suggested 1080×1920 full-screen asset.
- assets/items/item_manual_book.png and item_vent_grate.png: 1254×1254 transparent originals.
- assets/maps/: four 960×720 SVG blueprints, source data, generator and validation. Case 1 vent and Case 4 hatch are visible production references, NOT safe initial-game defaults. Implement reveal gating for #special-route after the relevant clue. Metadata alone does not hide them.
- assets/audio/prototypes/: three original procedurally synthesized 48kHz mono PCM16 WAV effects, generator and numeric validation. No external recordings, game samples or borrowed music. Not auditioned; these are prototypes, not sound-quality approved final mixes.
- Temporary map previews and concatenated audio preview were omitted to avoid duplicate output. Generators/README document regeneration.

No manifest, gameplay, story or built HTML changes; no merge, PR or deployment.
