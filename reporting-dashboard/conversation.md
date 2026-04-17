# Steve EDM — Reporting Dashboard & Sales Deck Project

**Client:** Steve (EDM Media, steve@edm.media)
**Phone:** +1 (214) 435-3758
**WhatsApp JID:** `12144353758@s.whatsapp.net`
**Extracted on:** 2026-04-17

> See [`requirements.md`](./requirements.md) for the structured build spec.
> Reference assets in [`documents/`](./documents/).

---

## Project Summary

Steve runs EDM Media, a service for **microcap companies**. Core flow:
1. Takes a client's **press release / article / investor one-pager**
2. Rewrites it in an "algorithm-friendly" style to defeat the trading algorithms that attack press releases
3. Generates social media content around it and posts across platforms
4. Uses **Brand24** to pull social data / KPIs
5. After each campaign, sends the client a professional report

He's prototyped the whole workflow himself with ChatGPT (Google Sheets generator, HTML dashboard, set-up guide) and wants Autometa to turn it into a clean product.

### Two deliverables — must be treated separately

| | **Sales Deck** | **Reporting Dashboard** |
|---|---|---|
| Audience | Sales guys closing deals | Existing clients, post-campaign |
| Customization | **None** — standard, Steve does NOT want changes | Per-client, professional, "sleek" |
| Tech | Canva-style, few client-specific edits | Web dashboard; user pastes data into categories, report gets generated |
| Data flow | N/A | Steve manually pastes data in backend (form-style, like the one he emailed). No auto-scraping (for now). |
| Visible to client | N/A | Only the generated report (shared via link) |

### Timeline & pricing (agreed on call, 2026-04-15)
- **Working version**: 2–3 days
- **Finished product with his changes**: ~1 week
- Rate context: Autometa charges **$35/hr vibe coding** — Steve's earlier estimate was max $1,400

### Parked / future
- After dashboard ships: automate a **scraper** that pulls press releases from microcap companies and emails their contacts pitching the program
- Possible **video content creator** ("breaking news reporter") where a script is pasted and a speaker talks about the news — Steve surfaced this 2026-04-10
- Bonus non-work: Steve wants to take him to **Fort Worth for BBQ** when they meet

### Open question from Steve
- "Are you using Claude?" (2026-04-15 21:50)

---

## Documents Steve Shared

All authoritative assets are now in [`documents/`](./documents/). Structured in [`requirements.md`](./requirements.md).

### Authoritative specs (from Steve's email, 2026-04-15)

| File | Role |
|---|---|
| [`documents/EDM Signal Deck.docx`](./documents/EDM%20Signal%20Deck.docx) | **Source of truth for the sales deck** — full slide-by-slide (20+ slides: pain → system → Signal Score™ → packages → close) |
| [`documents/EDM Signal Report System.docx`](./documents/EDM%20Signal%20Report%20System.docx) | **Source of truth for the reporting dashboard** — brand kit, colors (`#00E5FF`, `#7B61FF`), fonts (Montserrat/Inter), 12 main + 2 bonus slides, team workflow |
| [`documents/EDM Client Report - NXPL.pdf`](./documents/EDM%20Client%20Report%20-%20NXPL.pdf) | **Filled example** (NextPlat Corp / $NXPL, 2026-04-14). Use for *content reference* only — Steve himself said "parts missing"; the System doc defines the visual target. |

### Earlier WhatsApp-sent drafts (superseded by the email versions above)

Steve sent these on 2026-04-13 via WhatsApp, then re-sent the consolidated versions via email:

| Date | Filename | Note |
|---|---|---|
| 2026-04-13 23:02 | `EDM_SIGNAL_Client_Report_Template 2.pdf` | First template |
| 2026-04-13 23:04 | `Report Template.docx` | "This is the template" |
| 2026-04-13 23:05 | `Sample results for client reporting.docx` | "Content generated to fill in to the report" — Steve asked for help improving its prompt/script |
| 2026-04-13 23:30 | `Proposal Template.docx` | Matching proposal template |

### Related inbound
- **Email (2026-04-15, initially in spam)** from Steve to `Adilmalik393@gmail.com` — the two authoritative docs above + backend form spec
- **Zip file** (2026-04-08, via Gmail) — Steve's pre-pivot ChatGPT mapping: Google Sheets content generator + code + dashboard HTML + setup guide

---

## Conversation Log (relevant messages, 2026-04-08 to 2026-04-15)

### 2026-04-08 — First mention of the project

