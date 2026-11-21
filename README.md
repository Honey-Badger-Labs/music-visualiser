# Psychedelic Visualiser

A psychedelic fractal music visualiser, from the makers of [The Unfolding](https://github.com/honey-badger-labs/the-unfolding) and [Psychedelic Mandelbrot](https://github.com/honey-badger-labs/psychedelic-mandelbrot). Three scenes (a Julia set whose shape travels with the music, an endless dive into the Mandelbrot set, and a breathing Mandelbulb), with a spectrum ring, a kaleidoscope, trails, and colours that change with the song.

## What it can listen to

| Source | Works with | How |
| --- | --- | --- |
| **Microphone** | Any music app, any speaker, a TV, a band, vinyl | Hears the room. Voice-call filters (echo cancelling, noise suppression, auto gain) are switched off, since they flatten music |
| **Tab or computer sound** | Spotify Web, YouTube, SoundCloud, any tab; on Windows and ChromeOS, every app | Chrome or Edge on a computer. Choose a tab and tick *Share tab audio*, or choose the whole screen and tick *Share system audio*. No microphone, no room noise |
| **Music file** | MP3, M4A, FLAC, WAV, OGG | Pick or drop files; several make a playlist |
| **Demo track** | Everywhere | 118 BPM, generated live by `demo.js`; needs no permission |

Nothing you play leaves the device: the sound is analysed in the page, never recorded or sent.

## On a TV

- **Cast it**: open the visualiser in Chrome on a laptop, choose *Tab or computer sound* (or *Microphone*), then *Cast… → Cast tab* to a Chromecast or Google TV. The picture goes to the TV; the listening stays on the laptop.
- **HDMI**: plug the laptop in, press **F** for full screen.
- **The TV's own browser** (Samsung, LG, Android TV, Fire TV): open the web address. Most TV browsers have no microphone, so use *Demo track* or *Music file* from a USB stick, or cast instead. The remote works: **← →** change scene, **↑ ↓** colours, **OK** shows the controls, **Back** changes the source. The page lowers its resolution until it runs smoothly on a slow TV chip.
- **Phone or tablet**: *Microphone* works in Safari and Chrome; hold the phone near the speaker, or use *Music file*.

## Keys

← → scene · ↑ ↓ colours · Enter/OK controls · F full screen · O spectrum ring · K kaleidoscope · + − sensitivity · Esc change source. **Auto** changes the scene every 64 beats (or 75 seconds) and the colours every 16 beats.

## Run it

```sh
npm run serve        # then open http://localhost:8000
npm test             # checks the sound analysis: bands, beats and tempo
```

The microphone and tab sharing need a secure page: `localhost` or `https://` (GitHub Pages). Previews that embed the page in a frame (such as a claude.ai artifact) usually block both; the file and demo sources still work there.

## How it is built

- **`index.html`**: WebGL2, no build step, no dependencies. One shader draws the scene over a warped, fading copy of the last frame (the trails), then copies it to the screen. Scenes change through a dip to black that the trails melt over.
- **`analysis.js`**: pure functions, tested in Node: four frequency bands, level followers that rise fast and fall slowly, and a beat detector that looks for sudden rises in the bass rather than loud bass, so a busy bass line cannot hide the kick, and that works the same at 10 or 60 frames a second. An automatic gain makes a quiet microphone across the room and a loud file fill the same range.
- **`demo.js`**: the demo track, scheduled with the Web Audio clock.

## Licence

Free for noncommercial use under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use (paid products, venues, events, advertising) needs a licence from the copyright holder: open an issue to ask. See [LICENSE-CONTENT.md](LICENSE-CONTENT.md).
