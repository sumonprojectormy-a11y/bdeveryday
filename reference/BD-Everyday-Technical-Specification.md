# BD Everyday technical specification

## 1. Reference and reproduction contract

The reference is **BD Everyday — Homepage Demo v44**, commit `252d2ce22970f39f3191bc8c5e761e8e2833670a`. The source commit matches the saved Sites version. The public custom domain could not be independently inspected. This specification describes the saved implementation. Database contents, the runtime owner configuration and live browser rendering were outside the source evidence available for this extraction.

Use this document with **BD-Everyday-Blueprint.zip**. The ZIP has the complete tracked reference source and assets for all four Sites, a generated path/fixture inventory, and checksums. Treat the ordered cascade in `reference/news/dist/newspaper-theme.css`, HTML render functions, original brand artwork and ordered arrays as normative for literal design values, markup, copy and fixture records. The three companion demos each keep their complete inline CSS, markup and data in their own `dist/index.html`. Future requirements in sections 7–8 describe the proposed full-stack conversion.

| Source | Version and commit |
|---|---|
| News portal | 44 · `252d2ce22970f39f3191bc8c5e761e8e2833670a` |
| Comparison | 1 · `e1a49f366c9f2344689b41e1530c6b5550318fa9` |
| Jobs and opportunities | 1 · `823b621091a342caa766fbcc7073adacce7cd377` |
| Shop | 1 · `be72af38636f0b5acdc78da49d8293769c6a8cf7` |

## 2. News portal UI and responsive behavior

| Element | Required reproduction |
|---|---|
| Global canvas | Zero body margin. System UI sans-serif at 16px/1.65 on the body. Preserve individual font-family overrides including the Georgia serif treatment where declared. Use the exact CSS cascade for weight, line height, letters, responsive type, and OS font fallback. Main wrap is `min(1180px,92%)`. Preserve CSS system colors where declared. |
| Palette | White light canvas `#ffffff`, ink `#171717`, light headline `#171717`, red actions `#ab1829`, dark headline `#f5f5f5`, dark actions `#ff9ba4`. Breaking strip uses `#fff5f6`, `#e7c9ce` edge and `#b21a2d` label. Facebook icon uses `#0866ff`. Preserve all selector-level background, outline, hover, focus, border, shadow and alpha values. The exact palette inventory accompanies the raw stylesheet. |
| Global DOM order | Skip-to-news button, reserved header slot, masthead and search, main navigation, conditional breaking row, main content with shortcut bar first, footer, all-sections dialog, video dialog, privacy notice, runtime scripts, back-to-top control. |
| Masthead | Use original masthead SVG and original favicons, including ICO and 180px touch icon. Bengali slogan centered beneath the wordmark and translated in EN. Header provides date, search, language, reader profile, day/night toggle and menu. Date is current Asia/Dhaka time rendered with the edition locale. |
| Mobile header | At ≤720px use a single horizontal masthead, 10px outer gutters, 6px vertical padding, logo max 214px, and four aligned 44×44 slots for search, globe, theme and menu. Theme shows 20px masked crescent/sun. Controls use a single rounded group, with red menu tile `#a7192b`. Hide date and profile from the masthead; profile remains in the menu. Search row expands on demand, focuses input, closes on Escape, valid submit or breakpoint change. Horizontal nav scrolls with hidden scrollbar, dark `#1b191a` background and red `#dd3548` active underline. |
| Floating header | Switch to fixed when the slot bottom crosses the viewport top. Reserve the previous slot height. Use z-index 3, max-height 52vh, 5px mast padding, shadow and 180ms reveal for normal motion. Compact logo width clamp 105px/24vw/180px, reduced to max 170px on mobile. Hide slogan and date while floating. Reset geometry on resize, pageshow and mobile search state change. |
| Main navigation | Home → Latest → Bangladesh → Politics → District → World → Business → Sport → Diaspora → Entertainment → Opinion → Lifestyle → Live. Mark the applicable path current. |
| Breaking | Prepend first active live event, then published breaking flags, browser draft breaking flags and the three sample IDs `bangladesh-brief`, `malaysia-arrival`, `dhaka-journey`. Manual previous/next wrap. Hide controls below two entries. Demo headlines are labelled. |
| Shortcuts | Live → My district → Paper → Video → Photos → My edition → Briefing → Tips. Preserve SVG paths, nav destinations and order. Use four columns from 961px, three through 960px, two through 600px. |
| Footer | Original footer SVG with slogan, followed by round Facebook glyph linking to the existing Facebook share URL. Three groups in order: News (Bangladesh, District, Diaspora, Live), For readers (Paper, Archive, Saved, My edition), BD Everyday (About, Privacy, Connections, Newsroom). Preserve locale and original SVG. |
| Back to top | Show at scrollY ≥320. Fixed lower left with safe-area offsets, 46px circle, 23px SVG arrow. Smooth scroll and instant scroll in reduced motion mode. |
| Dialogs | All-sections menu has close form, featured links, four department groups, reader and brand groups. Selecting a link closes it. Video dialog has title, close, native player controls, poster, description and transcript disclosure. Set source then attempt play. On close pause, remove source and reload player. |
| Responsive cascade | Retain every query in source order including 380, 585, 600, 610, 690, 720, 850, 851, 960 and 961px declarations and every inline media rule. Include print, motion preference, focus-visible, night classes and intrinsic CSS grid layouts. Compare the original and port at both sides of each query. |

