# Prime Suspect 인게임 기준 아트·사운드 명세 v1

검증: 2026-10-24. cases.js blob 8e8fa8b1ec1656cf589cb521c8b94ba827f0fd1e. 이 문서는 제작 명세이며 게임 코드/배포를 변경하지 않는다.

## 1. 기준과 범위
- 사용자 승인 그림체: 한도윤·박진우의 잉크+질감 셀셰이딩, 네이비·슬레이트·절제한 시안 림라이트.
- 사건 설정은 cases.js를 우선한다. 아래 인물의 나이·성별·체형·헤어·의상은 소스에 없는 경우 아트 제안이지 공식 설정이 아니다. 승인된 한도윤·박진우 원화는 디자인 기준으로 보존한다. 최유리도 이 그림체로 기본·당황 시안 제작을 마쳤다.
- 남은 인물 8명에 새 설정을 임의로 정사화하지 않는다. 총 용의자는 11명이며 주인공 별도 초상 슬롯은 현재 없다.
- 원본 파일과 512px 인게임 파생본을 분리한다. 투명 PNG, 얼굴 위치·몸 크기·기준선 통일. 생성 결과는 축소·실제 배경 합성 후 확인한다.
- 색만으로 상태를 표현하지 않는다. 아이콘/테두리 형태/텍스트를 함께 사용하고 빠른 점멸을 피한다.

## 2. 캐릭터
### char_c1_park — 박진우
- 인게임 역할: 보안 엔지니어
- 사건 사실: 점검 누락을 숨김. 실행범 아님.
- 외형: 30대 남성 제안. 지친 눈과 다크서클, 헝클어진 짧은 검은 머리, 면도한 얼굴, 헐렁한 슬레이트 작업복, 어깨 공구 스트랩. 승인된 원화 그대로.
- 표정: 기본/귀찮음, 당황, 시선 회피
- 현재 연결 키: portraits.park

### char_c1_choi — 최유리
- 인게임 역할: 수석 연구원 · 최초 발견자
- 사건 사실: 시신 발견 후 같은 문으로 퇴실.
- 외형: 30대 여성 제안. 안경, 단정한 올림머리, 흰 실험 가운, 창백하고 불안한 얼굴. 가운의 혈흔은 소스에 없어 기본안에서 제외.
- 표정: 기본/불안, 당황/공포, 안도
- 현재 연결 키: portraits.choi

### char_c1_han — 한도윤
- 인게임 역할: 부소장
- 사건 사실: Case 1 실행범. 13 진입→5 환기 덕트→5 퇴실.
- 외형: 50대 남성 제안. 회색이 섞인 빗어 넘긴 머리, 짧은 턱수염, 직사각 안경, 정장 조끼·황동 회중시계 체인. 승인 원화 고정.
- 표정: 기본/거만, 동요, 냉소, 분노/붕괴
- 현재 연결 키: portraits.han

### char_c2_kim — 김태호
- 인게임 역할: 배양 연구원
- 사건 사실: 세척실·배양실 방문. Case 2 실행범 아님.
- 외형: 30대 남성 제안. 둥근 얼굴, 짧은 곱슬 머리, 회녹색 실험복, 가슴 배양 샘플 홀더. 차분한 표정.
- 표정: 기본/침착, 놀람, 안도
- 현재 연결 키: portraits.kim

### char_c2_lee — 이서연
- 인게임 역할: 수석 연구원 · 최초 발견자
- 사건 사실: 정전 후 독성 실험실 방문.
- 외형: 40대 여성 제안. 낮게 묶은 머리, 넓은 이마, 은색 얇은 안경, 청회색 가운. 최유리와 다른 얼굴·실루엣.
- 표정: 기본/불안, 당황, 안도
- 현재 연결 키: portraits.lee

