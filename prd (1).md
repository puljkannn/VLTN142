# PRD — “Be My Valentine” web stranica (single-page)

## 1) Sažetak
Statička, simpatična web stranica (jedan URL) na kojoj postavljaš pitanje **“Be my valentine?”** s dva gumba: **DA** i **NE**. Gumb **NE** bježi od pokazivača/prsta tako da ga praktički nije moguće kliknuti. Gumb **DA** stalno pulsira (poveća–smanji) kao “kucanje”, ali ostaje normalnog oblika (klasičan gumb).

Nakon klika na **DA**:
1) iz **gumba** nakratko “izleti” **konfeti** (ne emoji) kao mali burst efekt,  
2) prikazuje se drugi ekran s animacijom mnogo emoji-ja srca (❤️) i tulipana (🌷) po ekranu,  
3) u centru je tvoja mala slika u “card” okviru.  

Dodatno, postoji **Sound on/off** gumb; ako je uključen, nakon klika na **DA** (user gesture) krene kratka romantična muzika.

---

## 2) Ciljevi
- Ultra jednostavno iskustvo: brzo učitavanje, bez backend-a.
- Humor/simpatičnost: “NE” se ne može kliknuti jer bježi.
- “DA” je jasno istaknut i animiran.
- Nakon “DA” dobije se “celebration” (konfeti + animacije + slika).
- Radi na desktopu i mobitelu (touch/pointer).

### Metrike uspjeha
- 0 JS errora u konzoli na modernim browserima (Chrome/Safari/Firefox).
- Fluidne animacije (cilj 60 FPS na prosječnim uređajima).
- Klik na **DA** pouzdano pokreće prijelaz i efekte.
- Sound radi u skladu s autoplay pravilima (kreće tek nakon klika).

---

## 3) Ciljana publika i user story
**User story:**  
“Kao korisnik, želim otvoriti link i vidjeti romantično pitanje s dva gumba, pri čemu DA pulsira i poziva na klik, a NE mi stalno bježi. Nakon klika na DA želim dobiti konfeti burst iz gumba, ‘celebration’ animaciju, sliku u centru i (po želji) romantičnu muziku.”

---

## 4) Opseg (Scope)

### U opsegu
1. **Screen 1 (pitanje + gumbi + sound toggle)**
   - Tekst pitanja
   - Gumbi DA i NE
   - Pulsirajuća animacija DA (infinite)
   - NE bježi od pointera/toucha (ne izlazi iz ekrana)
   - Sound on/off gumb (npr. gore desno)

2. **Klik na DA**
   - Konfeti burst koji “izleti” iz pozicije DA gumba (kratko, ~600–900ms)
   - Ako je sound uključen: pokrenuti romantičnu muziku (audio) odmah nakon klika
   - Fade/scale prijelaz na Screen 2 (može kratki delay da se konfeti vidi)

3. **Screen 2 (slavlje)**
   - Fullscreen animacija čestica: ❤️ i 🌷 (emoji)
   - Centralna slika u “card” okviru (rounded + shadow) + scale-in animacija

4. **Konfigurabilnost**
   - Promjenjivi tekstovi (pitanje, DA, NE)
   - Putanja/URL slike
   - Parametri čestica (rate, maxParticles)
   - Audio putanja, glasnoća, default sound stanje
   - Parametri konfeti bursta (broj, trajanje)

### Izvan opsega
- Backend, login, baza
- Kompleksna analitika/trackeri
- Internacionalizacija (osim ako se kasnije doda)

---

## 5) Funkcionalni zahtjevi

### FR-1: Prikaz Screen 1
- Cijeli sadržaj centriran (vertical + horizontal).
- Na desktopu gumbi u jednom redu; na mobitelu mogu u kolonu.
- Dizajn romantičan (pastel pozadina/gradient).

### FR-2: Animacija gumba “DA”
- DA stalno pulsira koristeći CSS `transform: scale(...)` (bez layout skakanja).
- Predloženo: trajanje 0.9–1.2s, `ease-in-out`, infinite.
- Po želji: lagani glow/box-shadow.

### FR-3: “NE” bježi od pokazivača (desktop)
- Kad je pointer unutar praga `triggerDistance` (npr. 120px) od centra gumba NE:
  - NE se pomakne u smjeru od pointera tako da bude barem `escapeRadius` (npr. 160px) udaljen.
- NE mora ostati unutar viewporta (clamp s `padding` marginom).
- Ako NE “zapne” uz rub, algoritam mora pokušati alternativni smjer (rotacija kuta bijega i/ili random jitter) dok ne nađe valjanu poziciju.

### FR-4: “NE” radi i na mobitelu (touch)
- Koristiti `pointermove` (poklapa mouse + touch) ili fallback `touchmove`.
- Kad se prst približi NE, gumb odskoči na novu poziciju.
- Opcionalno: na `pointerdown` također “escape” da se spriječi slučajni tap.

### FR-5: Klik na “DA” → konfeti burst + prijelaz
- Na `click`:
  1) Pokrenuti konfeti burst iz pozicije DA gumba (kratko, intenzivno).
  2) Ako je sound uključen, pokrenuti audio (user gesture).
  3) Screen 1 fade out + Screen 2 fade in (ili kratki delay da se konfeti vidi).