Menu order within groups is encoded in `menuDirectory()`. Featured links are Live, Briefing, Paper, Video, Photos, Archive, My district, Tips. The four department groups are Top news, Business and education, Life and culture, Opinion and features. Reader links are Profile, Saved, My edition. Brand links are About, Privacy, Connections, Newsroom. Preserve Bengali and English strings from the reference.

### Homepage content order

1. Newspaper front. Left lead has kicker, prioritized image, category, H1 and summary. Use the first shared story with a photo, falling back to `metro-day-planner`. Secondary column uses `market-basket-notes` and `kl-weekend-first` with duplicate-lead avoidance. Rail defaults to Latest and exposes Editor’s picks, six latest headlines or three picks, and a link to Latest.
2. District desk with `padma-evening`, `tea-walk-guide`, `khulna-river-route`, `sylhet-market-route`.
3. Video desk with one featured card and the remaining clips in fixture order. Each card includes poster, play glyph, duration, category and title.
4. Diaspora desk with `kl-weekend-first`, `riyadh-family-checkin`, `dubai-commute-notes`, `diaspora-singapore`.
5. Diaspora country directory in its original regional groups and link order.
6. Bangladesh desk with the first four eligible national stories excluding the lead.
7. Explainers and guides with `scorecard-explainer`, `world-source-reading`, `repair-or-replace`, `past-paper-study`.
8. Business, then Sport, then Education. Each desk takes up to four ordered stories in its category.
9. My district panel with saved-district selector and local result/empty state.
10. All news departments directory with first applicable newsroom headline or the configured demo roundup story.

A standard grid card is category label, linked headline and summary. A newsroom card prepends a linked thumbnail when enabled and a photo exists. Preserve the distinction between full desk cards, small rail headlines, search cards, district cards, section headings and department-directory entries. Exact structure and grid spacing are in `frontpage.js` and the stylesheet.

## 3. Route and behavior specification

The generated `inventories/news.json` enumerates every canonical section, diaspora route, localized sample article and utility. Preserve public path and query semantics, including bookmarks, external links and browser history.