### char_c2_kang — 강현우
- 인게임 역할: 선임 연구원
- 사건 사실: Case 2 실행범. 정전 전 독성실 왕복, 21:05 세척실 안.
- 외형: 40대 남성 제안. 각진 얼굴, 짧고 정돈된 머리, 목까지 잠근 어두운 실험복, 손목 고무장갑. 침착한 척 방어적.
- 표정: 기본/방어적, 계산적 미소, 동요, 붕괴
- 현재 연결 키: portraits.kang

### char_c3_oh — 오민석
- 인게임 역할: 보안팀장 · 서쪽(3) 권한
- 사건 사실: Case 3 살인·도난 실행범.
- 외형: 40대 남성 제안. 넓은 어깨, 직선적인 턱, 전술 보안 조끼·무전기, 짧은 머리. 자신만만.
- 표정: 기본/자신만만, 비웃음, 당황, 좌절
- 현재 연결 키: portraits.oh

### char_c3_jung — 정하늘
- 인게임 역할: 데이터 분석가 · 동쪽(5) 권한
- 사건 사실: Case 3 카드 교환 공범. Case 4 흑막 아님.
- 외형: 성별은 소스 미지정. 중성적인 30대 외형 제안. 턱선까지 오는 단정한 머리, 얇은 집업·데이터 태블릿, 불안한 눈. 휠체어·깁스·환자복 제외.
- 표정: 기본/불안, 당황, 죄책감/좌절
- 현재 연결 키: portraits.jung

### char_c4_song — 송지훈
- 인게임 역할: 전산실장
- 사건 사실: 1,763에 +1 복구→1,764. 출입 진술은 거짓이나 자폭 실행범과 다름.
- 외형: 40대 남성 제안. 길고 마른 얼굴, 뒤로 넘긴 흐트러진 머리, 낡은 니트 조끼·셔츠, 케이블 테스터. 당황.
- 표정: 기본/당황, 변명, 안도
- 현재 연결 키: portraits.song

### char_c4_yoon — 윤채원
- 인게임 역할: 보안 부책임자
- 사건 사실: 6,084 카드. 비상 발전실 점검 진술. Case 2 실행범 아님.
- 외형: 30대 여성 제안. 짧게 묶은 머리, 단정한 보안 제복, 팔 통신기, 침착하고 단호한 눈매.
- 표정: 기본/침착, 놀람, 단호
- 현재 연결 키: portraits.yoon

### char_c4_baek — 백도현
- 인게임 역할: 연구소 총괄 이사
- 사건 사실: Case 4 흑막. 1,009에 −1 복구→1,008. 가짜 퇴근·재침입.
- 외형: 60대 남성 제안. 뒤로 넘긴 은발, 넓고 매끈한 얼굴, 고급 긴 코트, 작은 황동 칼라 장식. 한도윤과 다른 얼굴·의상. 의료기기 착용 금지.
- 표정: 기본/여유, 냉소, 동요, 최종 붕괴
- 현재 연결 키: portraits.baek

### 선택 사항: char_protagonist
현재 플레이어용 초상 슬롯은 없다. 트렌치코트 실루엣·팩터 디코더를 든 수사관을 추가하더라도 별도 아트 제안이며 이름·성별·과거사를 정사로 만들지 않는다. 기본/단말기 제시 두 자세가 가능하다.

