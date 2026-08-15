MFM Editorial V110

Built from V109.5.

V110 ADVISOR-MATCH UPGRADE
- Expanded Advisor Match from three to four questions.
- New fourth question asks what the traveler values most in the planning relationship, using seven specialty descriptions grounded in the existing Team bios.
- First three questions continue to describe the trip and feed the inquiry handoff; the fourth planning-style signal is intentionally decisive.
- Full combinational audit: 4 traveler choices x 3 pace choices x 4 travel-focus choices x 7 planning-style choices = 336 paths.
- Distribution is exactly even: 48 winning paths for each of Maddy, Neelie, Amy, Lisi, Morgan, Ellen, and Rachael.
- Result now shows a compact summary of all four answers above the advisor bio; the advisor bio remains pulled from the Team section.
- Accepted quiz matches add the fourth-answer planning preference to the generated inquiry context while preserving the independent Departure/Voyage/advisor state system.

MFM Editorial V109.5

Built from V109.5.

V109.5 DEMO ENTRY FLOW
- Restored the private-demo introduction after successful access-key entry.
- First-time/incognito sequence is now: Access key -> “Hi, my name is Stanley Wirawan” introduction -> View demo.
- Successful unlock forces the introduction so the portfolio disclaimer/context cannot be skipped accidentally.
- If access is already stored, the introduction still appears automatically until the visitor explicitly chooses not to see it again.
- Footer “Demo notice” continues to reopen the introduction at any time.

MFM Editorial V109.5

Built from V109.2.

V109.5 UX ENHANCEMENTS
- Automated form actions now respect user-entered content: a manually typed destination is not overwritten by a later Departure/Voyage click, and a substantially rewritten message is never replaced by automation.
- If the visitor merely appends a personal note to the generated message, that note is preserved while quiz/journey context updates around it.
- Manual advisor changes still remove the exact quiz-owned recommendation lines while preserving all unrelated edits and journey details.
- Added a compact “Your inquiry so far” state summary showing the active advisor, selected Departure/Voyage, and whether advisor-match context is included.
- Added source hints to auto-filled Destination and Message fields so visitors understand what was added and that they can edit it.
- Added Back controls and a readable “Question X of 3” indicator to the advisor-match quiz so a mis-tap does not force a restart.
- Restored a truly neutral No Preference state: the advisor card now shows the team collage and “Let us make the match” rather than visually implying Maddy is already selected.
- Choosing an advisor no longer opens the optional Phone / Preferred Call Time panel automatically.
- When custom message copy is protected, selected quiz/journey context is still included as structured metadata in the prepared email so user intent is not lost.

MFM Editorial V109.2

Built from V109.1 / V108.2.

V109.2 inquiry-state changes:
- Advisor Match, Departure/Voyage selection, and manual advisor choice now operate as independent form states.
- Accepting a quiz match adds the full advisor-match message with the matched advisor name correctly spaced (for example, Amy Gennaro).
- Adding a Departure or Voyage after the quiz preserves the matched/preselected advisor and appends the journey context instead of replacing the quiz context.
- Running the quiz after a Departure/Voyage keeps the specific selected destination instead of replacing it with the quiz's generic destination hint.
- Manually changing the preferred advisor removes only quiz-owned message lines and the quiz-only destination hint; any selected Departure/Voyage and edited journey details remain intact.
- Selecting a new Departure/Voyage replaces only the journey-owned portion while leaving the advisor preference unchanged.

V109.1 BASE CHANGES
- Fixed advisor picker scrolling on small screens without changing its design.
- Added the supplied three-question Advisor Match quiz inside the Inquire section.
- Quiz result pulls the matching advisor bio directly from the Team card wording.
- “Start with this match” uses the existing advisor-picker behavior and portrait animation.
- Quiz scrolls to the form and focuses Name.

MFM Luxury Travel — Editorial Website V108.2

V108 is a QA/consolidation release built from V107. It preserves the approved luxury couture-ticket and Maddy Lens direction while making the experience quieter, more credible, more responsive, and easier to maintain.