| Route family | Existing user experience |
|---|---|
| `/`, `/en/` | Bengali default and English edition. Locale switch preserves route, query and normal hash. English is assembled at build time using authored copy and place maps. |
| `/[section]/`, `/en/[section]/` | Category heading, follow action, story grid. Latest includes all ordered stories and omits follow action. Diaspora adds country links. Slashless registered desk paths 308 to canonical trailing-slash paths. |
| `/country/`, `/en/country/` | Division, district and upazila cascading selectors. Upazila disabled before district. Supports `division`, `district`, `upazila` URL query IDs, filter submit, reset, district SVG paths and keyboard-accessible links, active path, color legend, map licensing, count, empty state and results scroll. Data IDs, names, relationships and geometry are preserved verbatim. |
| `/probash/[country]/` and English equivalent | Country and regional directory, story listing, saved residence integration. |
| `/article/[id]` and English equivalent | Server-rendered headline, summary and paragraphs, canonical and hreflang, OG metadata and image, then full interactive article with section link, byline/date or sample badge, image attribution where available, reading controls, save, share, print, correction notes, report-a-mistake disclosure and related stories. IDs match lowercase alphanumerics and hyphen, 1–96 characters. Old nonlocal story hashes redirect to permanent links. Local article hashes are browser-specific. |
| `#search/[query]`, entry via `?q=` | Trim, NFC normalize and lowercase. Split whitespace and require all tokens in the combined localized title, summary, keywords, body and category. Category selector refines the current result set. Empty and no-match results render a status message. |
| `#tool/live`, `#live/[id]` | Active and archived events. Individual timeline has event title/summary, live or ended status and newest-first timestamped updates with byline. Refresh when visible and poll every 20 seconds. Preserve fallback, empty and error states and sample live fixtures. |
| `#tool/paper` | E-paper date and morning/evening selects, numbered pages and adjacent navigation. Three fixture dates 2026-11-22, 23 and 24, four pages per edition. Preserve the arrays matching page positions to categories. Unsupported date has an empty-edition status. |
| `#tool/archive` | Publication date and category filters, latest three date shortcuts, default to newest available date, results and empty state. Group newsroom publication timestamps into Asia/Dhaka calendar dates. |
| `#tool/photo`, `#tool/video` | Photo galleries City then Rivers and greenery with caption, photographer, source, licence and related story. Video gallery uses the same source library and player as the home desk. |
| `#tool/briefing` | Up to five published stories from the current Dhaka date. Use ordered fixture fallback and sample edition label if no current stories. |
| `#tool/topics`, `#tool/mydistrict` | Choose district and country of residence. Expand category-follow disclosure, reflect followed count and maintain focus after updates. Personal feed OR-matches district, country or followed category. Show distinct no-preference and no-match states. |
| `#tool/profile`, `#tool/saved` | Local reader display name, saved-story list with an empty state, theme and text-size preferences. Saved list displays the matching original story records. |
| `#tool/tips` and article correction | Tips require location (160 max) and description (10–4000). Optional private contact (180 max) and JPEG/PNG/WebP photo ≤3 MiB. Correction requires valid article ID and description, with optional contact. Honeypot and same-origin checks. Show submit result in an accessible status region. |
| `#tool/about`, `#tool/privacy`, `#tool/connections` | Published explanatory copy, browser-storage disclosure, Facebook destination and social/app information. Privacy notice dismissal persists locally. |
| `#tool/desk`, `#tool/live-desk`, `#tool/inbox` | Existing authorized staff screens. They are driven by authenticated session and role. See section 6. |
| `/sitemap.xml`, `/robots.txt`, 404 | Include localized home/district pages, sections, countries and both localized article paths. Use fixture dates and database updates in lastmod. Canonical domain normalizes www on the custom domain. Localized 404 has artwork, search form, latest and home links. |

Sharing uses the permanent URL and article title via the available browser sharing mechanism with original clipboard and fallback behavior. Reading-time estimate is 180 words/minute, rounded up with minimum one minute and localized numerals. Enlarged text, follow state, save state and theme visibly update without changing the article path. Private readership preferences currently use origin-local JSON under `bdeveryday.*`; keys and actual client defaults are indexed in the ZIP.

## 4. Current data contracts and exact seed structures

The complete SQL lives in `reference/news/drizzle`. Types are SQLite/D1 types. ISO time strings and UUID values are produced by the Worker. The listed tables are complete.

| Table | Fields |
|---|---|
| newsroom_articles | id PK, title, summary, body, category, author, editor_email, district nullable, country nullable, image_type nullable, breaking integer default 0, status constrained to draft/review/published, created_at, updated_at, publish_at nullable |
| newsroom_staff | email PK, role reporter/editor. Owner is configured by `NEWSROOM_OWNER` and resolved separately. |
| live_events | id PK, title, summary, started_at, ended_at nullable |
| live_updates | id PK, event_id FK, headline, body, author, posted_at |
| reader_submissions | id PK, kind tip/correction, article_id nullable, location nullable, message, contact nullable, image_type nullable, created_at, reviewed_at nullable |
| article_notes | id PK, article_id, note, source nullable, created_at. Article ID can refer to a sample story. |