## 3. 배경
수심 1,000m에서 비가 내리거나 외벽 유리가 깨진 채 건조한 사무실이 유지되는 표현은 피한다. 연구소 이름 ‘아르키메데스 랩’은 현재 cases.js에 없으므로 텍스트로 고정하지 않는다.
- bg_title: 수심 1,000m 해저 연구소 전경. Deep-ocean research complex at 1000m, suspended particles and distant bubbles, analog industrial windows, restrained red emergency lights. No rainfall underwater, no invented readable lab name.
- bg_c1_office: 제1연구동 소장실. Undersea research director office, old ceiling vent, fine disturbed dust, dim analog desk lighting, restrained non-graphic covered body silhouette on floor. Outer pressure window intact. No breached external glazing or flooded room.
- bg_c2_biochem: 제2연구동 생화학 구역. Biochemistry security corridor during power outage, red backup lights, anonymous emergency backup terminal, closed doors to labs. No invented flooding, blood or room 11.
- bg_c3_vault: 제3연구동 보안 금고실. Restricted west-wing secure vault chamber with a plain door frame and opened quantum-chip storage case, retrofuturist cold steel. No retinal scanner at vault 13; biometric scanners belong at corridor gates 3 and 5. No new passage contradicting the floorplan.
- bg_c4_core: 지하 코어 냉각 제어실. Core cooling control chamber, activated emergency lever without card reader, sealed main gate, ladder emergency hatch toward interior elevator hall. Red emergency lamps and analog cooling monitors, tense not destroyed. No outside escape hatch, no invented burning ruins.

## 4. 평면도: 반드시 코드/SVG로 제작
숫자와 한글은 이미지 생성에 맡기지 않는다. 지도 좌표는 게임의 백분율을 그대로 옮기며, 연결을 장식 목적으로 추가하지 않는다.
### map_case1_blueprint
- 노드: 2 메인 로비 (50%,13%); 3 보안 중문 (50%,37%); 5 약품 보관실 (21%,70%); 7 서버 통제실 (50%,86%); 13 소장실 (79%,70%)
- 일반 연결: 2–3, 3–5, 3–7, 3–13
- 특수 연결: 5→13 센서 없는 환기 덕트
### map_case2_blueprint
- 노드: 2 메인 로비 (50%,13%); 3 생화학 보안 복도 (50%,37%); 5 균주 배양실 (21%,70%); 7 특수 세척실 (50%,86%); 13 독성 실험실 (79%,70%)
- 일반 연결: 2–3, 3–5, 3–7, 3–13
- 특수 연결: 없음
### map_case3_blueprint
- 노드: 2 메인 로비 (50%,12%); 3 서쪽 보안 복도 (24%,38%); 5 동쪽 데이터 복도 (76%,38%); 7 중앙 휴게 라운지 (50%,61%); 13 보안 금고실 (24%,86%); 11 메인 서버실 (76%,86%)
- 일반 연결: 2–3, 2–5, 3–7, 5–7, 3–13, 5–11
- 특수 연결: 없음
### map_case4_blueprint
- 노드: 2 메인 로비 (50%,13%); 3 지하 엘리베이터 홀 (50%,37%); 5 의무실 (21%,70%); 7 코어 냉각 제어실 (50%,86%); 13 비상 발전실 (79%,70%)
- 일반 연결: 2–3, 3–5, 3–7, 3–13
- 특수 연결: 7→3 해치 → 홀 내부
- Case 2 익명 백업은 카메라 촬영이 아니라 비상 백업 단말기. 숫자 150 / 1,470 / 7,098, 이름 없음.
- Case 3 접선은 7 중앙 휴게 라운지. 망막 인증은 3 오민석, 5 정하늘의 신체를 확인하며 카드를 바꿔도 권한은 바뀌지 않는다.
- Case 4 해치는 7→3 내부. 외부 직통이 아니다. 이후 3과 2 게이트를 통과해야 외부로 나간다.