V108 HIGHLIGHTS
- Froze the historical V17–V107 cascade into styles-legacy-v107.css; all new work now lives in the focused styles.css experience layer.
- Consolidated the live font load to Libre Bodoni, Manrope, and Cormorant Garamond.
- Increased tiny navigation/utility typography and improved gold-on-cream readability.
- Removed the redundant Departure ticker and Voyage sound control so the split-flap board remains the signature interaction.
- Rewrote interface-explainer copy into customer-facing luxury editorial language.
- Reframed stale 2025 voyage inventory as evergreen seasonal voyage directions with a clear seasonal-inspiration note.
- Added same-document View Transition support for Voyage ticket changes, with a reduced-motion fallback.
- Added scroll-led active-stage storytelling to the MFM Method instead of another looping animation.
- Simplified the inquiry experience: core trip fields first, optional phone/call/advisor details behind progressive disclosure, and a compact advisor receipt instead of another large team card.
- Kept the full flexible paper curl on desktop; phones now use a lightweight editorial page transition to reduce GPU work.
- Converted all 20 lookbook page renders to high-quality 1700x2200 WebP and removed unused duplicate lookbook assets, cutting the project footprint substantially without reducing page dimensions.
- Added content-visibility containment to heavier downstream sections.
- Improved mobile Voyage-board scale, ticket metadata spacing, anchor clearance, focus visibility, and overflow handling.
- Removed the automatic second legal/demo interruption after access; the independent-concept notice remains available from the footer.

QA CHECKS COMPLETED
- JavaScript syntax check passed.
- Desktop and 390px mobile runtime interaction checks completed with zero page errors.
- No horizontal document overflow at 1440px or 390px.
- Departure/Voyage toggle, one-active-voyage behavior, optional inquiry panel, and mobile lookbook page turn tested.
- No duplicate HTML IDs and no missing local asset references.

The access gate remains client-side because this is a static portfolio demo. It discourages casual access but is not server-side authentication.

Open index.html locally or deploy the folder to static hosting.

V108.2 MICRO-POLISH
- Re-encoded the original 1700×2200 lookbook artwork as lossless WebP; validation confirms the decoded pixels are identical to the source PNGs, avoiding the blur from V108's lossy compression while reducing image weight.
- Added near-viewport and next-page prewarming so the full-sharpness magazine feels faster without loading all 20 pages up front.
- Restored the personal advisor portrait card as the form's second-column anchor while retaining the cleaner V108 progressive contact details.
- Tightened inquiry spacing and returned the advisor selector to the main conversation flow.
- Refined advisor changes with a blur-free exposure/scale transition and restrained editorial light sweep.
- Prewarms team portraits only when the inquiry section approaches the viewport.



--- Historical project notes retained below ---

MFM Luxury Travel - Editorial Website V58

V28 rebuilds the Maddy Lens lookbook as a true 25-page travel magazine based on the supplied editorial mock.

Key V28 changes:
- completely redesigned 25-page Maddy Lens PDF
- vector/HD typography: no screenshot text in the finished magazine
- high-resolution source photography and clean crops from supplied imagery
- page artwork rendered at high resolution for the website flipbook
- no stretched 200x200 portrait on the editor letter
- responsive page spread with the existing slow paper-turn interaction
- PDF download included at assets/lookbook/Maddy-Lens-Issue-01.pdf

Open index.html locally or deploy the folder to static hosting.


V37: Added private invitation-only access gate before the portfolio disclaimer. Correct access key is provided separately by the site owner. Successful access is remembered in localStorage on that device. Note: this is a client-side gate for static hosting, not server-side authentication.


V56 UPDATE
- Added luxury cruise Voyage Board inspired by nostalgic split-flap departure boards.
- Added four selectable curated voyage rows.
- Added expanding/layered luxury voyage cards tied to each selected row.
- Added opt-in mechanical click sound (off by default).
- Added keyboard navigation and responsive mobile layouts.