### FR-6: Screen 2 — emoji čestice ❤️ i 🌷
- Fullscreen animacija čestica (DOM ili canvas).
- Elementi se pojavljuju periodično (`particleRate`) do `maxParticles`.
- Svaki element ima random X, veličinu, brzinu i drift.
- Brisati elemente nakon animacije radi performansi.

### FR-7: Centralna slika (Screen 2)
- “Card” u centru:
  - slika (npr. 180–260px ovisno o uređaju)
  - border radius + shadow
  - scale-in animacija
- Fallback ako slika ne učita (placeholder okvir/tekst).

### FR-8: Sound on/off gumb
- Na Screen 1 (i opcionalno na Screen 2) prikazati toggle:
  - Default: **OFF** (sigurnije zbog browser politika i UX-a)
  - Stanje se može pamtiti u `localStorage` (nice-to-have) ili ostaje samo u sessionu.
- UI: ikona 🔇/🔊 ili tekst “Sound: OFF/ON”.

### FR-9: Audio playback nakon DA (user gesture)
- Audio se smije pokrenuti **tek nakon klika** na DA (autoplay ograničenja).
- Audio file: npr. `./assets/romantic.mp3`.
- Volume konfiguracijski (npr. 0.3–0.6).
- Ako audio ne može krenuti (policy/error), aplikacija ne smije puknuti (try/catch, graceful fallback).

### FR-10: Konfeti burst iz gumba (bez emoji)
- Efekt: čestice (mali kvadrati/pravokutnici/krugovi) “izlete” iz koordinata gumba DA.
- Trajanje: ~600–900ms, s fade-out.
- Smjer: random raspršivanje (konus prema gore + bočni drift).
- Implementacija:
  - Preporuka: mali `<canvas>` overlay s `pointer-events:none` ili DOM čestice s CSS animacijom.
  - Limit čestica (npr. 60–120) i ukloniti/počistiti nakon završetka.
- Konfeti se treba vidjeti i na mobitelu.

---

## 6) UX/UI smjernice
- Background: pastel gradient (npr. pink–lavender).
- Tipografija: čitka (system font je OK).
- Gumbi: zaobljeni, jasni kontrasti, DA vizualno dominantniji.
- Mikroanimacije: DA puls, hover glow (desktop), smooth fade između screenova.
- Sound toggle: nenametljiv, ali vidljiv (gore desno).

---

## 7) Pravila ponašanja “NE” gumba (algoritam)
**Parametri:**
- `triggerDistance = 120px`
- `escapeRadius = 160px`
- `padding = 12px`

**Logika:**
1. Na `pointermove`: uzmi pointer (x,y)
2. Izračunaj centar gumba (cx,cy)
3. `dx=cx-x`, `dy=cy-y`, `dist=sqrt(dx^2+dy^2)`
4. Ako `dist < triggerDistance`:
   - normaliziraj smjer bijega `u = (dx/dist, dy/dist)` (ili random ako dist=0)
   - novi centar `n = pointer + u*escapeRadius`
   - clamp na viewport s paddingom
   - ako je nova pozicija i dalje preblizu, rotiraj kut i pokušaj par puta

---

## 8) Ne-funkcionalni zahtjevi
- **Performanse:** ograničiti broj DOM čestica; canvas preporučen za konfeti burst i/ili Screen 2 čestice ako se želi “heavy”.
- **Kompatibilnost:** Chrome/Safari/Firefox (zadnje 2 glavne verzije), mobilni Safari/Chrome.
- **Robusnost:** bez crasha ako audio faila ili slika ne učita.
- **Sigurnost:** nema korisničkih podataka; statički hosting.

---

## 9) Tehnički prijedlog (arhitektura)
**Najjednostavnije:** vanilla statički projekt
- `index.html`
- `styles.css`
- `app.js`
- `/assets/center.jpg`
- `/assets/romantic.mp3`
- Host: GitHub Pages / Netlify / Vercel (static)

### Implementacija konfeti bursta (preporuka)
- `<canvas id="confettiCanvas">` fullscreen overlay (pointer-events: none)
- Na klik DA: izračunati `button.getBoundingClientRect()` i emitirati čestice iz centra gumba
- `requestAnimationFrame` 0.6–0.9s i zatim stop + clear

---

## 10) QA / Test scenariji
1. Desktop: NE bježi i ne izlazi iz ekrana.
2. Mobilni: NE bježi na približavanje prsta.
3. DA pulsira stalno.
4. Klik DA: vidi se konfeti burst iz gumba.
5. Ako sound ON: audio krene nakon klika; ako OFF: ne svira.
6. Screen 2: srca i tulipani se renderiraju bez trzanja; maxParticles se poštuje.
7. Centralna slika se učita; fallback ako ne.

---

## 11) Acceptance kriteriji
- Postoje 2 screen-a i prijelaz klikom na DA.
- DA stalno pulsira.
- NE bježi od pointera i toucha (prakt. neklikabilan) i ostaje u viewportu.
- Na klik DA se pojavi konfeti burst iz gumba (bez emoji).
- Postoji sound toggle i audio se pokreće samo nakon user gesture (DA klik) kad je sound ON.
- Screen 2 prikazuje emoji čestice (❤️ i 🌷) + centralnu sliku.
- Sve radi bez konzolnih errora.

---

## 12) Nice-to-have (opcionalno)
- Spremanje sound preference u localStorage.
- “Nice try 😄” brojač pokušaja klika na NE.
- Dodatni tekst nakon DA (custom poruka).