## 5. 단서 아이콘
- item_keycard_normal: 마그네틱 키카드. Analog access card with black magnetic stripe; blank numeric display reserved for code overlay.
- item_keycard_1009: 백도현 카드. Intact analog magnetic access card with small electrical discoloration as optional art detail; blank display for exact 1009 overlay. Do not imply primality itself is corruption.
- item_manual_book: 보안 프로토콜 매뉴얼. Worn classified security manual, simple doorway schematic, blank label area; exact multiplication rule added in code.
- item_vent_grate: 천장 환기 덕트. Old ceiling ventilation grate with recently wiped dust trail, no newly invented screwdriver evidence.
- item_snapshot_log: 21:05 익명 백업. Thermal backup strip with three blank data rows for code overlay of 150,1470,7098, no names.
- item_fluorescent_drain: 배수구의 형광 시약. Laboratory drain grate with a tiny fluorescent chemical residue, no blood, no towel.
- item_retina_scanner: 전용 망막 스캐너. Retinal scanner hardware with simplified eye graphic; no readable text; distinguish physical biometric identity from magnetic card ownership.
- item_central_lounge: 중앙 휴게 라운지. Small schematic photo of neutral central lounge with two internal approaches; no invented CCTV blind spot or hidden camera evidence.
- item_magnetic_coil: 코일의 역자기장. Industrial magnetic coil mounted outside generator room entrance, small amber hazard light; no numeric text.
- item_aed_discharged: 방전된 제세동기. Portable medical defibrillator discarded near a refuse chute, empty battery display reserved for exact zero overlay. No use on character body.
- item_escape_hatch: 제어실 비상 해치. Manual ladder hatch connecting control chamber to interior elevator hall; no sea or exterior exit visible.

## 6. UI/VFX와 수학적 정확성
- ui_decoder_frame: CRT/황동·강철 질감은 얇게, 숫자·버튼 대비 우선. 현재 화면 구조를 가리는 거대 고정 베젤은 피한다.
- ui_block_even: 짝수 지수는 왕복과 양립하는 기록. 무죄나 데이터 정상의 보증이 아니다.
- ui_block_odd: 홀수 지수는 홀수 횟수 통과. 주목 표시이며 단독 오류/범죄 판정 아님.
- ui_block_prime_state: 1009는 소수다. 더 분해되지 않음은 정상 수학 결과다. 현장 단서와 ±1 보정이 연결될 때만 조작된 기록임을 표시한다.
- ui_switch_swap: Case 3 라운지 이후 퇴실 블록을 교환. 전체 카드 숫자를 무조건 교환하는 연출은 피한다.
- ui_dial_noise: -1 / 0 / +1. 송지훈은 코일의 -1 오염을 +1로 복구, 백도현은 AED의 +1 오염을 -1로 복구.
- ui_btn_contradict: 게임의 증거 선택·조건 충족과 연결. 존재하지 않는 게이지를 사실처럼 추가하지 않는다.
- vfx_prime_slash: 합성수 분해 때 짧은 빛과 분리, 텍스트는 코드.
- vfx_logic_shatter: 성공 진술 파편. 새 증거를 만들거나 카드가 물리적으로 파괴된 것처럼 표현하지 않는다.
- 최종 곱만으로 방문 순서·시각·소지자를 복원할 수 없다. 스냅샷·지도·인증 단서가 함께 필요하다.

