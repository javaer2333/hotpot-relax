/* =========================================================
   解压火锅店 · 食材数据
   当前游戏使用 assets/ingredients/ 下的透明 PNG；
   下方内联 SVG 食材绘制保留，作为缺图时的兜底。
   ========================================================= */
(function () {
  'use strict';

  const EASE = 'stroke-linecap="round" stroke-linejoin="round"';

  function lg(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
      .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`)
      .join('')}</linearGradient>`;
  }

  function rg(id, stops, cx = 0.38, cy = 0.32, r = 0.75) {
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
      .map(([offset, color, opacity = 1]) => `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`)
      .join('')}</radialGradient>`;
  }

  function svg(inner, extraClass = '') {
    return `<svg viewBox="0 0 100 100" class="food-svg ${extraClass}" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  }

  /* ---------------------------------------------------------
     1. 螃蟹
     --------------------------------------------------------- */
  function crab(uid) {
    const shell = `crab-shell-${uid}`;
    const shellDark = `crab-shell-dark-${uid}`;
    const claw = `crab-claw-${uid}`;
    const legPath = (d) =>
      `<path d="${d}" fill="none" stroke="#742711" stroke-width="10"/><path d="${d}" fill="none" stroke="url(#${shell})" stroke-width="6.2"/><path d="${d}" fill="none" stroke="#ffc160" stroke-width="1.2" opacity=".55"/>`;
    return svg(`
      <defs>
        ${rg(shell, [['0%', '#ffb452'], ['48%', '#f4762f'], ['100%', '#bf3d12']])}
        ${lg(shellDark, [['0%', '#d8531d'], ['100%', '#8e2a0f']])}
        ${lg(claw, [['0%', '#ffc15c'], ['55%', '#f47730'], ['100%', '#c74815']])}
      </defs>
      <g ${EASE}>
        <path d="M36 49 C25 45 20 37 12 36 C8 35 7 40 11 42 C19 47 24 54 33 58" fill="none" stroke="#7a2b11" stroke-width="10"/>
        <path d="M36 49 C25 45 20 37 12 36 C8 35 7 40 11 42 C19 47 24 54 33 58" fill="none" stroke="url(#${shell})" stroke-width="6.4"/>
        <path d="M35 58 C25 57 18 63 11 61 C6 60 6 66 10 67 C18 69 27 68 37 64" fill="none" stroke="#7a2b11" stroke-width="10"/>
        <path d="M35 58 C25 57 18 63 11 61 C6 60 6 66 10 67 C18 69 27 68 37 64" fill="none" stroke="url(#${shell})" stroke-width="6.2"/>
        <path d="M39 66 C32 72 26 78 18 81 C13 83 16 88 21 85 C29 81 37 76 43 70" fill="none" stroke="#7a2b11" stroke-width="9.5"/>
        <path d="M39 66 C32 72 26 78 18 81 C13 83 16 88 21 85 C29 81 37 76 43 70" fill="none" stroke="url(#${shell})" stroke-width="5.8"/>
        ${legPath('M64 49 C75 45 80 37 88 36 C92 35 93 40 89 42 C81 47 76 54 67 58')}
        ${legPath('M65 58 C75 57 82 63 89 61 C94 60 94 66 90 67 C82 69 73 68 63 64')}
        ${legPath('M61 66 C68 72 74 78 82 81 C87 83 84 88 79 85 C71 81 63 76 57 70')}
        <g transform="translate(19 31) rotate(-28)">
          <path d="M-3 4 C-14 0 -18 -10 -12 -15 C-7 -19 0 -14 2 -7 C-4 -10 -9 -9 -10 -4 C-10 1 -6 3 -1 3 Z" fill="url(#${claw})" stroke="#792b13" stroke-width="2.4"/>
          <ellipse cx="3" cy="-4" rx="10.5" ry="7.5" transform="rotate(-22)" fill="url(#${claw})" stroke="#792b13" stroke-width="2.4"/>
          <path d="M-5 -8 C0 -12 5 -10 7 -5" fill="none" stroke="#ffd98c" stroke-width="2" opacity=".65"/>
        </g>
        <g transform="translate(81 31) rotate(28) scale(-1 1)">
          <path d="M-3 4 C-14 0 -18 -10 -12 -15 C-7 -19 0 -14 2 -7 C-4 -10 -9 -9 -10 -4 C-10 1 -6 3 -1 3 Z" fill="url(#${claw})" stroke="#792b13" stroke-width="2.4"/>
          <ellipse cx="3" cy="-4" rx="10.5" ry="7.5" transform="rotate(-22)" fill="url(#${claw})" stroke="#792b13" stroke-width="2.4"/>
          <path d="M-5 -8 C0 -12 5 -10 7 -5" fill="none" stroke="#ffd98c" stroke-width="2" opacity=".65"/>
        </g>
        <g transform="rotate(-7 50 56)">
          <ellipse cx="50" cy="56" rx="29" ry="22.5" fill="url(#${shell})" stroke="#782a12" stroke-width="2.8"/>
          <path d="M25 51 C35 47 44 48 50 56 C57 47 67 47 76 51 C71 64 62 72 50 73 C37 72 29 64 25 51Z" fill="url(#${shellDark})" opacity=".72"/>
          <path d="M50 34 C51 46 51 60 50 77" fill="none" stroke="#f4a34b" stroke-width="2.2" opacity=".55"/>
          <path d="M31 45 C36 49 40 51 44 55 M69 45 C64 49 60 51 56 55" fill="none" stroke="#ffc769" stroke-width="2" opacity=".72"/>
          <path d="M34 38 C40 35 48 34 53 35 C47 39 41 42 36 46" fill="none" stroke="#ffdda0" stroke-width="3" opacity=".48"/>
          <ellipse cx="45" cy="63" rx="12" ry="5.5" fill="#ffc861" opacity=".55"/>
          <path d="M43 68 C47 65 53 65 57 68" fill="none" stroke="#f1a04f" stroke-width="1.5" opacity=".85"/>
          <ellipse cx="39" cy="39" rx="2.2" ry="2.8" fill="#68230f"/>
          <ellipse cx="61" cy="39" rx="2.2" ry="2.8" fill="#68230f"/>
          <ellipse cx="38.4" cy="38.2" rx=".7" ry=".9" fill="#ffe6b0" opacity=".8"/>
          <ellipse cx="60.4" cy="38.2" rx=".7" ry=".9" fill="#ffe6b0" opacity=".8"/>
          <path d="M30 52 C36 49 43 52 47 58" fill="none" stroke="#ffe2a7" stroke-width="2.5" opacity=".35"/>
          <path d="M63 69 C70 66 74 61 76 55" fill="none" stroke="#7e250d" stroke-width="1.4" opacity=".48"/>
          <circle cx="56" cy="48" r="1.5" fill="#ffd274" opacity=".8"/>
          <circle cx="66" cy="58" r="1.1" fill="#ffd274" opacity=".7"/>
        </g>
        <path d="M76 24 C83 18 90 20 91 26" fill="none" stroke="#ffdda0" stroke-width="1.4" opacity=".4"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     2. 鱼豆腐
     --------------------------------------------------------- */
  function fishTofu(uid) {
    const body = `tofu-body-${uid}`;
    const back = `tofu-back-${uid}`;
    const cut = `tofu-cut-${uid}`;
    return svg(`
      <defs>
        ${lg(body, [['0%', '#ffe6a6'], ['22%', '#f3c66c'], ['58%', '#dea044'], ['100%', '#b87024']], 0.1, 0, 0.8, 1)}
        ${lg(back, [['0%', '#eab358'], ['100%', '#b87429']])}
        ${lg(cut, [['0%', '#ffefbb'], ['100%', '#e8b557']])}
      </defs>
      <g transform="rotate(-12 50 51)" ${EASE}>
        <g transform="translate(7 -9)">
          <rect x="40" y="20" width="43" height="43" rx="9" fill="url(#${back})" stroke="#6d3b15" stroke-width="2.3"/>
          <path d="M40 29 Q40 20 49 20 H74 Q83 20 83 29 L83 32 H40 Z" fill="#f8d887" opacity=".9"/>
          <path d="M46 55 L58 34 M59 63 L74 31" stroke="#9f5e20" stroke-width="3" opacity=".34"/>
        </g>
        <g>
          <rect x="22" y="32" width="49" height="49" rx="9" fill="url(#${body})" stroke="#6d3b15" stroke-width="2.6"/>
          <path d="M22 42 Q22 32 32 32 H61 Q71 32 71 42 V47 H22 Z" fill="url(#${cut})" opacity=".95"/>
          <path d="M22 72 Q25 81 33 81 H61 Q69 81 71 72 Z" fill="#ad641e" opacity=".35"/>
          <path d="M29 66 L43 39 M46 77 L65 38" fill="none" stroke="#9f5a1c" stroke-width="3.8" opacity=".31"/>
          <path d="M29 49 C34 46 39 47 43 51" fill="none" stroke="#fff3c9" stroke-width="2.4" opacity=".62"/>
          <path d="M57 73 C63 69 67 65 69 60" fill="none" stroke="#ffefbe" stroke-width="2" opacity=".42"/>
          <path d="M26 77 Q34 84 46 82" fill="none" stroke="#f1bd67" stroke-width="1.7" opacity=".55"/>
          <circle cx="34" cy="72" r="1.2" fill="#8f501d" opacity=".55"/>
          <circle cx="62" cy="47" r="1.5" fill="#9e5c20" opacity=".4"/>
          <circle cx="51" cy="63" r="1" fill="#a66225" opacity=".45"/>
        </g>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     3. 红枣
     --------------------------------------------------------- */
  function redDate(uid) {
    const skin = `date-skin-${uid}`;
    const shade = `date-shade-${uid}`;
    return svg(`
      <defs>
        ${rg(skin, [['0%', '#c43b2e'], ['42%', '#981f1a'], ['100%', '#5d0e0d']], 0.35, 0.28, 0.78)}
        ${lg(shade, [['0%', '#7a1411'], ['100%', '#480806']])}
      </defs>
      <g transform="rotate(-22 50 50)" ${EASE}>
        <path d="M50 12 C65 13 80 27 82 44 C85 63 74 81 55 87 C38 92 22 79 19 61 C15 40 30 16 50 12Z" fill="url(#${skin})" stroke="#4f0c09" stroke-width="2.5"/>
        <path d="M61 20 C75 28 83 45 78 61 C75 72 68 80 57 85 C71 81 82 67 82 51 C82 34 74 23 61 20Z" fill="#4e0a08" opacity=".47"/>
        <path d="M32 27 C41 20 52 18 61 22" fill="none" stroke="#f3b19e" stroke-width="4.2" opacity=".43"/>
        <path d="M30 36 C35 31 41 30 46 32" fill="none" stroke="#ffd1b7" stroke-width="1.8" opacity=".36"/>
        <path d="M34 52 C43 57 53 62 66 64 M30 66 C40 70 50 73 61 78 M55 36 C60 43 64 48 67 54" fill="none" stroke="#67110d" stroke-width="1.5" opacity=".65"/>
        <path d="M72 56 C77 60 78 68 73 73" fill="none" stroke="#d46b53" stroke-width="1.3" opacity=".35"/>
        <path d="M51 13 C51 8 54 5 58 4" fill="none" stroke="#6e411d" stroke-width="3.1"/>
        <path d="M50 14 C44 11 41 13 39 17" fill="none" stroke="#7b4b24" stroke-width="1.7" opacity=".85"/>
        <ellipse cx="42" cy="39" rx="5" ry="2.8" fill="#ffd4c0" opacity=".22" transform="rotate(-35 42 39)"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     4. 姜片
     --------------------------------------------------------- */
  function ginger(uid) {
    const gingerG = `ginger-${uid}`;
    const gingerBack = `ginger-back-${uid}`;
    return svg(`
      <defs>
        ${rg(gingerG, [['0%', '#fff2bb'], ['46%', '#f7dc88'], ['100%', '#deb052']], 0.4, 0.3, 0.82)}
        ${lg(gingerBack, [['0%', '#e6c474'], ['100%', '#c1933c']])}
      </defs>
      <g transform="rotate(-17 50 51)" ${EASE}>
        <g transform="translate(9 -7) rotate(20 50 50)">
          <path d="M25 53 C23 40 34 30 47 33 C56 25 72 32 74 43 C84 51 79 64 68 68 C61 79 43 79 35 70 C24 69 19 61 25 53Z" fill="url(#${gingerBack})" stroke="#9d7028" stroke-width="2.2" opacity=".88"/>
          <path d="M35 43 C42 38 52 38 59 43 C66 48 63 58 55 62 C46 66 35 59 33 51" fill="none" stroke="#d4a94e" stroke-width="1.6" opacity=".8"/>
        </g>
        <path d="M22 50 C21 37 33 27 47 30 C57 21 74 29 76 41 C85 50 81 63 70 68 C64 80 45 81 35 72 C23 70 17 60 22 50Z" fill="url(#${gingerG})" stroke="#a8782b" stroke-width="2.4"/>
        <path d="M32 42 C41 36 52 37 60 43 C68 49 65 59 56 64 C47 68 35 62 31 54 C30 50 30 46 32 42Z" fill="none" stroke="#dfb456" stroke-width="1.7" opacity=".88"/>
        <path d="M40 40 C47 37 55 38 60 43 C63 46 62 51 58 55" fill="none" stroke="#fff4c7" stroke-width="2.4" opacity=".5"/>
        <path d="M30 35 C37 29 47 27 56 30" fill="none" stroke="#fff8d8" stroke-width="2.8" opacity=".52"/>
        <path d="M36 68 C44 72 53 72 61 67" fill="none" stroke="#f9e4a3" stroke-width="1.4" opacity=".42"/>
        <path d="M43 47 C47 50 48 55 46 59 M53 45 C57 49 59 53 57 58" fill="none" stroke="#e8c16a" stroke-width="1.1" opacity=".58"/>
        <path d="M25 59 C27 64 31 67 36 69" fill="none" stroke="#b68a3b" stroke-width="1.2" opacity=".55"/>
        <ellipse cx="40" cy="47" rx="5" ry="2.2" transform="rotate(-30 40 47)" fill="#fff9d8" opacity=".28"/>
        <circle cx="58" cy="57" r="1" fill="#b98936" opacity=".5"/>
        <circle cx="47" cy="63" r=".7" fill="#b98936" opacity=".4"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     5. 鸡蛋
     --------------------------------------------------------- */
  function egg(uid) {
    const white = `egg-white-${uid}`;
    const yolk = `egg-yolk-${uid}`;
    return svg(`
      <defs>
        ${rg(white, [['0%', '#fffdf0'], ['55%', '#f5ead4'], ['100%', '#d6bf9b']], 0.34, 0.25, 0.82)}
        ${rg(yolk, [['0%', '#ffd96b'], ['48%', '#f6b52d'], ['100%', '#d78413']], 0.36, 0.3, 0.78)}
      </defs>
      <g transform="rotate(-8 50 52)" ${EASE}>
        <path d="M50 17 C68 17 80 33 79 52 C78 72 66 85 50 85 C34 85 21 73 20 53 C19 34 32 17 50 17Z" fill="url(#${white})" stroke="#aa8762" stroke-width="2.3"/>
        <path d="M28 45 C29 31 39 23 51 23 C62 23 70 30 73 41 C67 35 58 31 49 33 C40 35 34 41 32 50 Z" fill="#fffef6" opacity=".72"/>
        <path d="M23 62 C27 73 37 81 49 81 C61 81 72 72 76 61 C70 71 61 76 50 76 C38 76 29 70 23 62Z" fill="#c5ac88" opacity=".27"/>
        <ellipse cx="50" cy="53" rx="21" ry="20" fill="#f4c15d" opacity=".4"/>
        <circle cx="50" cy="51" r="18.2" fill="url(#${yolk})"/>
        <circle cx="50" cy="51" r="18.2" fill="none" stroke="#d69020" stroke-width="1.4" opacity=".8"/>
        <ellipse cx="42" cy="44" rx="6.6" ry="4" transform="rotate(-28 42 44)" fill="#fff4bf" opacity=".44"/>
        <path d="M46 64 C51 67 58 65 62 60" fill="none" stroke="#db8b17" stroke-width="1.7" opacity=".45"/>
        <path d="M68 67 C74 63 77 57 77 50" fill="none" stroke="#f8e8c8" stroke-width="2.5" opacity=".38"/>
        <circle cx="35" cy="59" r="1.3" fill="#b99b73" opacity=".32"/>
        <circle cx="64" cy="39" r=".9" fill="#b99b73" opacity=".3"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     6. 午餐肉
     --------------------------------------------------------- */
  function luncheon(uid) {
    const top = `spam-top-${uid}`;
    const side = `spam-side-${uid}`;
    const clip = `spam-clip-${uid}`;
    return svg(`
      <defs>
        ${lg(top, [['0%', '#ffc6b8'], ['52%', '#eea195'], ['100%', '#ce766d']], 0, 0, 0.75, 1)}
        ${lg(side, [['0%', '#bd665e'], ['100%', '#93423f']])}
        <clipPath id="${clip}"><rect x="17" y="24" width="66" height="47" rx="8"/></clipPath>
      </defs>
      <g transform="rotate(-11 50 52)" ${EASE}>
        <path d="M17 58 L83 58 L78 75 Q77 79 72 79 L27 79 Q22 79 21 75 Z" fill="url(#${side})" stroke="#7d3735" stroke-width="2.2"/>
        <rect x="17" y="24" width="66" height="47" rx="8" fill="url(#${top})" stroke="#7d3735" stroke-width="2.5"/>
        <g clip-path="url(#${clip})">
          <path d="M17 31 Q17 24 25 24 H75 Q83 24 83 31 V35 H17 Z" fill="#ffd9cf" opacity=".55"/>
          <path d="M17 62 Q35 66 53 62 T83 61 V71 H17 Z" fill="#b85b58" opacity=".16"/>
          <ellipse cx="31" cy="42" rx="2.3" ry="1.5" fill="#b35a58" opacity=".48" transform="rotate(-20 31 42)"/>
          <ellipse cx="48" cy="36" rx="1.6" ry="1.1" fill="#b35a58" opacity=".4"/>
          <ellipse cx="63" cy="47" rx="2.2" ry="1.5" fill="#b35a58" opacity=".46" transform="rotate(15 63 47)"/>
          <ellipse cx="42" cy="57" rx="2.7" ry="1.5" fill="#b75d59" opacity=".4" transform="rotate(-9 42 57)"/>
          <ellipse cx="72" cy="61" rx="1.7" ry="1.1" fill="#b75d59" opacity=".4"/>
          <ellipse cx="55" cy="51" rx="1.4" ry=".9" fill="#b75d59" opacity=".35"/>
          <path d="M28 31 C37 27 52 27 61 32" fill="none" stroke="#fff2e6" stroke-width="3.1" opacity=".4"/>
          <path d="M73 42 L82 40" stroke="#d98580" stroke-width="2" opacity=".45"/>
        </g>
        <path d="M22 77 Q47 82 76 77" fill="none" stroke="#f4b2a4" stroke-width="1.4" opacity=".38"/>
        <path d="M19 72 Q20 78 27 79" fill="none" stroke="#d9978a" stroke-width="1.2" opacity=".35"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     7. 鸡排
     --------------------------------------------------------- */
  function chicken(uid) {
    const meat = `chicken-meat-${uid}`;
    const crumb = `chicken-crumb-${uid}`;
    return svg(`
      <defs>
        ${rg(meat, [['0%', '#ffe2a0'], ['34%', '#efb957'], ['74%', '#d48d2f'], ['100%', '#a85b19']], 0.38, 0.28, 0.85)}
        ${lg(crumb, [['0%', '#fff0b7'], ['100%', '#e5ad53']])}
      </defs>
      <g transform="rotate(8 50 50)" ${EASE}>
        <path d="M22 38 C26 22 43 14 57 18 C69 13 85 24 83 40 C91 51 83 65 72 68 C69 82 53 88 42 80 C27 86 14 72 19 59 C8 51 12 43 22 38Z" fill="url(#${meat})" stroke="#7a4616" stroke-width="2.7"/>
        <path d="M22 38 C26 22 43 14 57 18 C69 13 85 24 83 40 C91 51 83 65 72 68 C69 82 53 88 42 80 C27 86 14 72 19 59 C8 51 12 43 22 38Z" fill="none" stroke="#ffdb8f" stroke-width="1.2" opacity=".35"/>
        <path d="M26 43 C34 32 49 27 63 31 M30 64 C41 72 57 71 68 63" fill="none" stroke="#ba7325" stroke-width="2.2" opacity=".38"/>
        <path d="M29 34 C36 28 47 25 56 27" fill="none" stroke="#fff0c0" stroke-width="3.4" opacity=".4"/>
        <ellipse cx="35" cy="47" rx="3.2" ry="2.2" fill="url(#${crumb})" opacity=".68" transform="rotate(-21 35 47)"/>
        <ellipse cx="56" cy="38" rx="2.5" ry="1.7" fill="url(#${crumb})" opacity=".64" transform="rotate(16 56 38)"/>
        <ellipse cx="68" cy="49" rx="3" ry="2" fill="url(#${crumb})" opacity=".55" transform="rotate(-8 68 49)"/>
        <ellipse cx="44" cy="58" rx="2.6" ry="1.7" fill="url(#${crumb})" opacity=".57" transform="rotate(24 44 58)"/>
        <ellipse cx="59" cy="66" rx="2.1" ry="1.4" fill="url(#${crumb})" opacity=".56"/>
        <ellipse cx="29" cy="61" rx="2.2" ry="1.4" fill="url(#${crumb})" opacity=".45"/>
        <ellipse cx="48" cy="71" rx="1.7" ry="1.1" fill="url(#${crumb})" opacity=".48"/>
        <ellipse cx="72" cy="38" rx="1.5" ry="1" fill="url(#${crumb})" opacity=".5"/>
        <path d="M30 75 C42 82 56 82 67 75" fill="none" stroke="#8e4e17" stroke-width="1.5" opacity=".36"/>
        <circle cx="51" cy="47" r="1.1" fill="#9d5b1d" opacity=".35"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     8. 黄豆芽
     --------------------------------------------------------- */
  function sprouts(uid) {
    const bean = `sprout-bean-${uid}`;
    const stem = `sprout-stem-${uid}`;
    return svg(`
      <defs>
        ${rg(bean, [['0%', '#fff7cc'], ['58%', '#f0d47c'], ['100%', '#cfa63d']], 0.35, 0.3, 0.8)}
        ${lg(stem, [['0%', '#fffdf0'], ['60%', '#f4eccb'], ['100%', '#d7c894']])}
      </defs>
      <g transform="rotate(-9 50 50)" ${EASE}>
        <path d="M48 84 C45 73 49 60 55 49 C58 42 59 35 57 27" fill="none" stroke="#a9834e" stroke-width="5.7"/>
        <path d="M48 84 C45 73 49 60 55 49 C58 42 59 35 57 27" fill="none" stroke="url(#${stem})" stroke-width="3.8"/>
        <path d="M63 85 C60 75 63 64 68 56 C73 48 76 40 75 32" fill="none" stroke="#a9834e" stroke-width="5.4"/>
        <path d="M63 85 C60 75 63 64 68 56 C73 48 76 40 75 32" fill="none" stroke="url(#${stem})" stroke-width="3.5"/>
        <path d="M33 82 C34 70 38 60 45 51 C49 46 52 39 52 33" fill="none" stroke="#a9834e" stroke-width="5"/>
        <path d="M33 82 C34 70 38 60 45 51 C49 46 52 39 52 33" fill="none" stroke="url(#${stem})" stroke-width="3.2"/>
        <g transform="rotate(18 57 25)">
          <ellipse cx="57" cy="25" rx="9.2" ry="11" fill="url(#${bean})" stroke="#9d792d" stroke-width="2"/>
          <path d="M51 23 C53 19 57 17 61 19" fill="none" stroke="#fffbe1" stroke-width="2.2" opacity=".8"/>
          <path d="M55 30 C56 26 58 23 61 22" fill="none" stroke="#c8a449" stroke-width="1.2" opacity=".5"/>
        </g>
        <g transform="rotate(-14 76 29)">
          <ellipse cx="76" cy="29" rx="8.1" ry="9.8" fill="url(#${bean})" stroke="#9d792d" stroke-width="1.9"/>
          <path d="M71 27 C73 23 77 22 80 24" fill="none" stroke="#fffbe1" stroke-width="2" opacity=".75"/>
        </g>
        <ellipse cx="51" cy="33" rx="6.5" ry="8" transform="rotate(25 51 33)" fill="url(#${bean})" stroke="#9d792d" stroke-width="1.8"/>
        <path d="M48 31 C49 27 52 25 56 26" fill="none" stroke="#fffbe1" stroke-width="1.8" opacity=".7"/>
        <path d="M42 81 C37 83 33 82 29 78 M61 82 C65 85 69 85 73 82 M34 81 C29 84 25 83 22 80" fill="none" stroke="#c9b389" stroke-width="1.1" opacity=".7"/>
        <path d="M78 31 C81 27 82 23 81 19" fill="none" stroke="#c8a44d" stroke-width="1.4" opacity=".6"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     9. 鱼片
     --------------------------------------------------------- */
  function fishSlice(uid) {
    const flesh = `fish-flesh-${uid}`;
    const rim = `fish-rim-${uid}`;
    return svg(`
      <defs>
        ${lg(flesh, [['0%', '#fffaf0'], ['46%', '#f7e6d2'], ['100%', '#e3bfae']], 0.2, 0, 0.75, 1)}
        ${lg(rim, [['0%', '#f6c7b7'], ['100%', '#d69085']])}
      </defs>
      <g transform="rotate(-12 50 50)" ${EASE}>
        <path d="M14 42 C22 25 44 15 62 22 C79 28 84 45 78 58 C72 73 57 83 42 79 C29 76 29 65 21 58 C15 53 11 49 14 42Z" fill="url(#${flesh})" stroke="#b57e6e" stroke-width="2.3"/>
        <path d="M16 41 C25 24 45 17 61 23 C76 29 80 43 75 55 C68 72 54 78 42 75 C33 73 32 64 25 57 C19 51 13 48 16 41Z" fill="none" stroke="#fffdf5" stroke-width="2.3" opacity=".5"/>
        <path d="M17 41 C23 26 43 19 59 24 C69 27 76 34 78 43 C69 34 57 32 46 35 C33 39 25 47 21 57 C17 53 14 48 17 41Z" fill="url(#${rim})" opacity=".6"/>
        <path d="M29 48 C38 41 51 38 63 42 M23 57 C34 51 49 48 62 52 M31 67 C42 62 53 60 64 63" fill="none" stroke="#d9b3a2" stroke-width="1.6" opacity=".7"/>
        <path d="M33 34 C44 29 56 28 66 32" fill="none" stroke="#fffaf2" stroke-width="3" opacity=".64"/>
        <path d="M24 51 C29 45 36 42 43 42" fill="none" stroke="#ffffff" stroke-width="2.2" opacity=".55"/>
        <path d="M68 69 C73 64 76 58 76 51" fill="none" stroke="#b87b6d" stroke-width="1.2" opacity=".45"/>
        <path d="M25 71 C27 66 30 63 34 61" fill="none" stroke="#c28c7b" stroke-width="1" opacity=".35"/>
        <circle cx="57" cy="59" r="1.1" fill="#c79d91" opacity=".5"/>
        <circle cx="38" cy="55" r=".8" fill="#c79d91" opacity=".4"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     10. 虾
     --------------------------------------------------------- */
  function shrimp(uid) {
    const body = `shrimp-body-${uid}`;
    const belly = `shrimp-belly-${uid}`;
    return svg(`
      <defs>
        ${lg(body, [['0%', '#ffd18a'], ['30%', '#f89a4e'], ['70%', '#e56528'], ['100%', '#ac3711']], 0.2, 0, 0.8, 1)}
        ${lg(belly, [['0%', '#ffe3ab'], ['100%', '#f7b26a']])}
      </defs>
      <g transform="rotate(-5 50 50)" ${EASE}>
        <path d="M34 27 C22 37 20 55 30 68 C40 81 58 87 73 80 C81 76 84 69 80 65 C73 70 64 71 56 66 C45 59 39 47 43 36 C45 31 47 26 44 23 C40 20 37 23 34 27Z" fill="url(#${body})" stroke="#7d2e10" stroke-width="2.6"/>
        <path d="M29 38 C24 48 26 61 34 70 C43 80 58 82 69 77 C60 82 46 80 37 71 C28 61 26 48 31 37Z" fill="url(#${belly})" opacity=".46"/>
        <path d="M36 34 C47 30 51 42 48 51 M44 64 C54 68 63 70 70 69 M32 52 C39 58 46 63 54 65" fill="none" stroke="#8f3211" stroke-width="2.1" opacity=".62"/>
        <path d="M35 37 C43 34 46 40 45 46 M34 57 C42 62 49 66 57 68" fill="none" stroke="#ffd69b" stroke-width="1.4" opacity=".55"/>
        <path d="M43 25 C49 22 55 24 58 29 C59 34 55 39 49 39 C44 39 41 35 41 30 C41 28 42 26 43 25Z" fill="url(#${body})" stroke="#7d2e10" stroke-width="2.4"/>
        <circle cx="44.5" cy="28.5" r="2.3" fill="#3e160c"/>
        <circle cx="43.9" cy="27.9" r=".8" fill="#ffefd1"/>
        <path d="M41 22 C35 15 28 13 22 16 M45 21 C44 12 49 6 56 6" fill="none" stroke="#8f3c1a" stroke-width="1.3" opacity=".85"/>
        <path d="M24 17 C29 14 36 15 42 21" fill="none" stroke="#ffcf87" stroke-width="1" opacity=".45"/>
        <path d="M76 80 C82 83 88 82 91 77 C87 76 84 73 82 69 C79 73 77 77 76 80Z" fill="url(#${body})" stroke="#7d2e10" stroke-width="2"/>
        <path d="M78 77 C82 77 85 76 88 73" fill="none" stroke="#ffd398" stroke-width="1.2" opacity=".55"/>
        <path d="M60 79 C64 84 66 88 66 92 M67 78 C72 81 76 83 80 83 M53 81 C55 86 55 90 54 93" fill="none" stroke="#b45125" stroke-width="1.2" opacity=".72"/>
        <path d="M39 38 C40 46 44 54 51 60" fill="none" stroke="#ffddb0" stroke-width="2.8" opacity=".38"/>
        <ellipse cx="50" cy="51" rx="4.7" ry="2.1" transform="rotate(44 50 51)" fill="#ffb36a" opacity=".34"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     11. 排骨
     --------------------------------------------------------- */
  function ribs(uid) {
    const meat = `rib-meat-${uid}`;
    const glaze = `rib-glaze-${uid}`;
    const bone = `rib-bone-${uid}`;
    return svg(`
      <defs>
        ${lg(meat, [['0%', '#b85b33'], ['30%', '#8f3d22'], ['72%', '#6d2717'], ['100%', '#42140d']], 0.2, 0, 0.7, 1)}
        ${lg(glaze, [['0%', '#f1a564'], ['100%', '#bd5b2f']])}
        ${lg(bone, [['0%', '#fff0c9'], ['50%', '#e2c398'], ['100%', '#b18b5e']])}
      </defs>
      <g transform="rotate(-11 50 50)" ${EASE}>
        <path d="M15 35 Q19 24 32 24 L78 19 Q88 18 89 29 L90 61 Q90 74 78 76 L28 81 Q16 82 15 70 Z" fill="url(#${meat})" stroke="#3f160d" stroke-width="2.6"/>
        <path d="M19 32 Q25 18 40 20 L76 18 Q86 18 87 29 L82 32 Q74 29 66 30 L54 31 Q42 31 34 35 L24 41 Q18 42 17 37 Z" fill="url(#${glaze})" opacity=".48"/>
        <path d="M25 38 C36 34 45 36 49 42 C54 48 64 47 71 42 C77 38 84 40 85 47" fill="none" stroke="#e89b63" stroke-width="3.2" opacity=".34"/>
        <path d="M22 62 C35 58 45 60 53 66 C61 72 73 70 83 64" fill="none" stroke="#8e3f21" stroke-width="2" opacity=".5"/>
        <g opacity=".92">
          <path d="M31 29 C24 39 24 56 30 70 C33 76 40 78 44 72 C38 59 38 41 43 29 Z" fill="url(#${bone})" opacity=".9"/>
          <path d="M52 26 C45 39 46 55 51 71 C54 77 61 77 64 71 C58 56 59 39 65 27 Z" fill="url(#${bone})" opacity=".84"/>
          <path d="M73 24 C67 37 67 53 72 69 C75 75 81 74 83 68 C78 54 78 38 84 25 Z" fill="url(#${bone})" opacity=".8"/>
          <path d="M33 34 C30 44 30 56 33 65 M54 31 C49 43 50 55 54 66 M75 29 C71 41 71 53 75 64" fill="none" stroke="#fff3d7" stroke-width="1.2" opacity=".45"/>
        </g>
        <path d="M22 77 Q48 84 84 71" fill="none" stroke="#f0b478" stroke-width="1.5" opacity=".35"/>
        <path d="M17 42 C19 35 24 30 31 28" fill="none" stroke="#f7c08e" stroke-width="2.4" opacity=".4"/>
        <ellipse cx="32" cy="54" rx="2" ry="1.2" fill="#3e130b" opacity=".4" transform="rotate(15 32 54)"/>
        <ellipse cx="67" cy="52" rx="2.4" ry="1.3" fill="#3e130b" opacity=".36" transform="rotate(-8 67 52)"/>
        <path d="M62 44 C68 42 74 45 77 50" fill="none" stroke="#f7d09b" stroke-width="1.3" opacity=".3"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     12. 青花椒
     --------------------------------------------------------- */
  function pepper(uid) {
    const berry = `pepper-berry-${uid}`;
    const leaf = `pepper-leaf-${uid}`;
    const dots = [
      [39, 49, 5.5], [48, 43, 5.2], [57, 48, 5.4], [66, 41, 4.7],
      [47, 57, 4.6], [57, 58, 5], [68, 56, 4.6], [37, 62, 4.3],
      [61, 69, 4.3], [50, 72, 3.8], [73, 66, 3.4], [30, 43, 4]
    ];
    return svg(`
      <defs>
        ${rg(berry, [['0%', '#a9d56a'], ['52%', '#5c9f43'], ['100%', '#2d642b']], 0.35, 0.3, 0.78)}
        ${lg(leaf, [['0%', '#7aaa49'], ['100%', '#345f30']], 0, 0, 1, 1)}
      </defs>
      <g transform="rotate(13 50 50)" ${EASE}>
        <path d="M22 78 C30 65 45 51 78 27" fill="none" stroke="#6f4f29" stroke-width="2.7"/>
        <path d="M37 63 C29 57 26 48 30 40 C39 42 48 49 48 57 C46 61 42 63 37 63Z" fill="url(#${leaf})" stroke="#294d26" stroke-width="1.6"/>
        <path d="M51 49 C52 39 59 31 69 30 C72 39 68 49 59 54 C55 54 53 52 51 49Z" fill="url(#${leaf})" stroke="#294d26" stroke-width="1.6"/>
        <path d="M65 35 C68 27 75 23 81 24 C80 32 75 38 68 40Z" fill="url(#${leaf})" stroke="#294d26" stroke-width="1.4" opacity=".9"/>
        <path d="M34 51 C40 45 51 42 60 44 M55 34 C59 39 63 44 68 47" fill="none" stroke="#a7c875" stroke-width="1.1" opacity=".55"/>
        ${dots.map(([x, y, r], i) => `
          <g>
            <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${berry})" stroke="#284f25" stroke-width="1.25"/>
            <path d="M${x - r * 0.55} ${y - r * 0.4} Q${x - r * 0.2} ${y - r * 0.75} ${x + r * 0.25} ${y - r * 0.5}" fill="none" stroke="#d7efa5" stroke-width="${r > 4.8 ? 1.4 : 1}" opacity=".65"/>
            <circle cx="${x + r * 0.25}" cy="${y + r * 0.25}" r="${Math.max(0.55, r * 0.11)}" fill="#203d1e" opacity=".55"/>
            ${i % 3 === 0 ? `<path d="M${x - 1.2} ${y - r - 1} C${x} ${y - r - 4} ${x + 2} ${y - r - 4} ${x + 2.5} ${y - r - 2.3}" fill="none" stroke="#6d5130" stroke-width="1"/>` : ''}
          </g>`).join('')}
        <circle cx="43" cy="36" r="1.5" fill="#b7cf80" opacity=".5"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     13. 鸭血
     --------------------------------------------------------- */
  function bloodTofu(uid) {
    const top = `blood-top-${uid}`;
    const side = `blood-side-${uid}`;
    const clip = `blood-clip-${uid}`;
    return svg(`
      <defs>
        ${rg(top, [['0%', '#a24b45'], ['38%', '#782820'], ['100%', '#4d1411']], 0.32, 0.23, 0.82)}
        ${lg(side, [['0%', '#5e1a16'], ['100%', '#360c0a']])}
        <clipPath id="${clip}"><path d="M26 31 Q26 24 34 24 L72 29 Q80 30 80 38 L77 64 Q77 72 68 73 L33 77 Q25 77 25 68 Z"/></clipPath>
      </defs>
      <g transform="rotate(-9 50 52)" ${EASE}>
        <g transform="translate(4 -7)">
          <path d="M27 34 Q27 27 35 27 L69 20 Q77 20 78 28 L76 58 Q76 66 68 67 L38 72 Q30 73 29 64 Z" fill="url(#${side})" stroke="#350c09" stroke-width="2.1" opacity=".9"/>
          <path d="M27 34 Q32 30 40 31 L78 27 Q78 20 70 21 L35 26 Q27 27 27 34Z" fill="#a8564b" opacity=".32"/>
        </g>
        <path d="M26 31 Q26 24 34 24 L72 29 Q80 30 80 38 L77 64 Q77 72 68 73 L33 77 Q25 77 25 68 Z" fill="url(#${top})" stroke="#350c09" stroke-width="2.5"/>
        <g clip-path="url(#${clip})">
          <path d="M25 38 C36 34 52 38 63 34 C70 32 77 33 81 36 L80 41 C67 36 54 41 42 41 C34 41 28 42 25 44Z" fill="#c98375" opacity=".26"/>
          <path d="M30 65 C43 61 56 64 68 59 C73 57 77 58 78 61 L77 67 L62 70 L35 75Z" fill="#2e0a08" opacity=".33"/>
          <ellipse cx="40" cy="46" rx="2.3" ry="1" fill="#3b0c09" opacity=".4" transform="rotate(-10 40 46)"/>
          <ellipse cx="58" cy="50" rx="1.8" ry=".9" fill="#3b0c09" opacity=".36"/>
          <ellipse cx="50" cy="62" rx="2.7" ry="1.1" fill="#3b0c09" opacity=".32" transform="rotate(6 50 62)"/>
          <ellipse cx="67" cy="64" rx="1.6" ry=".8" fill="#3b0c09" opacity=".32"/>
          <ellipse cx="34" cy="58" rx="1.3" ry=".7" fill="#3b0c09" opacity=".3"/>
          <path d="M34 31 C42 28 54 31 62 29" fill="none" stroke="#d8998b" stroke-width="2.4" opacity=".38"/>
          <path d="M29 68 C37 64 46 65 53 67" fill="none" stroke="#bf7468" stroke-width="1.5" opacity=".23"/>
        </g>
        <path d="M75 36 C78 35 80 37 80 40" fill="none" stroke="#d18b7c" stroke-width="1.4" opacity=".38"/>
        <path d="M27 70 Q32 76 40 75" fill="none" stroke="#8b453b" stroke-width="1.2" opacity=".28"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     14. 带鱼
     --------------------------------------------------------- */
  function hairtail(uid) {
    const silver = `hairtail-silver-${uid}`;
    const fin = `hairtail-fin-${uid}`;
    return svg(`
      <defs>
        ${lg(silver, [['0%', '#f1f0df'], ['24%', '#cfd5cf'], ['48%', '#f7f2df'], ['67%', '#b6c3c3'], ['100%', '#7f9699']], 0, 0.1, 0.2, 0.9)}
        ${lg(fin, [['0%', '#d6d9c9'], ['100%', '#91a5a3']])}
      </defs>
      <g transform="rotate(-15 50 50)" ${EASE}>
        <path d="M15 42 C27 29 48 25 64 31 C78 36 84 26 89 20 C89 34 87 45 79 52 C69 63 49 68 33 66 C20 65 10 57 15 42Z" fill="url(#${silver})" stroke="#596b6d" stroke-width="2.4"/>
        <path d="M18 45 C30 33 45 30 61 34 C72 37 79 34 85 26" fill="none" stroke="#fffdf0" stroke-width="2.7" opacity=".65"/>
        <path d="M17 51 C30 56 47 57 63 53 C72 50 78 45 83 39" fill="none" stroke="#9aacae" stroke-width="2" opacity=".62"/>
        <path d="M20 56 C32 62 48 63 61 59" fill="none" stroke="#edf0e4" stroke-width="1.8" opacity=".5"/>
        <path d="M26 33 C24 25 28 20 34 19 C36 25 34 31 31 35Z" fill="url(#${fin})" stroke="#596b6d" stroke-width="1.5"/>
        <path d="M45 29 C47 23 51 19 57 18 C57 24 55 28 51 31Z" fill="url(#${fin})" stroke="#596b6d" stroke-width="1.4"/>
        <path d="M22 57 C20 64 22 69 27 72 C31 66 32 62 31 58Z" fill="url(#${fin})" stroke="#596b6d" stroke-width="1.4"/>
        <path d="M24 42 C30 46 31 53 27 57 C20 53 18 47 24 42Z" fill="#c6d2cf" stroke="#596b6d" stroke-width="1.5"/>
        <circle cx="23.5" cy="43.5" r="2.4" fill="#28302f"/>
        <circle cx="22.8" cy="42.8" r=".8" fill="#f3f2df"/>
        <path d="M16 47 C13 48 11 50 10 52" fill="none" stroke="#637776" stroke-width="1.4"/>
        <path d="M35 36 C39 42 42 49 43 56 M52 33 C53 40 53 47 52 53 M67 34 C65 41 64 47 64 52" fill="none" stroke="#899b9b" stroke-width="1.3" opacity=".55"/>
        <path d="M41 40 C49 38 58 38 66 41 C60 45 51 46 43 46Z" fill="#efc4c4" opacity=".22"/>
        <path d="M32 61 C44 64 55 61 64 57" fill="none" stroke="#f8f5e5" stroke-width="1.2" opacity=".4"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     15. 响铃卷
     --------------------------------------------------------- */
  function friedRoll(uid) {
    const roll = `roll-gold-${uid}`;
    const rollDark = `roll-dark-${uid}`;
    const spiral = `roll-spiral-${uid}`;
    return svg(`
      <defs>
        ${lg(roll, [['0%', '#ffe7a0'], ['35%', '#eab74f'], ['75%', '#c17f24'], ['100%', '#8e5314']], 0, 0, 0.65, 1)}
        ${lg(rollDark, [['0%', '#d89c39'], ['100%', '#9d5d17']])}
        ${rg(spiral, [['0%', '#f4d78a'], ['100%', '#d6973b']], 0.45, 0.4, 0.7)}
      </defs>
      <g transform="rotate(-16 50 50)" ${EASE}>
        <g transform="translate(-4 -8) rotate(-2 50 50)" opacity=".92">
          <rect x="20" y="28" width="56" height="27" rx="13.5" fill="url(#${rollDark})" stroke="#67370d" stroke-width="2.2"/>
          <ellipse cx="75" cy="41.5" rx="10.5" ry="13.4" fill="url(#${roll})" stroke="#67370d" stroke-width="2"/>
          <ellipse cx="75" cy="41.5" rx="6.8" ry="9.5" fill="url(#${spiral})" opacity=".85"/>
          <path d="M76 34 C80 36 81 42 77 46 C73 49 70 46 71 42 C72 39 75 39 76 42" fill="none" stroke="#a96a20" stroke-width="1.5"/>
          <ellipse cx="20" cy="41.5" rx="9" ry="13.2" fill="url(#${roll})" stroke="#67370d" stroke-width="1.8"/>
          <ellipse cx="20" cy="41.5" rx="5.4" ry="8.2" fill="#a5651f" opacity=".6"/>
          <path d="M25 32 C32 36 34 44 31 51 M40 31 C46 36 47 45 44 52" fill="none" stroke="#8b5217" stroke-width="1.7" opacity=".55"/>
        </g>
        <g>
          <rect x="16" y="45" width="61" height="30" rx="15" fill="url(#${roll})" stroke="#67370d" stroke-width="2.5"/>
          <path d="M22 53 C34 48 50 48 64 52" fill="none" stroke="#ffeeb5" stroke-width="3.3" opacity=".55"/>
          <path d="M27 66 C39 62 54 63 68 67" fill="none" stroke="#9d5c18" stroke-width="1.8" opacity=".5"/>
          <path d="M33 47 C38 53 39 62 36 69 M49 46 C53 53 53 62 50 70 M63 48 C66 55 66 63 64 70" fill="none" stroke="#a56722" stroke-width="1.6" opacity=".55"/>
          <ellipse cx="78" cy="60" rx="11.3" ry="14.5" fill="url(#${roll})" stroke="#67370d" stroke-width="2.2"/>
          <ellipse cx="78" cy="60" rx="7.4" ry="10.4" fill="url(#${spiral})" stroke="#9a5c18" stroke-width="1"/>
          <path d="M79 52 C84 54 85 61 80 65 C76 68 73 64 74 60 C75 57 78 57 79 60" fill="none" stroke="#a96a20" stroke-width="1.6"/>
          <ellipse cx="17" cy="60" rx="9" ry="14" fill="url(#${rollDark})" stroke="#67370d" stroke-width="1.9"/>
          <ellipse cx="17" cy="60" rx="5.2" ry="9" fill="#9e5d19" opacity=".55"/>
          <circle cx="38" cy="55" r="1.3" fill="#ffe7a8" opacity=".55"/>
          <circle cx="58" cy="60" r="1" fill="#ffe7a8" opacity=".45"/>
          <circle cx="30" cy="72" r=".9" fill="#ffe7a8" opacity=".4"/>
          <path d="M74 75 C79 73 83 69 84 64" fill="none" stroke="#ffe6a2" stroke-width="1" opacity=".35"/>
        </g>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     16. 黄瓜
     --------------------------------------------------------- */
  function cucumber(uid) {
    const flesh = `cucumber-flesh-${uid}`;
    const skin = `cucumber-skin-${uid}`;
    const seed = `cucumber-seed-${uid}`;
    return svg(`
      <defs>
        ${rg(flesh, [['0%', '#f4f4c6'], ['55%', '#dbe8ae'], ['100%', '#b4cd86']], 0.44, 0.38, 0.72)}
        ${lg(skin, [['0%', '#6d9a45'], ['100%', '#3f6b31']])}
        ${lg(seed, [['0%', '#fffee1'], ['100%', '#e0e6ad']])}
      </defs>
      <g transform="rotate(-13 50 50)" ${EASE}>
        <g transform="translate(9 4) rotate(18 50 50)" opacity=".82">
          <circle cx="53" cy="52" r="30" fill="#3e6a31" stroke="#284724" stroke-width="2.1"/>
          <circle cx="53" cy="52" r="25.5" fill="#e8edbd" opacity=".95"/>
          <circle cx="53" cy="52" r="13" fill="#cfdda0"/>
        </g>
        <circle cx="45" cy="49" r="33.5" fill="url(#${skin})" stroke="#284724" stroke-width="2.4"/>
        <circle cx="45" cy="49" r="29.5" fill="#d5e4a3" stroke="#7ba257" stroke-width="1.7"/>
        <circle cx="45" cy="49" r="25.5" fill="url(#${flesh})" stroke="#b7cd88" stroke-width="1"/>
        <circle cx="45" cy="49" r="12.5" fill="#f5f3cf" opacity=".68"/>
        <path d="M45 27 C48 37 48 44 46 49 M66 38 C58 43 55 46 51 49 M65 65 C58 60 53 56 49 50 M41 74 C42 65 43 56 45 50 M24 64 C32 58 38 54 43 51 M25 35 C33 41 38 45 43 49" fill="none" stroke="#c2d292" stroke-width="1.2" opacity=".9"/>
        <g fill="url(#${seed})" stroke="#b6c27a" stroke-width=".6">
          <ellipse cx="45" cy="31.5" rx="1.8" ry="4.1" transform="rotate(6 45 31.5)"/>
          <ellipse cx="56" cy="33.4" rx="1.7" ry="3.9" transform="rotate(38 56 33.4)"/>
          <ellipse cx="63.8" cy="41.4" rx="1.7" ry="3.9" transform="rotate(74 63.8 41.4)"/>
          <ellipse cx="64.5" cy="53.7" rx="1.7" ry="4" transform="rotate(108 64.5 53.7)"/>
          <ellipse cx="57.4" cy="64.1" rx="1.7" ry="3.8" transform="rotate(147 57.4 64.1)"/>
          <ellipse cx="45" cy="66.8" rx="1.7" ry="3.9" transform="rotate(4 45 66.8)"/>
          <ellipse cx="33.2" cy="62.7" rx="1.6" ry="3.8" transform="rotate(-35 33.2 62.7)"/>
          <ellipse cx="26.1" cy="53.1" rx="1.7" ry="3.8" transform="rotate(-70 26.1 53.1)"/>
          <ellipse cx="26.5" cy="41" rx="1.6" ry="3.7" transform="rotate(-111 26.5 41)"/>
          <ellipse cx="34.1" cy="32.2" rx="1.6" ry="3.6" transform="rotate(-143 34.1 32.2)"/>
        </g>
        <path d="M22 32 C30 23 43 18 55 20" fill="none" stroke="#f5f6d7" stroke-width="3.2" opacity=".38"/>
        <path d="M67 59 C71 54 72 47 70 41" fill="none" stroke="#f9ffe4" stroke-width="2.1" opacity=".32"/>
        <circle cx="36" cy="47" r="1.2" fill="#9bb671" opacity=".4"/>
        <circle cx="54" cy="59" r=".8" fill="#9bb671" opacity=".35"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     17. 泥鳅
     --------------------------------------------------------- */
  function loach(uid) {
    const body = `loach-body-${uid}`;
    const belly = `loach-belly-${uid}`;
    return svg(`
      <defs>
        ${lg(body, [['0%', '#a38a54'], ['38%', '#665b36'], ['100%', '#373b26']], 0.1, 0, 0.9, 1)}
        ${lg(belly, [['0%', '#e6cf91'], ['100%', '#b29b64']])}
      </defs>
      <g transform="rotate(-20 50 50)" ${EASE}>
        <path d="M16 55 C23 38 40 26 58 28 C73 29 85 38 86 50 C87 63 77 74 61 76 C44 79 27 73 18 63 C15 60 14 58 16 55Z" fill="url(#${body})" stroke="#2f2b18" stroke-width="2.4"/>
        <path d="M22 61 C33 71 48 76 62 73 C73 70 81 62 82 53 C78 62 69 68 58 69 C45 71 31 67 22 61Z" fill="url(#${belly})" opacity=".8"/>
        <path d="M31 42 C39 34 51 31 62 34 C53 37 45 42 40 49 C36 56 35 62 37 68 C29 61 25 51 31 42Z" fill="#b9a16a" opacity=".23"/>
        <path d="M30 39 C40 32 52 30 61 32" fill="none" stroke="#dbc590" stroke-width="2.3" opacity=".38"/>
        <path d="M44 61 C48 55 51 48 51 41 M55 66 C58 60 60 54 61 47 M67 67 C68 61 68 56 66 51" fill="none" stroke="#d6bf89" stroke-width="1.3" opacity=".36"/>
        <circle cx="25" cy="49" r="2.9" fill="#1b1a10"/>
        <circle cx="24.1" cy="48.1" r=".9" fill="#f4e7bc"/>
        <path d="M20 52 C15 52 11 50 8 47 M21 55 C15 56 11 59 8 62 M25 57 C22 62 17 66 12 68" fill="none" stroke="#5d4f2e" stroke-width="1.3" opacity=".9"/>
        <path d="M82 61 C88 61 92 58 94 54 C89 54 85 56 82 59Z" fill="#665b36" stroke="#2f2b18" stroke-width="1.5"/>
        <path d="M43 33 C53 30 65 31 74 36" fill="none" stroke="#a18b53" stroke-width="1.4" opacity=".35"/>
        <circle cx="41" cy="46" r="2.1" fill="#272a1b" opacity=".65"/>
        <circle cx="53" cy="39" r="1.6" fill="#272a1b" opacity=".55"/>
        <circle cx="65" cy="45" r="2.2" fill="#272a1b" opacity=".55"/>
        <circle cx="50" cy="55" r="1.5" fill="#272a1b" opacity=".52"/>
        <circle cx="63" cy="58" r="1.8" fill="#272a1b" opacity=".45"/>
        <circle cx="37" cy="59" r="1.2" fill="#272a1b" opacity=".45"/>
        <path d="M31 44 C38 38 48 35 57 36" fill="none" stroke="#fff0bf" stroke-width="1.8" opacity=".26"/>
        <path d="M65 35 C68 30 72 28 76 30 C74 35 71 38 67 39Z" fill="#8a7b47" stroke="#3f3824" stroke-width="1.2"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     18. 鲳鱼
     --------------------------------------------------------- */
  function pomfret(uid) {
    const silver = `pomfret-silver-${uid}`;
    const fin = `pomfret-fin-${uid}`;
    return svg(`
      <defs>
        ${rg(silver, [['0%', '#fbf7e9'], ['46%', '#cbd3cf'], ['100%', '#899fa2']], 0.36, 0.28, 0.82)}
        ${lg(fin, [['0%', '#e4d6c3'], ['100%', '#9ba8a2']])}
      </defs>
      <g transform="rotate(12 50 50)" ${EASE}>
        <path d="M50 17 C61 16 68 24 75 31 C83 39 85 48 80 57 C74 68 63 76 51 82 C39 75 28 69 22 58 C16 47 20 36 28 28 C35 21 41 18 50 17Z" fill="url(#${silver})" stroke="#5b6c6b" stroke-width="2.5"/>
        <path d="M50 22 C59 22 66 28 71 34 C78 42 80 50 75 58 C69 68 61 73 51 77 C42 72 34 65 29 56 C24 47 27 37 34 30 C39 25 44 22 50 22Z" fill="none" stroke="#f7f3e2" stroke-width="2" opacity=".55"/>
        <path d="M50 25 C57 31 62 41 62 51 C62 63 57 70 51 75 C45 69 40 60 40 50 C40 40 44 31 50 25Z" fill="#d9ded6" opacity=".3"/>
        <path d="M48 18 C53 10 58 8 62 12 C60 19 57 23 53 25Z" fill="url(#${fin})" stroke="#5b6c6b" stroke-width="1.4"/>
        <path d="M23 45 C15 41 10 43 8 48 C10 55 16 59 23 60Z" fill="url(#${fin})" stroke="#5b6c6b" stroke-width="1.6"/>
        <path d="M77 43 C84 38 89 37 92 40 C90 46 86 51 80 54Z" fill="url(#${fin})" stroke="#5b6c6b" stroke-width="1.5"/>
        <path d="M70 65 C77 68 82 73 83 79 C77 78 73 75 69 71Z" fill="url(#${fin})" stroke="#5b6c6b" stroke-width="1.4"/>
        <path d="M33 38 C39 32 45 29 51 28" fill="none" stroke="#fffdf2" stroke-width="2.6" opacity=".55"/>
        <path d="M33 54 C41 58 49 60 58 59 M37 44 C43 47 48 50 53 54 M47 34 C52 40 55 46 57 53 M62 62 C66 58 68 53 69 48" fill="none" stroke="#8c9d9a" stroke-width="1.3" opacity=".6"/>
        <circle cx="43" cy="38" r="2.2" fill="#343e3d"/>
        <circle cx="42.4" cy="37.3" r=".65" fill="#f4f1e3"/>
        <path d="M38 43 C36 44 35 46 34 48" fill="none" stroke="#697b78" stroke-width="1.1"/>
        <path d="M48 72 C52 68 55 64 57 59" fill="none" stroke="#f4f1e3" stroke-width="1.2" opacity=".4"/>
        <circle cx="55" cy="39" r="1.2" fill="#8b9b98" opacity=".5"/>
        <circle cx="62" cy="49" r="1.4" fill="#8b9b98" opacity=".45"/>
        <circle cx="45" cy="61" r="1.1" fill="#8b9b98" opacity=".4"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     19. 西番茄
     --------------------------------------------------------- */
  function tomato(uid) {
    const skin = `tomato-skin-${uid}`;
    const leaf = `tomato-leaf-${uid}`;
    return svg(`
      <defs>
        ${rg(skin, [['0%', '#ff9d67'], ['35%', '#ef4e32'], ['72%', '#c52b20'], ['100%', '#821612']], 0.35, 0.26, 0.82)}
        ${lg(leaf, [['0%', '#7fa444'], ['100%', '#3c6a31']], 0, 0, 1, 1)}
      </defs>
      <g transform="rotate(-12 50 50)" ${EASE}>
        <path d="M49 15 C65 14 82 27 84 46 C87 65 75 82 57 86 C40 90 24 80 19 64 C13 47 22 27 37 19 C41 17 45 16 49 15Z" fill="url(#${skin})" stroke="#65140f" stroke-width="2.5"/>
        <path d="M56 19 C70 22 80 34 80 49 C81 63 72 76 60 81 C72 77 82 66 82 53 C82 37 71 22 56 19Z" fill="#7c1912" opacity=".34"/>
        <path d="M28 31 C35 23 44 19 54 19" fill="none" stroke="#ffd2a5" stroke-width="4" opacity=".34"/>
        <path d="M31 38 C34 33 39 30 44 29" fill="none" stroke="#fff2d4" stroke-width="2" opacity=".28"/>
        <path d="M53 31 C60 37 64 46 64 55 M45 37 C48 44 49 51 49 59" fill="none" stroke="#9f2118" stroke-width="1.4" opacity=".28"/>
        <path d="M31 69 C40 76 53 78 65 74" fill="none" stroke="#ff9f77" stroke-width="1.6" opacity=".22"/>
        <g transform="translate(0 -1)">
          <path d="M50 21 C45 12 36 8 29 12 C34 19 40 23 48 25Z" fill="url(#${leaf})" stroke="#294a28" stroke-width="1.4"/>
          <path d="M50 22 C53 11 62 6 70 10 C66 18 59 23 51 26Z" fill="url(#${leaf})" stroke="#294a28" stroke-width="1.4"/>
          <path d="M49 25 C41 21 29 24 25 31 C33 35 42 32 49 29Z" fill="url(#${leaf})" stroke="#294a28" stroke-width="1.4"/>
          <path d="M51 25 C60 21 71 25 76 33 C67 36 58 32 51 29Z" fill="url(#${leaf})" stroke="#294a28" stroke-width="1.4"/>
          <path d="M50 25 C48 33 47 38 48 44" fill="none" stroke="#486e32" stroke-width="2.4"/>
          <path d="M50 20 C49 15 50 10 52 7" fill="none" stroke="#395d2c" stroke-width="2.8"/>
          <path d="M42 14 C46 18 48 21 49 24 M58 14 C55 18 53 21 51 24" fill="none" stroke="#9cbd6c" stroke-width="1.1" opacity=".6"/>
        </g>
        <ellipse cx="37" cy="40" rx="5" ry="2.5" transform="rotate(-35 37 40)" fill="#ffd2b3" opacity=".23"/>
        <circle cx="66" cy="69" r="1.4" fill="#ffc4a3" opacity=".3"/>
        <circle cx="37" cy="66" r="1" fill="#72120e" opacity=".35"/>
      </g>
    `);
  }

  /* ---------------------------------------------------------
     食材清单
     --------------------------------------------------------- */
  // size 是单个食材占锅内汤面直径的大致比例：
  // 螃蟹、整鱼、鸡排等大件更大，红枣、姜片、花椒等小件更小。
  const list = [
    { id: 'crab', name: '螃蟹', short: '蟹', art: crab, image: 'assets/ingredients/crab.png', size: 0.725, hit: 0.9 },
    { id: 'fish-tofu', name: '鱼豆腐', short: '腐', art: fishTofu, image: 'assets/ingredients/fish-tofu.png', size: 0.255, hit: 0.9 },
    { id: 'red-date', name: '红枣', short: '枣', art: redDate, image: 'assets/ingredients/red-date.png', size: 0.1575, hit: 0.94 },
    { id: 'ginger', name: '姜片', short: '姜', art: ginger, image: 'assets/ingredients/ginger.png', size: 0.192, hit: 0.94 },
    { id: 'egg', name: '鸡蛋', short: '蛋', art: egg, image: 'assets/ingredients/egg.png', size: 0.216, hit: 0.94 },
    { id: 'luncheon', name: '午餐肉', short: '肉', art: luncheon, image: 'assets/ingredients/luncheon.png', size: 0.297, hit: 0.92 },
    { id: 'chicken', name: '鸡排', short: '排', art: chicken, image: 'assets/ingredients/chicken.png', size: 0.3895, hit: 0.92 },
    { id: 'sprouts', name: '黄豆芽', short: '芽', art: sprouts, image: 'assets/ingredients/sprouts.png', size: 0.2635, hit: 0.94 },
    { id: 'fish-slice', name: '鱼片', short: '片', art: fishSlice, image: 'assets/ingredients/fish-slice.png', size: 0.2975, hit: 0.93 },
    { id: 'shrimp', name: '虾', short: '虾', art: shrimp, image: 'assets/ingredients/shrimp.png', size: 0.36, hit: 0.92 },
    { id: 'ribs', name: '排骨', short: '骨', art: ribs, image: 'assets/ingredients/ribs.png', size: 0.3705, hit: 0.91 },
    { id: 'pepper', name: '青花椒', short: '椒', art: pepper, image: 'assets/ingredients/pepper.png', size: 0.165, hit: 0.94 },
    { id: 'blood', name: '鸭血', short: '血', art: bloodTofu, image: 'assets/ingredients/blood.png', size: 0.2295, hit: 0.94 },
    { id: 'hairtail', name: '带鱼', short: '带', art: hairtail, image: 'assets/ingredients/hairtail.png', size: 0.441, hit: 0.91 },
    { id: 'roll', name: '响铃卷', short: '铃', art: friedRoll, image: 'assets/ingredients/roll.png', size: 0.2635, hit: 0.92 },
    { id: 'cucumber', name: '黄瓜', short: '瓜', art: cucumber, image: 'assets/ingredients/cucumber.png', size: 0.2, hit: 0.94 },
    { id: 'loach', name: '泥鳅', short: '鳅', art: loach, image: 'assets/ingredients/loach.png', size: 0.399, hit: 0.92 },
    { id: 'pomfret', name: '鲳鱼', short: '鲳', art: pomfret, image: 'assets/ingredients/pomfret.png', size: 0.483, hit: 0.91 },
    { id: 'tomato', name: '西番茄', short: '茄', art: tomato, image: 'assets/ingredients/tomato.png', size: 0.208, hit: 0.93 }
  ];

  window.HOTPOT_INGREDIENTS = list;
})();
