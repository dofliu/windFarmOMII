# OWM P01 Engineering Background Guardrails

## R7 Casting Variety Anti-Clone Update

Revision: `OWM-P01-R7-CASTING-VARIETY-ANTI-CLONE`

Applies to pending and future P01 Source Art generations. Already generated artwork remains unchanged unless explicitly regenerated.

R7 addresses the current failure mode where the results are visually attractive but still read as the same young female lead with different PPE and background.

Each new 10-character pending batch must still read as a real offshore-wind workforce ensemble:

- at least 4 adult men or clearly masculine adult professionals;
- at least 2 genuinely androgynous adult professionals;
- no more than 4 feminine adult professionals;
- at least 8 visible age impressions;
- at least 3 mature-adult impressions;
- at least 9 distinct pose silhouettes;
- at least 7 camera angles;
- at least 5 non-glamour task poses.

Variation must be decided before outfit/background. Lock apparent age decade, facial architecture, eye/nose/mouth/jaw proportions, cheek mass, neck/shoulder proportion, skin tone, hairline/hairstyle, height impression, body build, posture line, action silhouette, expression, camera angle, hand gesture, and tool interaction.

For masculine slots, render an adult man or clearly masculine adult worker, not a pretty young woman, tomboy heroine, soft idol face, or feminine face under masculine clothing. For androgynous slots, render a genuinely androgynous adult worker with mixed facial/body cues. For feminine slots, keep the worker professional and visually appealing, but avoid repeated waifu / idol heroine / doll-face / front-facing beauty-pose templates.

Avoid for R7 character diversity:

```text
all-female cast, same cute girl, same beautiful young woman, waifu,
bishoujo heroine, idol heroine, anime idol face, generic anime girl,
default pretty heroine, repeated female protagonist, copy of previous heroine,
identical pretty face with different PPE, only outfit changed,
only background changed, glamour model pose, beauty portrait pose,
fashion catalogue pose, pin-up stance, repeated smile,
repeated calm cute expression, tomboy girl replacing adult man,
feminine face in masculine slot, feminine face in androgynous slot,
soft idol face in masculine slot, soft waifu face in androgynous slot,
same face, repeated face template, identical anime heroine face, doll face,
copy-pasted face, identical facial proportions, same eye shape, same nose,
same jawline, same mouth shape, identical hairstyle,
identical body silhouette, identical neutral confident stance,
repeated front-facing pose, repeated three-quarter pin-up pose,
idol pin-up pose, fashion model pose
```

Engineering background constraints remain unchanged: every readable offshore wind turbine rotor must be a plausible three-bladed horizontal-axis turbine with one centered hub, 120-degree blade spacing, continuous blade geometry, and hub/nacelle/tower/foundation alignment.

## R6 Workforce Diversity Anti-Waifu Update

Revision: `OWM-P01-R6-WORKFORCE-DIVERSITY-ANTI-WAIFU`

Applies to pending and future P01 Source Art generations. Already generated R3/R4/R5 artwork remains unchanged unless explicitly regenerated.

R6 addresses the observed failure mode where the model keeps producing attractive young female protagonists with similar faces and poses, while changing only PPE and background.

Each new 10-character pending batch must read as a real offshore-wind workforce ensemble:

- at least 4 adult men or clearly masculine adult professionals;
- at least 2 genuinely androgynous adult professionals;
- no more than 4 feminine adult professionals;
- at least 8 visible age impressions;
- at least 3 mature-adult impressions.

For masculine slots, explicitly render an adult man or clearly masculine adult worker, not a pretty young woman or tomboy heroine. For androgynous slots, explicitly avoid collapse into a default feminine anime face. For feminine slots, keep the character professional and appealing but avoid the repeated waifu / idol heroine / doll-face template.

Avoid for R6 character diversity:

```text
all-female cast, same cute girl, same beautiful young woman, waifu,
bishoujo heroine, idol heroine, anime idol face, generic anime girl,
default pretty heroine, repeated female protagonist,
tomboy girl replacing adult man, feminine face in masculine slot,
feminine face in androgynous slot, same face, repeated face template,
identical anime heroine face, doll face, copy-pasted face,
identical facial proportions, same eye shape, same nose, same jawline,
same mouth shape, identical hairstyle, identical body silhouette,
identical neutral confident stance, repeated front-facing pose,
repeated three-quarter pin-up pose, idol pin-up pose, fashion model pose
```