## 7. 사운드 제작 명세
모든 음원은 독자 제작. 역전재판 등의 구체적 멜로디·편곡·샘플을 복제하지 않는다. 앱 음소거·볼륨 설정과 모바일 오디오 시작 제약은 후속 연결에서 처리한다.
- bgm_deep_sea_investigation: 조사, 60–75 BPM. Original low sonar pulse, cold sustained synth, sparse industrial ambience, calm space for reasoning. 30–60초 파일럿 루프, OGG+WAV 마스터.
- bgm_interrogation_base: 심문, 85–100 BPM. Original dry clock ticks, restrained bass ostinato, subdued tension without melodic clutter. 30–60초 파일럿 루프, OGG+WAV 마스터.
- bgm_prime_pursuit: 결정적 논파, 130–145 BPM. Original energetic electronic synthwave, syncopated bass, clear rising momentum; do not imitate any existing game melody, arrangement or audio. 30–60초 파일럿 루프, OGG+WAV 마스터.
- bgm_trick_revealed: 전말 재구성, 65–80 BPM. Original sparse piano and muted strings with measured resolution, eerie but intelligible beneath dialogue. 30–60초 파일럿 루프, OGG+WAV 마스터.
- sfx_card_swipe: 카드 스캔, 0.25–0.45s. Dry magnetic card scrape, short mechanical click, restrained confirmation chirp.
- sfx_factor_computing: 분해 계산, 0.5s. Brief retro relay chatter and tiny computer pulses, no piercing continuous tone.
- sfx_factor_split_ok: 분해 완료, 0.35–0.7s. Two or three crisp interlocking metal chip clicks with satisfying transient; not an explosion.
- sfx_odd_exponent_focus: 홀수 지수 주목, 0.15–0.3s. Single restrained analytical notification, not a guilt or error alarm.
- sfx_prime_lock: 소수 상태, 0.3–0.5s. Muted metal stop plus analytical low pulse, not universal error.
- sfx_noise_adjust: ±1 보정, 0.25–0.5s. Analog toggle click and brief electric crackle; same neutral sound for both correction directions.
- sfx_text_type: 문자 출력, 0.025–0.06s. Soft mechanical key tap, very low loudness, several variations to avoid fatigue.
- sfx_statement_lock: 진술 선택, 0.1–0.2s. Short target latch click.
- sfx_logic_break: 모순 제시 성공, 0.7–1.1s. Designed glass fracture layered with low impact and short tail, punch audible on phone speakers, no clipping.
- sfx_damage_suspect: 진술 붕괴 반응, 0.2–0.4s. Short weighty cinematic hit without real violence sound.
- sfx_penalty_wrong: 잘못된 제시, 0.25–0.5s. Soft dissonant buzzer, not punishingly loud.
- sfx_snapshot_match: 스냅샷 배정, 0.2–0.4s. Three precise data-slot clicks.
- sfx_card_swap: 퇴실 기록 맞교환, 0.3–0.6s. Paired sliding chips crossing, then two light latches.
- WAV 48kHz 16bit PCM, 피크 -1dBFS 이하. 루프 접합·클릭·클리핑·모바일 스피커 재생을 검수한다. 서브베이스만으로 타격감을 만들지 않는다.

## 8. 제작 상태 (2026-10-25)
전 범주의 원화·벡터·오디오 시안이 준비됐다. 인물 40장(기본/당황 22장, 추가 용의자 표정 16장, 주인공 2장), 배경 5장, 증거 아이콘 11장, 지도 4종, UI/VFX SVG 40개, 효과음 13종(타자 변형 포함 WAV 15개), BGM 4종이다.
신규 에셋의 제작 및 수치 검증과 실제 게임 통합 완료를 구분한다. 음원 청감 승인, 실제 모바일/브라우저 검수, 512px/256px 파생본 최적화, 코드 연결은 남아 있다. BGM Git 배포본은 OGG이며 대용량 WAV 원본은 별도 제공/생성기로 재현한다.
지도는 제작용 특수 경로가 보이므로 단서 공개 조건을 연결해야 한다. 금고 13에는 망막 스캐너가 없고 인증 게이트는 3/5이다. Case 4 해치는 의무실 7에서 내부 복도 3으로 연결된다.
게임 manifest, 스토리, 빌드 파일 변경 및 PR·병합·배포는 수행하지 않았다. 상세 검수는 CHECKLIST_KO.md와 각 묶음의 검증 문서를 참조한다.

## 9. 검수 체크리스트
- 동일 캐릭터의 얼굴·헤어·의상·소품·크기·기준선 유지.
- 코드에서 넣을 숫자·한글을 그림에 중복으로 굽지 않음.
- 민감한 반전 자산명/프롬프트는 제작용이며 플레이 화면에서 스포일러로 노출하지 않음.
- 소스에 없는 혈흔·CCTV 사각지대·외부 탈출을 증거로 추가하지 않음.
- PROMPTS.json의 appearance_status를 존중. proposed는 정사 정보가 아님.

## 출처
https://github.com/CauchyRiemannEquations/prime-suspect/blob/main/cases.js
https://github.com/CauchyRiemannEquations/prime-suspect/blob/main/assets/manifest.js