| Reference collection | Exact structure and source |
|---|---|
| Legacy stories | Positional `[id,section,title,summary,keywords,paragraphs,optionalPhoto]`. `dist/index.html` and generated bilingual article inventory. |
| Feature stories | Objects with ID, section, keywords, locale arrays `[title,summary,...paragraphs]` and optional location/date/photo fields as declared in `feature-stories.js`. Same file contains department roundup selectors. |
| Runtime stories | Public projection `id,title,summary,body,category,author,district,country,image_type,breaking,publish_at,updated_at`, adapted to the same tuple layout with shared marker. Newest live published articles are loaded up to 100. Shared records precede demo records in ordered listings. |
| Local draft hydration | Browser array objects read from `draftStories`, transformed into safe display tuples. Input fields consumed include id, title, category, summary, body and breaking. |
| Photos | Keyed records for Metro, Dhaka market, Kuala Lumpur, Padma and tea garden. Runtime tuple `[asset,alt,source,author,license,licenseUrl]`. Keep original images, localized alt/captions and licence terms. |
| Geography | Divisions `[id,name]`, districts `[id,name,divisionId,svgPath]`, upazilas `[id,name,districtId]`. Full geometry, English names and attribution are included. |
| Video | `{id,type,title,duration,description,src?,poster?}`, with path fallbacks `/videos/{id}.mp4` and `.webp`. The six nonfeatured clips are enumerated in the HTML and `additionalVideos()`. Preserve original clips, posters and exact durations. |
| Live samples | Exact event/update objects and IDs in `demo-live.js`. |
| Edition and UI seeds | Dates, category sets, edition page orders, header/shortcuts/menu/footer link placements, featured article placement IDs, photo group membership, static policies, translated copies and map colors are kept in the referenced source. |

Objects use `newsroom/{articleId}` for published article photography and `reader-inbox/{submissionId}` for private reader attachments. Preserve MIME and verify signature. Public article media requires published and due article status. Keep production inbox objects private.

## 5. Existing service contracts

| Endpoint | Method and contract |
|---|---|
| `/api/articles` | GET array of public projected articles, only published with publish_at ≤ now, newest first, up to 100. |
| `/api/articles/{id}` | GET one visible article, otherwise 404. |
| `/api/articles/{id}/english` | GET English text, optional `full` query flag for article body. See exact fallback and caching in `worker/translate.js`. |
| `/api/articles/{id}/notes` | GET public correction note, source and date list, newest first. |
| `/article-photo/{id}` | GET/HEAD visible article image, short public cache, missing status 404. |
| `/api/live`, `/api/live/{id}` | GET up to 80 events ordered active before ended, then newest first. Detail returns event plus updates ordered posted_at then id descending. |
| `/api/reader-submissions` | POST multipart tip/correction. Returns 202 after acceptance, including honeypot acknowledgments. |
| `/api/newsroom/session` | GET `{signedIn,role}`. Sites authenticated identity headers are the existing boundary. |
| `/api/newsroom/articles` | GET own rows for reporter and all for editor/owner. POST multipart create/update with validation and status authorization, responds `{id,status,publishAt}`. |
| `/api/newsroom/staff` | Owner-only GET assignments and POST upsert or remove via email and role. |
| `/api/newsroom/live` | Editor/owner POST JSON action start/update/end. Update/end require an active event and return 409 for an ended or unavailable event. |
| `/api/newsroom/inbox`, `/api/newsroom/inbox/photo?id=…` | Editor/owner GET up to 100 unread-first submissions, GET private photo, POST mark reviewed. |
| `/api/newsroom/notes` | Editor/owner POST article ID, note and optional HTTP(S) source URL. Note ≤1500 chars, source ≤1000. |