Engineering background constraints remain unchanged: every readable offshore wind turbine rotor must be a plausible three-bladed horizontal-axis turbine with one centered hub, 120-degree blade spacing, continuous blade geometry, and hub/nacelle/tower/foundation alignment.

## R5 Anti-Clone Diversity Update

Revision: `OWM-P01-R5-ANTI-CLONE-DIVERSITY-ENGINEERING`

Applies to pending and future P01 Source Art generations. Already generated R3 artwork remains unchanged unless explicitly regenerated.

Character direction is no longer locked to female-presenting characters, and must actively avoid clone-like repetition. Each new 10-character batch should include:

- at least 3 male or masculine-presenting adult professionals;
- at least 2 androgynous or gender-neutral adult professionals;
- no more than 5 female or feminine-presenting professionals.

Variation must be visible in more than clothing or background. Vary face shape, facial proportions, nose/eye/jaw details, skin tone, hairstyle, age impression, body type, pose silhouette, expression, camera angle, hand gesture, and tool handling.

Each pending/future character must carry a unique anti-clone diversity signature. Repeating the same slot profile across batches is invalid even if the job title, clothing, or background changes.

Avoid for character diversity:

```text
same face, repeated face template, identical facial proportions,
identical anime heroine face, same pretty young woman, doll face,
copy-pasted face, same eye shape, same nose, same jawline, same mouth shape,
identical hairstyle, identical neutral confident stance,
identical body silhouette, repeated front-facing pose,
repeated three-quarter pin-up pose, idol pin-up pose, fashion model pose,
child, minor, teenage schoolgirl, school uniform,
childlike body, infantilized face, sexualized character,
revealing PPE, fashion outfit replacing safety equipment
```

Engineering background constraints remain unchanged: every readable offshore wind turbine rotor must be a plausible three-bladed horizontal-axis turbine with one centered hub, 120-degree blade spacing, straight/continuous blade geometry, and hub/nacelle/tower/foundation alignment.

版本：`OWM-P01-R3-FEMALE-ENGINEERING`

## 角色方向

主角固定為原創成年女性：可愛、親和但具專業可信度，使用自然成年臉部與身體比例，PPE 必須符合職務且不性感化。排除男性、未成年、學生制服、幼兒化比例、暴露式 PPE 與 pin-up pose。

## 必要正向約束

每座可見離岸風機都必須是現代三葉片水平軸風力機（three-bladed horizontal-axis wind turbine）。完整 rotor 必須恰好三支葉片、連接同一個置中的 hub，約 120° 等間距；葉片長度、taper、blade root、透視與曲率必須一致且結構合理。Nacelle、tower、foundation、ladder 與 access platform 必須構成單一合理結構。

若背景 rotor 會被嚴重遮擋或裁切，寧可不畫該風機，不要生成不完整或猜測式幾何。

## 共用負面提示詞

```text
two-bladed wind turbine, four-bladed wind turbine, five-bladed wind turbine,
extra turbine blade, missing turbine blade, duplicate turbine blade,
fused blades, branching blade, forked blade, partially formed rotor,
asymmetric rotor, uneven blade spacing, off-center hub,
detached blade, floating blade, broken blade, bent blade, kinked blade,
warped blade, twisted blade, melted blade, rubber-like blade,
inconsistent blade length, malformed blade root,
blade passing through hub, blade intersecting nacelle,
blade intersecting tower, blade intersecting platform,
blade intersecting character, blades intersecting each other,
overlapping turbines, malformed nacelle, duplicate nacelle,
duplicated tower, split tower, leaning tower, floating turbine,
impossible offshore foundation, impossible ladder,
impossible access platform, inconsistent turbine scale,
impossible perspective, turbine growing out of another structure
```

## Engineering QA

1. 每個完整 rotor 恰好三支葉片。
2. 葉片約 120° 等間距，hub 置中。
3. 葉片不得彎折、分叉、融合、重複或 blade root 錯接。
4. 葉片不得穿過 tower、nacelle、platform、角色或其他葉片。
5. Nacelle、tower、foundation、ladder、platform 結構合理。
6. 前景與背景風機的尺度及透視一致。
