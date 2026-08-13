MFM EDITORIAL V19

MFM LUXURY TRAVEL — EDITORIAL V18

Direction: high-end editorial / boutique travel house.
Palette: ivory, black stone, soft charcoal, restrained brass. The prior green has been removed from the visual system.

V18 CHANGES
- Separated the editorial running-text rail from the affiliate/logo rail. They no longer sit on top of one another.
- Moved the affiliate rail later in the page, after the Lookbook.
- Rebuilt all 8 affiliate marks as individual transparent WHITE PNG files under assets/images/affiliates-white/.
- Affiliate rail now runs on a subtle black-stone surface, closer to the premium treatment used on the Songgos/Robby site.
- Replaced CSS-keyframe marquees with requestAnimationFrame + exact modulo wrapping. The track never has a blank/reset frame; hover/focus pauses it.
- Removed the green visual system. Dark sections now use charcoal/black-stone; ivory is the primary field and brass is the only accent.
- Rebuilt the Lookbook turning mechanism again. It no longer rotates one rigid rectangular sheet. The page is divided into 18–30 vertical strips and each strip follows the next through a progressive curl from the outside edge toward the spine. The result is a flexible paper bend with moving highlights/shadows.
- Auto Lookbook interval is intentionally slower (7.6 seconds) and the page curl itself lasts about 2.38 seconds.
- Full Lookbook remains manual with previous/next controls, keyboard arrows, and swipe.
- Redesigned the former plain four-step services area as "The MFM Method": a black-stone editorial panel explaining why the four stages matter, not simply listing generic steps.
- Maddy's supplied Paris portrait remains in place.
- Departure Edit remains the animated split-flap destination board.
- Inquiry, reviews, footer, and other dark surfaces were normalized from green to charcoal.

FILES
index.html
styles.css
script.js
assets/images/*
assets/images/affiliates-white/*.png

LOCAL PREVIEW
Open index.html directly, or serve the folder with any static web server.

PRODUCTION NOTE
The contact form still uses mailto so the static build works without a backend. It can later be switched to an AWS API endpoint without redesigning the form.

V18 refinements: larger desktop navigation/microtype, larger Maddy portrait and biography scale, deliberate spacing after the affiliate rail, slower/smoother Lookbook paper curl, CodePen-inspired editorial entrance motion, and Italiana + Cormorant Garamond typography inspired by the supplied CodeFronts reference.


V19 refinements:
- Restored Bodoni Moda for editorial reading text; Libre Caslon Display for large magazine headlines.
- Raised microtype sizes across desktop/mobile for readability.
- Enlarged Maddy portrait, especially on mobile.
- Added a clear ivory chapter break between MFM Method and Guest Book on mobile.
- Preserved the black-stone/ivory/brass editorial direction and existing page-curl lookbook.

V20 refinement
- Rewrites the lookbook intro as customer-facing editorial copy rather than implementation/proposal language.
- Adds a visible Instagram icon + @mfmluxurytravel link in Maddy's profile and the footer.
- Adds a new Instagram editorial section with a featured Paris post, a Scotland-stays reel card, and a third road-note card, styled to feel native to the MFM editorial site rather than an embedded social widget.


V21 additions
- Added one consolidated, animated MFM team chapter using the currently published team roster.
- Large editorial display typography now uses Libre Bodoni as a free/open web-safe approximation of the narrow high-contrast archival feel in the Balenciaga reference; body/editorial reading text remains Bodoni Moda.
- Team interaction is a single expanding editorial roster on desktop and a tap accordion on mobile. No fabricated team headshots were added.