V57 UPDATE
- Refined the cruise experience into a more editorial two-column layout with stronger spacing from the Departure Edit section.
- Enhanced the voyage board styling to feel closer to a luxury split-flap selector while keeping row clicking and sound toggle.
- Rebuilt the voyage cards with richer itinerary details, suite information, supporting photography, and layered-paper depth.
- Added scenic stage artwork behind the cruise board/card composition for a more elevated cruise page moment.
- Plan This Journey and View Voyage Details now jump to the inquiry form and prefill the Tell us a little more field with a voyage-specific template.
- Cruise CTA also prepopulates the destination field for faster inquiry completion.


V58 UPDATE
- Removed the scenic background behind the cruise board and voyage card.
- Removed the fake stacked-paper card layers; only one clean active voyage card is shown.
- Restored and emphasized the mobile Plan This Journey CTA.
- Kept voyage-specific prefill for destination and Tell us a little more.
- Rebuilt cruise board labels as individual split-flap character cells with staggered mechanical flip animation.
- Tightened mobile card height and removed the redundant second image so CTA appears naturally without excessive scrolling.


V59 UPDATE
- Combined the former Departure Edit and Voyages sections into one unified Curated Edit section with a Departure/Voyages toggle.
- Added a matching editorial detail card for Departure Edit so both toggle states now have a board and a supporting card.
- Simplified the voyage card design by removing the extra corner image and noisy layered background treatments.
- Improved mobile sizing and readability for both boards, especially the voyage selector.
- Restored prominent Plan This Journey CTAs and kept the prefilled inquiry-form behavior for both departures and voyages.


V60 UPDATE
- Returned the unified Curated Edit section to a dark/black editorial background so it separates clearly from the cream sections around it.
- Enlarged and re-proportioned the mobile voyage board; voyage and ship now stack cleanly instead of cropping.
- Refined the destination and voyage cards with more editorial typography, cleaner rules, better spacing, and a single CTA.
- Added a more polished toggle entrance animation and subtle luxury glint treatment.
- Inquiry textarea now auto-grows to fit the prefilled content and no longer shows an internal scrollbar.
- Removed the redundant second voyage button; Plan This Journey remains the single primary action.


V61 UPDATE
- Restored a dedicated editorial intro for Voyages so the section keeps the large narrative left panel the user preferred.
- Centered the board and detail card layouts inside the Curated Edit stage.
- Added Previous / Pause Autoplay / Next controls to the Departure board.
- Fixed departure titles to use proper title case instead of the accidental all-caps display.
- Restyled the Departure detail card to feel more like a luxury boarding pass and the Voyage detail cards to feel more like cruise passes.


V62 UPDATE
- Corrected the departure/voyage visual language so departures read with an air/boarding-pass tone and voyages read with a cruise/voyage-pass tone.
- Reduced heading/board collision in the Voyages editorial layout and tightened centering of the main board + card composition.
- Increased mobile voyage-board legibility with larger row heights and larger split-flap character sizing.
- Reframed both cards around a simpler luxury-client promise: clear essentials, easy planning, and a single polished CTA path.


V63 UPDATE
- Enlarged the voyage selector substantially on mobile by letting rows stack and wrap, making the split-flap labels much easier to read.
- Switched the shared title dynamically with the toggle, so Voyages now uses “Voyages worth remembering.” instead of stacking The Curated Edit above it.
- Reduced voyages heading collisions by shrinking the left intro title, widening the gap, and tightening the board/card max width.


V64 UPDATE
- Removed the extra left-side voyages wording stack so the Voyages view relies on the shared heading and feels cleaner.
- Enlarged the voyages board to feel closer in scale to the departure board, with a much more legible mobile layout using three stacked lines per sailing.
- Restyled both the Departure and Voyage detail cards as more literal luxury boarding passes with stronger editorial serif typography and a more refined pass structure.


V65 UPDATE
- Removed the remaining extra voyages-side wording and let the board/pass use a cleaner full-width composition.
- Made the voyage board denser, larger, and more legible on mobile with a simpler stacked-line treatment.
- Tightened the voyage pass layout to remove empty space and switched the pass labels/typography to a more editorial luxury treatment.
- Simplified the pass-top label treatment so the awkward boxed strip no longer dominates the top of the card.