> **Steve** 20:41 — He bud does your team create nice sales decks?
> **Me** 21:20 — We can bud.
> **Steve** 21:25 — I have a service I've mapped out using chat gpt and it's putting everything together for me. Google Sheets content generator, some coding, a dashboard html and a set up guide.
> **Steve** 21:25 — If I send you the zip file can you decipher n let me know what that would cost to set up?
> **Steve** 21:26 — I have a few sales guys who want a new product to sell
> **Me** 21:26 — okay. thats good. send me that.
> **Steve** 21:27 — Ok. One second. I'll email. What's best place to send pal?
> **Steve** 21:32 — Sent to your Gmail account bud.
> **Me** 22:07 — Okay let me check that up
> **Steve** 22:08 — Thank you bud

### 2026-04-09 — Scoping & pricing

> **Me** 22:50 — When do you need this ???
> **Steve** 22:51 — Whenever bud. Just trying to put it all together. What's your thoughts on it?
> **Me** 22:51 — I asked my guy. He said a week if the requirements are crisp clear.
> **Me** 22:51 — Can you make a video on how you currently doing it
> **Steve** 22:52 — Ok let me work on rhat for ya. How much you think?
> **Me** 22:52 — Max 1400 usd. Could be lower depends on how many hours
> **Steve** 22:53 — Ok hope it's lower. lol. Times are rough and this is new program
> **Me** 22:54 — Yeah but … we are charging 35 usd per hour for vibe coding services. He might do it in 2 days you know
> **Steve** 22:54 — Right now I use chat gpt for it all. To score the pr, rewrite it, then create the posts for the other social platforms.
> **Me** 22:56 — Just send a video bud and I will put my guy on to it
> **Steve** 22:56 — And I'm going to take you to Fort Worth for some bbq

### 2026-04-10 — Workflow clarification + video-creator idea

> **Steve** 19:58 — What do I send a video of bud for your guy ?
> **Me** 19:58 — Like what you currently [do] and how you are using those to generate content so that it's easier for team to understand what needs to be done
> **Steve** 20:00 — So I'm plugging in a company press release, article, or investor one-pager.
> **Steve** 20:00 — Mainly I'm using their press release
> **Me** 20:01 — Yeap can you make a small video on end to end
> **Steve** 20:02 — I need to figure that one out but yea would like to be able to quickly add those as well. Like a breaking news reporter.
> **Me** 20:03 — [audio response]
> **Steve** 20:05 — Ok sounds good buddy. Let me get you that over the weekend

### 2026-04-13 — Pivot + templates sent