Exact HTTP validation, serialization, access rules, content types, errors and worker dispatch are included in `reference/news/worker`. Static video supports byte-range delivery. HTML response generates localized routes and article metadata from the original shells.

## 6. Existing newsroom dashboard

- Reporter sees own stories and creates/edits drafts or submits for review. Editing published records requires editor or owner. Editors can manage all stories, mark breaking, publish immediately, or set a scheduled timestamp. The dashboard article form accepts title ≤150, summary ≤300, body ≤16,000 and byline ≤100. District ID 1–64 is available for national/district. Country is available for Diaspora. Optional photos are JPEG, PNG, or WebP up to 3 MiB. Preserve chosen status, feedback, and upload state.
- Owner manages reporter/editor access by email. In production, derive author identity from authenticated staff and bind all mutation authorization to server-side roles.
- Live desk starts an event with title ≤150 and summary ≤500, adds an update with headline ≤150, body ≤5,000 and author ≤100, and ends the event. Existing archive remains readable and ended events reject further writes.
- Inbox lists review state, tip/correction, article reference where applicable, location, description, optional contact, private photo and review action. Correction publishing is a separate editor action with source URL and a public timestamped notes list.
- Preserve the current UI forms, labels, linked navigation, empty/error/success states and permission messages. Their literal implementations are in `newsroom.js`, `editorial.js` and `live.js`.

## 7. Production dashboard coverage and target model

The following fields are proposed for the conversion so editors can manage the source-driven sections without changing the public layout. Existing content keys remain stable. Add created/updated timestamps and audit actor IDs wherever staff edit records.

| Dashboard area | Required records and operations |
|---|---|
| Articles and translations | Keep existing newsroom fields. Add stable slug aliases, revision(version,article_id,author_id,change_reason,snapshot,published_at), article_translation(article_id,locale,title,summary,body,keywords,seo_title,seo_description,review_state), article_media(article_id,media_id,position,usage), optional upazila_id and canonical override. Preview/compare revisions, schedule, publish, withdraw and restore. Import demo flags and locale copy. |
| Media and galleries | media(id,kind,object_key,mime,bytes,width,height,duration_ms,poster_id,source_url,creator,licence,licence_url); localized media_copy(media_id,locale,alt,caption,description,transcript). gallery and gallery_item with locale title, position, media_id and article_id. Manage video ordering, poster, descriptions, transcripts and featured clip. Keep source credit visible. |
| Home and desk placement | layout_slot(key,locale,section_id,position,enabled,selection_mode,item_limit,heading,cta_label,cta_target); slot_item(slot_key,article_id,media_id,position,start_at,end_at). Initialize exact home defaults including lead photo priority, secondary stories, rail picks, local/diaspora features and explainers. Provide deterministic ordering and preview. |
| Categories and geography | category(id,public_key,position,enabled); category_locale(category_id,locale,label,description); place(id,kind,parent_id,key,shape_path,color); place_locale(place_id,locale,name); country_group and group membership with position. Preserve published geography identifiers, paths and attribution. |
| Navigation, settings and standalone copy | site_setting(key,locale,value), nav_group(key,locale,title,position), nav_item(group_key,key,position,label,href,icon_key,visibility). Cover masthead, footer, menu, quick links, social destination, icons and all legal/about text. Configure assets through media IDs, including light/dark variants only where specified. |
| Breaking, archive and paper | breaking_item(article_id,event_id,position,start_at,end_at,enabled); issue(id,issue_date,edition_key,locale,status,title); issue_page(issue_id,page_number,title); issue_placement(page_id,article_id,category_id,position). Import the existing dates and preserve numbered navigation. Archive queries actual local publication date/category. Briefing retains current automatic first-five behavior with optional ordered editorial placements. |
| Reader preferences | Maintain browser behavior for signed-out readers. If accounts are enabled, use reader_profile(user_id,display_name,district_id,country_id,theme,large_reading,locale), reader_saved(user_id,article_id,created_at), reader_follow(user_id,category_id,created_at), privacy_ack(user_id,policy_version,acknowledged_at). Define preference merge explicitly when signing in. |
| Workflow and moderation | user/staff profile, role assignments, article revisions, editorial action log, submission status history and private media access log. Support reviewing tips/corrections and managing live events from the original entry points. |

