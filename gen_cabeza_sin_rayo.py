#!/usr/bin/env python3
"""
gen_cabeza_sin_rayo.py
======================
Genera assets/img/cabeza_sin_rayo.png — la cabeza anatómica SIN el rayo,
usada en el splash antes de que el rayo caiga a t=2.6s.

ENTRADAS REQUERIDAS
───────────────────
• assets/img/cabeza_web.png   — 786×1200 RGBA, grabado anatómico CON rayo rojo
                                (el rayo fue dibujado encima en Photoshop y
                                 no existe como capa separada)
• vin_warped.jpg              — 786×1200 BGR, foto vintage del grabado SIN rayo,
                                alineada al frame de cabeza_web.png via homografía ORB.
                                Para regenerarla ver nota al final de este archivo.

MÉTODO
──────
1. Detectar el rayo (bolt_core): píxeles r>180, g<60, b<60 en cabeza_web.
2. Dilatar 25 px (bolt_full) para cubrir anti-alias y el tachuelón metálico
   del grabado original que quedaba oculto bajo el rayo.
3. Detectar anatomía en el vintage (is_anatomy): saturación > 0.18 y brillo > 60.
4. Construir alpha limpia:
   - bolt_full & ~is_anatomy → transparente  (zona del rayo sin contenido anatómico)
   - bolt_full &  is_anatomy → opaco 255     (zona del rayo con anatomía del vintage)
   - resto                  → alpha original  (cráneo intacto)
5. RGB: usar el vintage como contenido (no tiene rayo).
6. Eliminar islas desconectadas (artefactos flotantes fuera del cuerpo principal).
7. Recorte quirúrgico de tachuelón residual:
   - Zona y=140-168, x=280-560: píxeles visibles con r−b ≤ 40 → transparente.
     (El tachuelón es sepia oscuro r−b≈20-38; el arco del cráneo es r−b≥41.)

CÓMO REGENERAR vin_warped.jpg (si se pierde)
────────────────────────────────────────────
Se genera alineando "cabeza anatomia.jpg" (foto de la lámina original sin rayo)
a cabeza_web.png con ORB + homografía:

    import cv2, numpy as np
    ref = cv2.imread('assets/img/cabeza_web.png')
    src = cv2.imread('cabeza anatomia.jpg')
    src = cv2.rotate(src, cv2.ROTATE_90_COUNTERCLOCKWISE)

    orb = cv2.ORB_create(5000)
    kp1,d1 = orb.detectAndCompute(cv2.cvtColor(ref,cv2.COLOR_BGR2GRAY),None)
    kp2,d2 = orb.detectAndCompute(cv2.cvtColor(src,cv2.COLOR_BGR2GRAY),None)
    bf  = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    m   = sorted(bf.match(d1,d2), key=lambda x:x.distance)[:500]
    pts1 = np.float32([kp1[x.queryIdx].pt for x in m])
    pts2 = np.float32([kp2[x.trainIdx].pt for x in m])
    H,_  = cv2.findHomography(pts2, pts1, cv2.RANSAC, 5.0)
    warped = cv2.warpPerspective(src, H, (786,1200))
    cv2.imwrite('vin_warped.jpg', warped)
"""

import cv2
import numpy as np
from pathlib import Path

ROOT  = Path(__file__).parent
ORIG  = ROOT / 'assets/img/cabeza_web.png'
VIN   = ROOT / 'vin_warped.jpg'
OUT   = ROOT / 'assets/img/cabeza_sin_rayo.png'


def run():
    ori = cv2.imread(str(ORIG), cv2.IMREAD_UNCHANGED)   # BGRA
    vin = cv2.imread(str(VIN),  cv2.IMREAD_COLOR)       # BGR

    if ori is None: raise FileNotFoundError(ORIG)
    if vin is None: raise FileNotFoundError(VIN)

    b_o, g_o, r_o, a_o = (ori[:,:,i].astype(float) for i in range(4))
    b_v, g_v, r_v      = (vin[:,:,i].astype(float) for i in range(3))

    # ── Anatomía en el vintage ────────────────────────────────────────────
    mx  = np.maximum(np.maximum(r_v, g_v), b_v) + 1e-9
    sat = (mx - np.minimum(np.minimum(r_v, g_v), b_v)) / mx
    is_anatomy = (r_v + g_v + b_v > 60) & (sat > 0.18)

    # ── Detección del rayo ────────────────────────────────────────────────
    bolt_core = ((r_o > 180) & (g_o < 60) & (b_o < 60) & (a_o > 30)).astype(np.uint8)
    k25       = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    bolt_full = cv2.dilate(bolt_core, k25, iterations=1).astype(bool)

    # ── Construir resultado: RGB del vintage + alpha inteligente ──────────
    result         = np.zeros_like(ori)
    result[:,:,:3] = vin

    alpha               = ori[:,:,3].copy()
    alpha[bolt_full & ~is_anatomy] = 0
    alpha[bolt_full &  is_anatomy] = 255
    result[:,:,3]       = alpha

    # ── Eliminar islas desconectadas ──────────────────────────────────────
    binary    = (result[:,:,3] > 30).astype(np.uint8)
    _, labels, stats, _ = cv2.connectedComponentsWithStats(binary, connectivity=8)
    largest   = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    result[:,:,3] = result[:,:,3] * (labels == largest).astype(np.uint8)

    # ── Recorte quirúrgico del tachuelón residual ─────────────────────────
    # El tachuelón metálico del grabado queda expuesto en y≈140-168, x≈280-560
    # cuando se elimina el rayo. Es sepia oscuro (r−b ≤ 40); el arco del cráneo
    # empieza con r−b ≥ 41.
    zy, zx = slice(140, 169), slice(280, 560)
    r_z, b_z, a_z = result[zy,zx,2].astype(float), result[zy,zx,0].astype(float), result[zy,zx,3]
    tack = (a_z > 30) & ((r_z - b_z) <= 40)
    result[zy, zx, 3] = np.where(tack, 0, a_z)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(OUT), result)
    print(f'✓ {OUT}')


if __name__ == '__main__':
    run()
