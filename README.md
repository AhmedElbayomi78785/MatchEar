# MatchEar

A live football companion for blind and low-vision fans. Match events arrive as short spoken announcements and distinct vibration patterns, so a fan in a loud cafeteria can know about a goal before the room reacts to the TV. The screen stays useful for people with partial sight: huge numerals, high contrast, one item per row.

It started as the design project for COMP 3451 (Designing the User Interface) at Thompson Rivers University. The idea came from a scenario about Karim, a blind Al Ahly fan who follows the Cairo derby from his neighbourhood cafeteria. The project went through a storyboard, three low-fidelity alternatives and testing with five target users; this app is the chosen design built for real, including the changes those testers asked for.

## Try it

Open the site in Chrome, pick a language, press Start listening.

Home shows real fixtures only. The Demo tab runs a simulated Al Ahly vs Zamalek derby, clearly labelled as a trial match, so you can feel the full experience without waiting for a real game: a goal interrupts on its own about 35 seconds in with a vibration pattern and a spoken announcement, Zamalek pulls one back later with a different pattern, and after full time you can replay the whole match as audio.

Real fixtures load from TheSportsDB across ten competitions: World Cup, Euro, Copa America, Africa Cup of Nations, CAF Champions League, UEFA Champions League, Europa League, Premier League, La Liga and Serie A. Each row shows the team badges and kickoff time or score. Open one and it moves to the Live tab: crests, score, and a ticking match clock, with the game's timeline underneath (every goal with scorer and minute, cards, substitutions). While a game is live the app rechecks every minute; a new goal arrives as vibration, a takeover screen, and a spoken line with the scorer's name. Ask works on real games too: who scored, cards, and match stats (xG and shots) are answered out loud from the live data.

## Features

The voice reads every event with scorer, minute and new score, and the on-screen text matches what it says word for word. Vibration patterns differ by event: three long buzzes for your team's goal, a short-short-long rhythm for a goal against, short pulses for cards and substitutions. Hold the Ask button and speak a question ("who scored?", "في كروت؟"); answers come from the live match state and are spoken back. Quick-question buttons cover the same ground without a microphone. One tap switches the whole app to Arabic: right-to-left layout, Egyptian colloquial phrasing and an Arabic voice. Settings for voice speed, announcement verbosity, high contrast, three text sizes and data saver all apply immediately and are remembered on the device.

Screen-reader users get labelled controls, an assertive live region for announcements, large touch targets and visible focus. Reduced-motion preferences are respected.

## Stack

Plain HTML, CSS and JavaScript, no build step. Speech uses the Web Speech API, haptics use navigator.vibrate, fixtures come from the free TheSportsDB v1 API, settings live in localStorage. A small serverless function at api/tsdb.js proxies the fixtures API on Vercel, so the data loads even where the browser can't call it directly. Chrome or Edge work best; vibration needs an Android device.

## Deploy

It's a static site. Push the files (including the api folder) to a repo and import it on Vercel, or drag the folder into vercel.com/new. No build settings.

## Design notes

The look is a night match: floodlit near-black, warm white text, Al Ahly red for anything live, pitch green kept to a quiet background motif. Archivo carries the Latin scoreboard numerals and Cairo carries the Arabic. Since the target users include people with low vision, legibility decisions (type size, contrast, one item per row) double as the visual identity.

Built by Ahmed Elbayomi.