Use PostgreSQL or keep D1 with equivalent constraints, and use private object storage for uploads requiring review. Set unique constraints on localized paths and ordered slot membership, enforce valid publication timestamps and geography relationships, retain old permalink aliases through migration and invalidate front-page/section/article caches when scheduled content becomes due. Use authenticated session verification in a new hosting environment instead of accepting host-provided identity header names directly at the public ingress.

## 8. Companion Sites and their production requirements

The reference hosts these as separate single-page Sites. Preserve their distinct CSS, brand banners, root routing, control order, product rows, dialog markup and Bengali copy. The exact 17 demo listings and all styling are in the three source documents and the fixture inventory.

| Site | Existing experience | Production management and state |
|---|---|---|
| Comparison | Six products, four category chips including All, live text search across name/detail/keywords/category, featured and low/high sorts by price + delivery, count/no results and a modal offer table sorted by delivered cost. Offer store order is positional. Prices use Bengali BDT formatting. | Product(id,category_id,name,details,keywords,featured_order,active), store(id,name,website,active), offer(id,product_id,store_id,price_bdt,delivery_bdt,destination,source_url,observed_at,expires_at,status). Manage product/merchant data, timestamps and price/availability changes. Compute delivered cost in BDT. |
| Jobs | Five sample listings, category buttons (All, Jobs, Internships, Scholarships, Training), instant search, result counts, detail dialog and closing-this-week list. Demo date derives from a days-from-load offset using Dhaka week/day formatting. | opportunity(id,kind,title,organization,location,eligibility,keywords,description,apply_url,published_at,deadline_at,status,display_order). Admin creates, reviews, publishes, expires and orders listings. Display the real application deadline in Dhaka time and scope the weekly list to active postings. |
| Shop | Six products, category filter and live search, cart with quantity increment/decrement, cart item count, area-dependent delivery, subtotal/total, COD simulated form and success behavior. Existing cart is an in-memory Map keyed by product array index. Checkout clears the cart. | sku(id,category_id,name,description,keywords,price_bdt,stock,active,sort_order); delivery_zone(id,name,fee_bdt,active); cart(id,reader_or_session_id), cart_line(cart_id,sku_id,quantity), order(id,reference,customer_name,phone,address,zone_id,subtotal_bdt,delivery_bdt,total_bdt,payment_method,status,created_at,idempotency_key); order_line(order_id,sku_id,name_snapshot,unit_price_bdt,quantity). Staff manage catalogue, inventory, delivery zones, order lifecycle and fulfilment. Validate and compute prices/stock server-side and return a durable COD receipt. |

Keep the three source origins available or explicitly redirect them during domain cutover. The reference stores are independently deployed and should retain their external URLs until the final route mapping is approved.

## 9. Implementation acceptance

1. Build the reference with `node worker/build.mjs` from `reference/news`; deploy only the converted app when requested. Build the localized templates with their exact strings and generated route inventory.
2. Import all fixture records, preserve stable IDs, asset paths, logos, geography, rights attribution, ordering and original translations. Compare checksums for all reference assets before converting.
3. Compare visual captures at 360, 390, 720, 721, 960 and 1440px plus breakpoint neighbors for both editions and themes. Include mobile search expanded, docked header, menu/video open, print, localized article, map with selection, e-paper, footer and 404. Use the exact cascade, assets and fonts as the baseline.
4. Run route and interaction checks for article permalinks and aliases, browser back/forward, search and filter combinations, URL persistence, reader local storage, keyboard handling, video disposal, live polling, tip and correction workflows, scheduled publication, inbox-photo authorization and role boundaries. Exercise empty, failed, success and permission states.
5. Validate every dynamic public section through its administrative entry point and verify ordered output, cache refresh, canonical tags, alternative-language links and sitemap coverage. Exercise comparison total sorting, jobs deadline boundaries and duplicate COD checkout retries.

The blueprint includes source-defined detail and proposed production requirements. Production records, runtime configuration, browser visual comparisons and delivery on the custom domain require the target environment.