> **Steve** 22:59 — Hey bud so I don't think I need the content generator bc I will need to customize that for each project. However, I would like a reporting template that I could use for each client. I've created it with gpt and can share it all with you if that's ok?
> **Me** 23:00 — Yeap sure bud
> **Steve** 23:00 — I am interested in maybe a video content creator tho? Where I can paste the script in and the speaker can talk about the news?
> **Steve** 23:02 — 📄 `EDM_SIGNAL_Client_Report_Template 2.pdf` (doc #1)
> **Me** 23:03 — Ahan. Can you share the complete report and the video and the script that you are talking about. So I can connect the dots
> **Steve** 23:04 — 📄 `Report Template.docx` (doc #2) — "This is the template"
> **Steve** 23:05 — 📄 `Sample results for client reporting.docx` (doc #3) — "And this is the content generated to fill in to the report"
> **Steve** 23:06 — There's a script in there. Maybe you can help me change the prompt so I can get a more detailed script?
> **Me** 23:06 — Yeah sure bud. When can we have a call to discuss this on detail
> **Steve** 23:06 — I'm available whenever
> **Me** 23:06 — Today I have few demos but tomorrow I am free
> **Steve** 23:07 — Ok. Put me down for mid morning cst?
> **Me** 23:08 — 10 AM CST tomorrow ?
> **Steve** 23:08 — Perfect!
> **Me** 23:09 — Invitation sent
> **Steve** 23:13 — You sent to steve@edm.media
> **Steve** 23:30 — 📄 `Proposal Template.docx` (doc #4) — "Also a matching proposal template"
> **Me** 23:36 — Let's discuss tomorrow bud in detail
> **Steve** 23:36 — Yep. Sounds like a plan. Ty

### 2026-04-14 — Meeting kept rescheduling

Morning slot 10:15 CST got delayed by traffic, then evening retry failed on internet. Late night Steve sent:

> **Steve** 22:32 — Hey buddy the pin is not working
> **Steve** 22:33 — Let's schedule for tomorrow
> **Me** 22:36 — Bud the internet is playing hide and seek [link: internet-degradation-likely-during-submarine-cable-maintenance]
> **Steve** 22:36 — Really just need to try to get these templates made for easy plug and play
> **Me** 22:37 — That's the issue bud
> **Steve** 22:37 — Ouch.
> **Steve** 22:58 — 📄 `EDM Client Report - NXPL.pdf` (doc #5) — "There are parts that are missing but I'm looking for something more professional to send to clients"

### 2026-04-15 — Call + follow-up (substantive scope alignment)

**21:27–21:37** — Steve emailed again, went to spam (`Adilmalik393@gmail.com`):

> **Steve** 21:27 — Shot you an email. Want to look at those then give me a call ?
> **Me** 21:33 — Hi bud. Where did you send the email? Didn't get it
> **Steve** 21:34 — Adilmalik393
> **Me** 21:35 — Signals dashboard ? That's from 8th April
> **Steve** 21:35 — Just sent one. Today. Maybe spam
> **Steve** 21:36 — That dashboard would be very slick for reporting
> **Me** 21:37 — Yeah it was in spam

**21:38–21:44** — Feasibility + KPIs + Brand24:

> **Me** 21:38 — Reporting dashboard where we could create slides … Based on this system. Correct ?
> **Steve** 21:38 — Yes. What you think?
> **Me** 21:39 — Yeah could be done. Not really max one week work. But could be tried in 2/3 days
> **Steve** 21:39 — Expensive? And how about the design of that deck?
> **Me** 21:40 — But to finish the product and the changes that you ask would be completed in a week
> **Steve** 21:40 — Ok ok. About how much for deck and dashboard?
> **Steve** 21:41 — Need it very sleek and professional
> **Me** 21:41 — That's what I am saying bud … very sleek and professional we can do in a week. But need a use case first. To make sure developer is not blocked or doesn't build a wrong thing
> **Me** 21:42 — Have you created any deck or report using this system ?
> **Steve** 21:42 — Nope. All freshly created this week. After talking with associates
> **Me** 21:42 — How do you envision user would provide the data ??? Or the agent has to search it ?
> **Steve** 21:43 — No we could add it manually in a backend kinda like the form I sent you via email. It has all the stuff there. All the kpis
> **Steve** 21:43 — Also have a social tool that pulls this data. **Brand24**

**21:46–21:51** — Scope nailed down:

> **Me** 21:46 — Basically user comes in and add the data and these two deck and report are generated with a specific template and user should be able to download that. Correct ?
> **Steve** 21:46 — 📄 `EDM Client Report - NXPL.pdf` (doc #6, same as #5)
> **Me** 21:46 — And then user could create more as well for new client
> **Steve** 21:47 — Well the deck is standard. No need for any changes there. That's a sales deck that I really dont want to change. That's for the sales guys to help them close deals
> **Steve** 21:48 — The dashboard I myself will grab the info and paste in to each category so the nice report gets made.
> **Me** 21:49 — Dashboard is for you basically
> **Steve** 21:49 — Dashboard is to share with client. So they can see what all we are doing.
> **Steve** 21:50 — Are you using Claude?
> **Me** 21:50 — And what would be visible to client? Client report only ???
> **Steve** 21:51 — Yes just the report that shows all the content and other metrics on that sample report in today's email.

**21:52–21:55** — Delivery model + future scraper:

> **Me** 21:52 — And does [client] request for a report on the dashboard or you send a link to dashboard with their report only
> **Steve** 21:52 — Once we get this I'll want to talk with you about automating a scraper that will go grab all the press releases from microcap companies and send out an email to their contact pitching this program.
> **Steve** 21:52 — I'll send them the link
> **Steve** 21:52 — After each campaign
> **Me** 21:54 — So basically
> 1. You close a client and have an agreement with him to run some campaign for him.
> 2. Then you start a campaign and want to share the report of what you are doing and have done with clients. Here you want a nice reporting dashboard which will convey to client all the numbers that are coming out of your advertisement campaign.
>
> **Steve** 21:55 — Correct. The numbers and the content. We basically take their press release and rewrite it to a more algorithm friendly style and then create content around it to post on social platforms.
> **Steve** 21:55 — The big issues is fighting the trading algorithms that attack these press releases. So it's a new angle to increase awareness
> **Steve** 21:55 — The fist thing I sent was a sales deck. Not part of reporting dashboard

**21:56–22:01** — Closing:

> **Steve** 21:56 — I sent a canva style mock up of a reporting template. However I forgot about that dashboard which is much more professional looking.
> **Me** 21:58 — So sales desk is standard and it just has to created via canva and only few details charges for client and not part of dashboard at all
> **Steve** 21:58 — Even though I office out of a shed I'm trying to look like I'm in trumps office. lol
> **Steve** 21:58 — Correct the deck is standard. No need for customization once done
> **Me** 22:00 — Okay bud will start tomorrow
> **Steve** 22:01 — Thank you thank you 🙏