V66 UPDATE
- Added a more editorial luxury serif voice for the pass with Cormorant Garamond and stronger typographic hierarchy.
- Fixed the mobile pass duplication by explicitly hiding all non-active voyage cards.
- Made the voyage pass more literal as a boarding-pass style piece with clearer boarding-pass labeling and denser information layout.
- Refined the mobile board again for larger, easier-to-read rows and a cleaner stacked presentation.


V67 UPDATE
- Enlarged the voyages board again on desktop and mobile for stronger readability.
- Reduced pass-header text collisions by simplifying spacing and hiding the redundant mobile boarding-pass tag.
- Upgraded the itinerary and handling typography to a more refined editorial luxury feel.
- Ensured only the active voyage pass card displays so mobile no longer shows stacked duplicate passes.


V68 UPDATE
- Final luxury boarding-pass typography pass: cleaner pass labels, stronger title hierarchy, and more refined itinerary/handling copy.
- Removed the redundant boarding-pass header text that was causing collisions in the pass.
- Enlarged the voyages board again on desktop and mobile so the selector is much easier to read.
- Tightened the mobile board layout and increased flap-character size for better legibility on smaller screens.


V69 UPDATE
- Final cleanup pass only: aligned the shared heading, toggle, board, and pass to a cleaner centerline.
- Refined vertical spacing between the voyage selector and active pass.
- Balanced boarding-pass proportions and reduced dead space without changing the V68 concept.
- Tightened tablet and mobile breakpoints to avoid clipping, side-scroll, and awkward card proportions.


V70 UPDATE
- Removed the remaining boxed treatment from the pass-top label area.
- Refined the smaller note / handling typography to feel more luxury-editorial and less basic.
- Increased contrast and character size on the voyages board so it reads closer to the departure board.
- Corrected the Norwegian Fjords card image so it no longer uses the Japan/Fuji visual.


V71 UPDATE
- Removed the remaining pass-top boxes entirely and kept only elegant microcopy.
- Upgraded pass typography and balanced the itinerary / handling layout.
- Slowed and smoothed card / board transitions for a more premium feel.
- Strengthened the “hot travel now” positioning across departure and voyage states.
- Increased mobile voyage-board readability.


V72 UPDATE
- Removed the remaining pass pseudo-boxes and simplified the pass header treatment.
- Switched the pass typography to a more editorial/luxury mix and refined list styling.
- Removed blur transitions and replaced them with softer fade/slide refresh animations.
- Widened the voyage section so the board and pass feel closer in scale to the departure board.
- Increased voyage-board readability on desktop and mobile.


V73 UPDATE
- Hid the extra top stamp line above the hot-now departure/voyage copy.
- Swapped the pass typography to a more obviously editorial luxury mix (Prata/Fraunces/Cormorant).
- Added a visible MFM watermark background treatment across the travel-edit section and pass copy panels.
- Smoothed the departure card changeover with a gentler fade-out/fade-in refresh.
- Enlarged the voyage board and introduced a readable mobile horizontal glide instead of crushing the board.


V75 UPDATE
- Reverted the heavy background treatment and returned to a quieter dark backdrop.
- Removed the extra small pass boxes and duplicate note-box behavior that caused collisions.
- Restyled both departure and voyage cards as long boarding-pass style layouts.
- Swapped in a more fashion-editorial typography mix using Prata + Cormorant.
- Enlarged the voyage board and simplified the departure animation to avoid the stuck/choppy state.


V76 UPDATE
- Reframed the note voice to feel more personal: Maddy's lens / Maddy's recommendation.
- Removed leftover pseudo boxes that were still crowding the cards.
- Made the voyage board noticeably larger and brighter on desktop and mobile.
- Tightened the voyage details into a cleaner non-colliding layout.
- Pushed typography further toward a sharper editorial Bodoni/Cormorant direction.


