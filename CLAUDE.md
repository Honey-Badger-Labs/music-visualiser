# Working on Psychedelic Visualiser

- Owner: Jakes. He gives taste notes; Claude does the build. Keep replies short: what changed, how to check it, what you need from him.
- No build step and no dependencies. `index.html` must keep working when opened from any static host, including TV browsers (no modern-only syntax beyond what WebGL2 browsers have).
- Sound analysis lives in `analysis.js` as pure functions with tests. Any change to bands, gain or beats gets a test with a made-up signal first. Run `npm test` before every commit.
- Never send, store or record the listener's sound. Never route the microphone or shared sound to the speakers (it howls).
- Keep the TV path working: every control is a focusable button, arrows and Enter drive the show when the bar is hidden, nothing needs hover.
- Shader cost matters on TVs and phones: one scene evaluation per pixel, never two. The resolution adapts (`adapt()`); do not fight it.
- To look at it: `npm run serve`, then headless Chrome with SwiftShader at `?demo&scale=.6`, or `--use-fake-device-for-media-stream` for the microphone path.
- Colours, scenes and the demo track are artistic choices; there are no factual claims here. Say openly that it was made with AI if asked.