V77 UPDATE
- Voyage board enlarged again with stronger contrast and larger split-flap cells.
- Typography pushed further toward luxury editorial / magazine styling.
- Recommendation block rebuilt so content stays inside the box and no longer collides.
- Voyage / departure detail grids restructured to avoid text overlap.
- Departure card refresh animation smoothed and shortened to feel less choppy.


V78 UPDATE
- Curated Edit section background shifted back to a warm cream paper tone.
- Voyage recommendation box redesigned into cleaner title-case tags / pills.
- Voyage card proportions aligned more closely to the long boarding-pass feel of Departure.
- Voyage detail area repaired to stop note-block collisions and box artifacts.
- Typography pushed further toward luxury editorial styling with Prata + Cormorant/Bodoni pairing.


V79 UPDATE
- Restored the black stone Curated Edit background.
- Rebuilt the voyage board to read more like the departure board, but as a list.
- Forced the voyage board to stay horizontally readable on small screens instead of stacking into a broken layout.
- Changed voyage card type styling to match the editorial feel of Departure.
- Reworked Maddy's recommendation into cleaner Maddy's lens pill tags.
- Softened both departure and voyage transitions to reduce choppiness.


V80 UPDATE
- Enlarged the Maddy's lens column on both departure and voyage cards.
- Changed the departure Maddy's lens content into softer roster-like pill tags instead of one all-caps line.
- Pushed the voyage board closer to the departure-board rhythm while keeping it list based.
- Kept the voyage board readable on small screens by preserving the desktop layout with horizontal scrolling instead of a broken stacked format.


V81 UPDATE
- Made the voyage board follow the departure-board language much more literally: same dark split-board feel, clearer contrast, larger flap cells, and stronger active row treatment.
- Preserved the voyage board as a horizontal scroll board on small screens so it stays readable instead of collapsing into a broken stacked layout.
- Enlarged both Maddy's Lens / Recommendation side columns and kept them as softer editorial pill notes.
- Tuned departure refresh and voyage flap transitions to feel slower and smoother.


V82 UPDATE
- Reworked the Maddy's Lens / Recommendation blocks away from pill chips and into small rectangular ticket-style tags.
- Made the voyage selector follow the departure-board language much more literally, with stronger contrast and a fixed horizontal-scroll board on smaller screens instead of collapsing into a broken stack.
- Tuned both departure refresh and voyage selector transitions again for smoother motion.


V83 UPDATE
- Reworked the voyage board structure and styling to follow the departure board language much more closely.
- Rebuilt the Maddy's Lens blocks into more literal boarding-pass inspired ticket fields instead of pill chips.
- Smoothed both the departure card refresh and voyage row transitions again.


V88 UPDATE
- Removed the Editorial Note heading and unified both departure and voyage note blocks into the same Maddy's Lens format.
- Rebuilt the voyage board styling so it follows the departure board structure more closely and behaves better on small screens.
- Smoothed the departure and voyage transitions a little further.

V98 CORRECTION
- Re-locked Departure and Voyage cards to the approved couture-ticket mock instead of reinterpreting it.
- Restored one-active-voyage-card behavior so inactive voyage cards no longer stack down the page.
- Departure and Voyage now share the same ticket shell, ivory paper, antique-gold frame, oxblood accents, medallion, right ticket notch, perforation rail, concierge stub, metadata compartment, and CTA plaque.
- Removed legacy boarding-pass labels and pseudo-elements that conflicted with the approved mock.
- Mobile keeps the same visual language while stacking the card safely for readable typography and controls.

V100 CORRECTION
- Separated the Maddy's Lens crest from the title into its own ornament row and removed the leftover pill/background styling from the title label, eliminating the collision.
- Restored Voyage split-flap characters to the exact Departure board scale and typography instead of compressing four rows into the height of one Departure row.
- Kept Voyages as a four-row selectable list; the board is naturally taller because it contains four sailings, while the visual density now matches Departure.
- Preserved the readable two-line mobile Voyage layout and all existing selector, sound, rolling overflow, and card interactions.
