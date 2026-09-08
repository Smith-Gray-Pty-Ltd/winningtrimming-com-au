import type { Payload } from 'payload'

import { h, p, root } from './helpers'

type MediaMap = Record<string, string | number>

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Managed sub-category service types, grouped by pillar.
 * Marine product types match the SEO-matrix product list.
 *
 * Each carries an `seoContent` body (150–300 words) that becomes the
 * primary indexable content on the service-type landing page.
 */
const serviceTypeData: {
  title: string
  pillar: 'marine' | 'automotive' | 'caravan-and-rv' | 'trade-and-industrial' | 'commercial'
  intro?: string
  seoContent?: string
  keyFeatures?: string[]
}[] = [
  // ── Marine product types ──────────────────────────────────────────────
  {
    title: 'Weather Covers',
    pillar: 'marine',
    intro: 'Custom weather covers built to protect your vessel from sun, rain and salt.',
    seoContent: `Custom weather covers from Winning Trimming protect your vessel from the harsh Australian elements — UV, salt spray, and torrential rain. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build weather covers tailored to your boat's exact dimensions using marine-grade fabrics like Sunbrella and WeatherMax.\n\nEvery cover is patterned on the boat for a precise fit, with reinforced stress points, marine-grade zips and fasteners, and optional ventilation to prevent mould. Whether you moor year-round or trailer between trips, a fitted weather cover extends the life of your upholstery, electronics and gelcoat.\n\nWe work on everything from tinnies to super yachts. Drop in to our Toronto workshop or arrange an on-site inspection at your marina.`,
    keyFeatures: ['Marine-grade Sunbrella & WeatherMax fabrics', 'Patterned on the boat for a precise fit', 'Reinforced stress points and marine zips', 'Optional ventilation panels'],
  },
  {
    title: 'Towing Covers',
    pillar: 'marine',
    intro: 'Heavy-duty towing covers that protect your boat on the road.',
    seoContent: `Towing covers from Winning Trimming are built for the road — heavy-duty protection that keeps your boat clean and secure at highway speeds. Serving boaters across Lake Macquarie, Newcastle, the Hunter and the Central Coast, we use tough, waterproof fabrics with reinforced tie-down points and a snug fit that won't flap in the wind.\n\nWhether you're towing a tinnie to the ramp or a cruiser interstate, a custom towing cover stops stone chips, road grime and salt from damaging your upholstery, clears and gelcoat. We pattern each cover on the boat for a tailored fit, with options for clear windows, zip-out panels and mast collars.\n\nBuilt to last from marine-grade PVC or canvas, with stainless fasteners and double-stitched seams.`,
    keyFeatures: ['Heavy-duty waterproof PVC or canvas', 'Reinforced tie-down points', 'Won\'t flap at highway speeds', 'Optional clear windows and zip-out panels'],
  },
  {
    title: 'Bimini Tops',
    pillar: 'marine',
    intro: 'Custom bimini tops for shade and shelter on the water.',
    seoContent: `A custom bimini top from Winning Trimming gives you shade and shelter on the water without sacrificing headroom or visibility. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build bimini tops for everything from runabouts to flybridge cruisers using marine-grade Sunbrella canvas and stainless steel frames.\n\nEach bimini is patterned on the boat for a perfect fit, with options for forward and aft extensions, clear wind screens, and matching boot covers for stowing when not in use. We use stainless steel or aluminium framing with double-wall fittings for durability in rough water.\n\nWhether you need a compact 2-bow bimini for a tinnie or a full 4-bow enclosure for a pontoon, we build it to last.`,
    keyFeatures: ['Marine-grade Sunbrella canvas', 'Stainless steel or aluminium frames', 'Patterned on the boat for perfect fit', 'Matching boot covers and clear screens'],
  },
  {
    title: 'Dodgers',
    pillar: 'marine',
    intro: 'Front dodgers that block wind and spray at the helm.',
    seoContent: `A custom dodger from Winning Trimming blocks wind and spray at the helm, extending your boating season and making every trip more comfortable. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast, we build dodgers for sailboats and power boats using marine-grade canvas and premium clear vinyl windows.\n\nEach dodger is patterned on the boat for a precise fit, with stainless steel framing, reinforced stitching, and options for zip-out window panels, weather cloths and connectors to biminis or enclosures. We use Strataglass or Eisenglass clear vinyl for maximum clarity and longevity.\n\nWhether you're coastal cruising or crossing the lake, a fitted dodger keeps you dry and warm at the helm.`,
    keyFeatures: ['Marine-grade canvas with Strataglass clear windows', 'Stainless steel framing', 'Zip-out window panels', 'Connects to biminis and enclosures'],
  },
  {
    title: 'Flybridge Enclosures',
    pillar: 'marine',
    intro: 'Flybridge enclosures for year-round comfort up top.',
    seoContent: `Flybridge enclosures from Winning Trimming give you year-round comfort up top — protection from wind, rain and spray without losing the view. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build custom flybridge enclosures for motor cruisers and flybridge yachts using marine-grade canvas and premium clear vinyl.\n\nEach enclosure is patterned on the boat, with zip-out panels for ventilation, stainless steel or aluminium framing, and options for connecting to existing biminis and dodgers. We use Strataglass clear vinyl for maximum clarity and UV resistance.\n\nWhether you're cruising the coast or entertaining on the lake, a fitted flybridge enclosure turns the upper deck into an all-weather cockpit.`,
    keyFeatures: ['Strataglass clear vinyl panels', 'Zip-out panels for ventilation', 'Stainless or aluminium framing', 'Connects to biminis and dodgers'],
  },
  {
    title: 'Cockpit Enclosures',
    pillar: 'marine',
    intro: 'Cockpit clear enclosures that extend your boating season.',
    seoContent: `Cockpit enclosures from Winning Trimming extend your boating season with clear panels that block wind and spray while keeping the view. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast, we build custom cockpit enclosures for sailboats and power boats using marine-grade canvas and premium clear vinyl.\n\nEach enclosure is patterned on the boat for a precise fit, with zip-out panels, roll-up sections, and options for connecting to dodgers and biminis. We use Strataglass or Eisenglass for maximum clarity and longevity.\n\nWhether you're racing, cruising or fishing, a fitted cockpit enclosure turns the cockpit into a comfortable, weather-protected space.`,
    keyFeatures: ['Strataglass or Eisenglass clear vinyl', 'Zip-out and roll-up panels', 'Connects to dodgers and biminis', 'Patterned on the boat for precise fit'],
  },
  {
    title: 'Sail Covers',
    pillar: 'marine',
    intro: 'Sail covers and stack packs to protect your sails and rigging.',
    seoContent: `Sail covers and stack packs from Winning Trimming protect your sails and rigging from UV damage, extending the life of your canvas and reducing maintenance. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build custom sail covers, stack packs and lazy jacks for sailboats from trailer-sailers to cruising yachts.\n\nEach cover is patterned on the sail for a precise fit, using marine-grade Sunbrella canvas with reinforced stitching at wear points, UV-resistant thread, and options for zip or luff closure. Stack packs combine a sail cover with lazy jacks for easy, single-handed sail handling.\n\nWhether you're a weekend cruiser or a liveaboard sailor, a fitted sail cover is the cheapest insurance you'll buy for your sails.`,
    keyFeatures: ['Marine-grade Sunbrella canvas', 'UV-resistant thread and reinforced stitching', 'Stack pack with lazy jacks option', 'Zip or luff closure'],
  },
  {
    title: 'Sun Beds',
    pillar: 'marine',
    intro: 'Sunbed cushions for relaxing on the bow or deck.',
    seoContent: `Custom sunbed cushions from Winning Trimming turn the bow or deck into a comfortable place to relax on the water. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast, we build sunbed cushions using marine-grade vinyl and quick-dry foam, tailored to your boat's exact contours.\n\nEach cushion is patterned on the boat for a precise fit, with options for piping, tufting, storage cut-outs and drain channels. We use UV-stable, mildew-resistant vinyl and high-density foam that holds its shape season after season.\n\nWhether you're entertaining on a pontoon or sunbathing on a bowrider, custom sunbed cushions add comfort and style.`,
    keyFeatures: ['Marine-grade UV-stable vinyl', 'Quick-dry high-density foam', 'Piping, tufting and storage cut-outs', 'Mildew and salt resistant'],
  },
  {
    title: 'Seats',
    pillar: 'marine',
    intro: 'Marine seat upholstery and re-trims built for comfort and durability.',
    seoContent: `Marine seat upholstery from Winning Trimming is built for comfort and durability in the harsh marine environment. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we re-trim and replace seat upholstery for everything from tinnies to flybridge cruisers.\n\nWe use marine-grade vinyl, UV-stable thread, and high-density foam, with options for bolstered sides, adjustable headrests and storage compartments. Each seat is patterned on the boat for a precise fit, with reinforced stitching at stress points and stainless or brass fasteners.\n\nWhether you need a single helm seat repaired or a full cockpit re-trim, we build seats that last.`,
    keyFeatures: ['Marine-grade UV-stable vinyl', 'High-density foam with bolstered sides', 'Reinforced stitching at stress points', 'Stainless or brass fasteners'],
  },
  {
    title: 'Cushions',
    pillar: 'marine',
    intro: 'Custom marine cushions, from cockpit to cabin.',
    seoContent: `Custom marine cushions from Winning Trimming add comfort and style to every part of your boat — from cockpit to cabin. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast, we build cushions using marine-grade vinyl, quick-dry foam, and UV-stable thread, tailored to your boat's exact contours.\n\nEach cushion is patterned on the boat for a precise fit, with options for piping, tufting, zippers for easy cleaning, and storage cut-outs. We use mildew-resistant, salt-resistant materials that hold up to the Australian marine environment.\n\nWhether you need cockpit cushions, cabin cushions, or custom berth mattresses, we build them to last.`,
    keyFeatures: ['Marine-grade mildew-resistant vinyl', 'Quick-dry foam', 'Zippers for easy cleaning', 'Patterned on the boat for precise fit'],
  },
  {
    title: 'Mattresses',
    pillar: 'marine',
    intro: 'Boat mattresses made to fit awkward cabin berths.',
    seoContent: `Custom boat mattresses from Winning Trimming are made to fit the awkward berths and cabins that standard mattresses can't. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build custom mattresses for forward berths, quarter berths, V-berths and saloon conversions.\n\nWe use marine-grade, moisture-resistant foam in a range of firmness options, with removable, washable covers in marine vinyl or breathable fabric. Each mattress is templated on the boat for an exact fit, with options for tapered sides, hinged sections for storage access, and rounded corners.\n\nWhether you're weekend cruising or living aboard, a custom boat mattress transforms your sleeping comfort.`,
    keyFeatures: ['Marine-grade moisture-resistant foam', 'Templated on the boat for exact fit', 'Removable washable covers', 'Hinged sections for storage access'],
  },
  {
    title: 'Interior Panels',
    pillar: 'marine',
    intro: 'Interior headliner and panel trimming for a finished cabin.',
    seoContent: `Interior panel trimming from Winning Trimming gives your boat's cabin a finished, premium look. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast, we build and replace headliners, cabin side panels, bulkhead panels and saloon trim using marine-grade vinyl, carpet and upholstery materials.\n\nEach panel is templated on the boat for an exact fit, with options for quilted headliners, padded side panels, snap-in or fixed panels, and integrated lighting cut-outs. We use moisture-resistant backing, UV-stable vinyl, and mildew-resistant adhesives.\n\nWhether you're refitting a tired cabin or building a new interior, custom panel trimming transforms the look and feel of your boat.`,
    keyFeatures: ['Marine-grade vinyl and carpet', 'Quilted headliner options', 'Snap-in or fixed panels', 'Moisture-resistant backing and adhesives'],
  },
  {
    title: 'Carpet',
    pillar: 'marine',
    intro: 'Marine-grade carpet and flooring solutions.',
    seoContent: `Marine-grade carpet from Winning Trimming adds comfort, insulation and style to your boat's cockpit, saloon and flybridge. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we supply and fit marine carpet that's engineered for the harsh Australian marine environment.\n\nWe use solution-dyed, UV-stable marine carpet that resists fading, mildew and salt, with options for snap-in or glued installation, bound edges, and custom inlays. Each piece is templated on the boat for a precise fit, with cut-outs for hatches, cleats and seating.\n\nWhether you're replacing worn carpet or upgrading to a new colour, marine carpet is one of the quickest ways to refresh your boat's interior.`,
    keyFeatures: ['Solution-dyed UV-stable marine carpet', 'Snap-in or glued installation', 'Bound edges and custom inlays', 'Templated on the boat for precise fit'],
  },
  {
    title: 'Hull Lining',
    pillar: 'marine',
    intro: 'Hull lining and insulation for a quieter, smarter cabin.',
    seoContent: `Hull lining and insulation from Winning Trimming makes your boat's cabin quieter, warmer and smarter. Serving Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast, we line hull sides, bilge areas and under-deck spaces with marine-grade acoustic and thermal insulation, finished with vinyl or carpet lining.\n\nProper hull lining reduces engine noise, condensation and heat transfer, making the cabin more comfortable year-round. We use closed-cell foam insulation, moisture-resistant adhesives, and marine-grade vinyl or carpet for the finished surface.\n\nWhether you're refitting a motor cruiser or lining a new build, hull lining is an investment in comfort and value.`,
    keyFeatures: ['Acoustic and thermal insulation', 'Closed-cell foam for moisture resistance', 'Marine-grade vinyl or carpet finish', 'Reduces engine noise and condensation'],
  },
  // ── Automotive ─────────────────────────────────────────────────────────
  {
    title: 'Tonneau Covers',
    pillar: 'automotive',
    intro: 'Custom tonneau and tray covers for utes and trucks.',
    seoContent: `Custom tonneau and tray covers from Winning Trimming protect your ute or truck tray from weather, theft and UV damage. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build tonneau covers using heavy-duty PVC or canvas, tailored to your tray's exact dimensions.\n\nEach cover is patterned on the vehicle for a precise fit, with reinforced edges, buckle or snap fasteners, and options for zip-out panels, tool cut-outs and load-rated tie-down points. We use UV-stable, waterproof materials that won't fade or crack in the Australian sun.\n\nWhether you drive a work ute, a tradesman's truck or a show ute, a custom tonneau cover keeps your gear dry and secure.`,
    keyFeatures: ['Heavy-duty UV-stable PVC or canvas', 'Buckle or snap fasteners', 'Zip-out panels and tool cut-outs', 'Patterned on the vehicle for precise fit'],
  },
  {
    title: 'Seat Trim',
    pillar: 'automotive',
    intro: 'Seat re-trims and upholstery for cars, vans and 4x4s.',
    seoContent: `Seat re-trims from Winning Trimming restore and upgrade the interior of your car, van or 4x4. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we re-trim seats using automotive-grade leather, vinyl or fabric, with options for quilted panels, contrast stitching, heated seats and lumbar support.\n\nEach re-trim is patterned on the original seat for a precise fit, with high-density foam replacement, reinforced stitching at stress points, and OEM-quality fasteners and hog rings. We use UV-stable, wear-resistant materials that hold up to daily use.\n\nWhether you need a single bolster repaired or a full interior re-trim, we build seats that look and feel factory-fresh.`,
    keyFeatures: ['Automotive-grade leather, vinyl or fabric', 'High-density foam replacement', 'Contrast stitching and quilted panels', 'UV-stable, wear-resistant materials'],
  },
  {
    title: 'Headlinings',
    pillar: 'automotive',
    intro: 'Headlining repair and replacement.',
    seoContent: `Headlining repair and replacement from Winning Trimming fixes sagging, stained or torn headliners in cars, vans and 4x4s. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we replace headlining using automotive-grade fabric or vinyl, with new foam backing and weather-resistant adhesives.\n\nEach headlining is patterned on the original board for a precise fit, with options for sunroof cut-outs, integrated lighting, and contrast piping. We use UV-stable materials that won't sag or fade in the Australian sun.\n\nWhether your headlining is sagging, stained or ripped, a replacement transforms the look and feel of your vehicle's interior.`,
    keyFeatures: ['Automotive-grade fabric or vinyl', 'New foam backing and weather-resistant adhesives', 'Sunroof cut-outs and integrated lighting', 'UV-stable, won\'t sag or fade'],
  },
  {
    title: 'Door Trims',
    pillar: 'automotive',
    intro: 'Door trim and panel upholstery.',
    seoContent: `Door trim and panel upholstery from Winning Trimming restores and upgrades the interior of your car, van or 4x4. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we re-trim door panels using automotive-grade leather, vinyl or fabric, with options for quilted inserts, contrast stitching, and trim piece integration.\n\nEach door trim is patterned on the original panel for a precise fit, with new foam backing, weather-resistant adhesives, and OEM-quality clips and fasteners. We use UV-stable, wear-resistant materials that hold up to daily use.\n\nWhether you need a single door panel repaired or a full interior re-trim, we build door trims that look and feel factory-fresh.`,
    keyFeatures: ['Automotive-grade leather, vinyl or fabric', 'Quilted inserts and contrast stitching', 'New foam backing and weather-resistant adhesives', 'OEM-quality clips and fasteners'],
  },
  // ── Caravan & RV ───────────────────────────────────────────────────────
  {
    title: 'Annexes',
    pillar: 'caravan-and-rv',
    intro: 'Annexes and shade walls for caravans and motorhomes.',
    seoContent: `Annexes and shade walls from Winning Trimming extend your living space when you're caravanning or motorhoming. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build custom annexes, shade walls and privacy screens for caravans, motorhomes and campervans.\n\nEach annex is patterned on the van for a precise fit, using UV-stable, waterproof canvas with reinforced pole sleeves, zip-in walls, and options for window flaps and doorways. We use marine-grade zips and fasteners for longevity.\n\nWhether you need a full annex room or a simple shade wall, we build annexes that make life on the road more comfortable.`,
    keyFeatures: ['UV-stable waterproof canvas', 'Reinforced pole sleeves', 'Zip-in walls and window flaps', 'Marine-grade zips and fasteners'],
  },
  {
    title: 'Cushions & Mattresses',
    pillar: 'caravan-and-rv',
    intro: 'Cushions and mattresses for caravans and RVs.',
    seoContent: `Custom cushions and mattresses from Winning Trimming transform the comfort of your caravan or RV. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build custom cushions, dinette seats and mattresses tailored to your van's exact dimensions.\n\nEach cushion is templated on the van for a precise fit, using high-density foam in a range of firmness options, with removable, washable covers in upholstery fabric or marine vinyl. We use UV-stable, mildew-resistant materials, with options for zippers, piping and storage cut-outs.\n\nWhether you're refitting a dinette, replacing a worn mattress or upgrading all the cushions in your van, we build them to last.`,
    keyFeatures: ['High-density foam in multiple firmness options', 'Removable washable covers', 'UV-stable, mildew-resistant materials', 'Templated on the van for precise fit'],
  },
  {
    title: 'Interior Trim',
    pillar: 'caravan-and-rv',
    intro: 'Interior trim and upholstery for vans and campers.',
    seoContent: `Interior trim and upholstery from Winning Trimming refreshes and upgrades the interior of your caravan, motorhome or campervan. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we re-trim wall panels, ceiling linings, cabinetry fronts and seating using upholstery fabric, marine vinyl or carpet.\n\nEach panel is templated on the van for a precise fit, with new foam backing, moisture-resistant adhesives, and options for quilted panels, contrast piping and integrated lighting. We use UV-stable, mildew-resistant materials that hold up to the touring life.\n\nWhether you're refitting a tired van or building a custom camper interior, we build trim that looks and feels premium.`,
    keyFeatures: ['Upholstery fabric, marine vinyl or carpet', 'Quilted panels and contrast piping', 'Moisture-resistant adhesives', 'UV-stable, mildew-resistant materials'],
  },
  // ── Trade & Industrial ─────────────────────────────────────────────────
  {
    title: 'Machinery Covers',
    pillar: 'trade-and-industrial',
    intro: 'Heavy-duty covers for machinery and plant.',
    seoContent: `Heavy-duty machinery covers from Winning Trimming protect your plant and equipment from weather, UV and dust. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build custom covers for excavators, skid steers, generators, welders and more using industrial-grade PVC or canvas.\n\nEach cover is patterned on the machine for a precise fit, with reinforced edges, buckle or D-ring fasteners, and options for zip-out panels, vent flaps and access openings. We use UV-stable, waterproof materials that won't fade or crack in the Australian sun.\n\nWhether you need a single machine cover or a fleet, we build covers that protect your investment.`,
    keyFeatures: ['Industrial-grade PVC or canvas', 'Reinforced edges and D-ring fasteners', 'Zip-out panels and vent flaps', 'UV-stable, waterproof materials'],
  },
  {
    title: 'Operator Seats',
    pillar: 'trade-and-industrial',
    intro: 'Operator seat trimming and repair.',
    seoContent: `Operator seat trimming and repair from Winning Trimming keeps you comfortable on long shifts. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we re-trim and repair operator seats for excavators, skid steers, forklifts, trucks and tractors.\n\nWe use heavy-duty vinyl, high-density foam, and reinforced stitching at stress points, with options for lumbar support, heated seats and suspension upgrades. Each re-trim is patterned on the original seat for a precise fit, with UV-stable, wear-resistant materials that hold up to daily use.\n\nWhether you need a single seat repaired or a fleet re-trimmed, we build operator seats that last.`,
    keyFeatures: ['Heavy-duty vinyl and high-density foam', 'Reinforced stitching at stress points', 'Lumbar support and heated seat options', 'UV-stable, wear-resistant materials'],
  },
  // ── Commercial ─────────────────────────────────────────────────────────
  {
    title: 'Booth Upholstery',
    pillar: 'commercial',
    intro: 'Booth seating upholstery for cafés and restaurants.',
    seoContent: `Booth seating upholstery from Winning Trimming adds comfort and style to your café, restaurant or venue. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we build and re-upholster booth seating, banquette seating and fixed seating using commercial-grade vinyl or fabric.\n\nEach booth is templated on site for a precise fit, with high-density commercial foam, reinforced stitching, and options for quilted panels, button tufting, contrast piping and custom logos. We use UV-stable, stain-resistant, fire-rated materials that meet commercial standards.\n\nWhether you're refitting a single booth or a full venue, we build commercial upholstery that holds up to heavy use.`,
    keyFeatures: ['Commercial-grade vinyl or fabric', 'High-density commercial foam', 'Quilted panels and button tufting', 'Fire-rated, stain-resistant materials'],
  },
  {
    title: 'Office Chairs',
    pillar: 'commercial',
    intro: 'Office chair re-upholstery and repair.',
    seoContent: `Office chair re-upholstery from Winning Trimming extends the life of your office furniture at a fraction of the replacement cost. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we re-upholster office chairs, boardroom chairs and executive seating using commercial-grade fabric or leather.\n\nEach re-trim is patterned on the original chair for a precise fit, with new foam where needed, reinforced stitching, and options for contrast piping, quilted panels and custom branding. We use wear-resistant, stain-resistant materials that hold up to daily use.\n\nWhether you need a single executive chair re-trimmed or a full office fleet refurbished, we build office chair upholstery that lasts.`,
    keyFeatures: ['Commercial-grade fabric or leather', 'New foam replacement', 'Contrast piping and custom branding', 'Wear-resistant, stain-resistant materials'],
  },
]

/**
 * Seed project records — completed jobs shown in the /our-work gallery.
 * Each project references a pillar, a featured image, and a service type.
 */
const projectData: {
  title: string
  pillar: 'marine' | 'automotive' | 'caravan-and-rv' | 'trade-and-industrial' | 'commercial'
  summary: string
  location: string
  materials: string
  completedAt: string
  featured: boolean
  mediaKey: string
  serviceTypeTitles: string[]
  content: ReturnType<typeof root>
  metaTitle: string
  metaDescription: string
}[] = [
  {
    title: 'Flybridge Enclosure — Riviera 42',
    pillar: 'marine',
    summary: 'Full flybridge enclosure with Strataglass panels and zip-out sections for a Riviera 42 flybridge cruiser.',
    location: 'Newcastle, NSW',
    materials: 'Sunbrella canvas, Strataglass clear vinyl, stainless steel framing',
    completedAt: '2025-08-01',
    featured: true,
    mediaKey: 'flybridge-enclosures-hero',
    serviceTypeTitles: ['Flybridge Enclosures', 'Cockpit Enclosures'],
    content: root([
      h('The brief', 'h2'),
      p('The owner of a Riviera 42 wanted to extend the usability of the flybridge year-round, blocking wind and spray without losing the panoramic view. The existing enclosure was tired, with cloudy clear vinyl and failed zips.'),
      h('What we built', 'h2'),
      p('We patterned a full new enclosure on the flybridge, using Sunbrella canvas in the owner\'s chosen colour and Strataglass clear vinyl for maximum clarity. All panels zip out for open-air cruising, with stainless steel framing and double-stitched seams at stress points.'),
      h('The result', 'h2'),
      p('The flybridge is now a comfortable, all-weather space that the owner uses year-round — from winter cruising to entertaining on the lake. The Strataglass panels provide excellent visibility and the zip-out sections give ventilation when needed.'),
    ]),
    metaTitle: 'Flybridge Enclosure — Riviera 42 | Winning Trimming',
    metaDescription: 'Custom flybridge enclosure with Strataglass panels and zip-out sections for a Riviera 42 cruiser. Marine trimming by Winning Trimming, Lake Macquarie.',
  },
  {
    title: 'Bimini Top & Dodger — Beneteau 34',
    pillar: 'marine',
    summary: 'New bimini top and matching dodger for a Beneteau 34 sailboat, with Sunbrella canvas and stainless steel framing.',
    location: 'Toronto, Lake Macquarie',
    materials: 'Sunbrella canvas, stainless steel frame, UV-stable thread',
    completedAt: '2025-06-01',
    featured: true,
    mediaKey: 'bimini-tops-hero',
    serviceTypeTitles: ['Bimini Tops', 'Dodgers'],
    content: root([
      h('The brief', 'h2'),
      p('The owner of a Beneteau 34 wanted shade and spray protection for the cockpit, with a bimini that could fold away for sailing and a dodger that didn\'t obstruct the view.'),
      h('What we built', 'h2'),
      p('We built a 3-bow stainless steel bimini with Sunbrella canvas, matching boot cover, and a forward dodger with Strataglass windows. The bimini connects to the dodger with zip-in side panels for a full cockpit enclosure when needed.'),
      h('The result', 'h2'),
      p('The cockpit is now a comfortable, protected space for cruising and overnight passages. The bimini folds away cleanly for sailing, and the dodger provides excellent visibility and spray protection.'),
    ]),
    metaTitle: 'Bimini Top & Dodger — Beneteau 34 | Winning Trimming',
    metaDescription: 'Custom bimini top and matching dodger for a Beneteau 34 sailboat. Sunbrella canvas, stainless framing. Lake Macquarie marine trimming.',
  },
  {
    title: 'Full Cockpit Re-trim — Cruise Craft 625',
    pillar: 'marine',
    summary: 'Complete cockpit upholstery re-trim including seats, bolsters and side panels for a Cruise Craft 625.',
    location: 'Belmont, Lake Macquarie',
    materials: 'Marine-grade vinyl, high-density foam, UV-stable thread',
    completedAt: '2025-04-01',
    featured: true,
    mediaKey: 'seats-hero',
    serviceTypeTitles: ['Seats', 'Cushions'],
    content: root([
      h('The brief', 'h2'),
      p('The owner of a Cruise Craft 625 wanted to refresh the entire cockpit — the original upholstery was faded, cracked and uncomfortable after years of sun and salt exposure.'),
      h('What we built', 'h2'),
      p('We re-trimmed all cockpit seating using marine-grade vinyl in a two-tone colour scheme, with new high-density foam, bolstered sides for better support, and reinforced stitching at all stress points. Side panels and bolster cushions were also replaced.'),
      h('The result', 'h2'),
      p('The cockpit looks and feels brand new, with comfortable, supportive seating that will hold up to years of fishing and family boating.'),
    ]),
    metaTitle: 'Cockpit Re-trim — Cruise Craft 625 | Winning Trimming',
    metaDescription: 'Complete cockpit upholstery re-trim for a Cruise Craft 625. Marine-grade vinyl, new foam, bolstered seats. Lake Macquarie marine trimming.',
  },
  {
    title: 'Sail Cover & Stack Pack — Hanse 388',
    pillar: 'marine',
    summary: 'Custom stack pack with lazy jacks and matching sail cover for a Hanse 388 cruising yacht.',
    location: 'Newcastle, NSW',
    materials: 'Sunbrella canvas, UV-stable thread, stainless lazy jack fittings',
    completedAt: '2025-03-01',
    featured: false,
    mediaKey: 'sail-covers-hero',
    serviceTypeTitles: ['Sail Covers'],
    content: root([
      h('The brief', 'h2'),
      p('The owner of a Hanse 388 wanted to make single-handed sail handling easier, with a stack pack that would catch the main when dropped and protect it from UV.'),
      h('What we built', 'h2'),
      p('We built a custom stack pack with lazy jacks, using Sunbrella canvas with UV-stable thread. The stack pack is patterned on the boom for a precise fit, with zip-out panels for sail inspection and reinforced batten cut-outs.'),
      h('The result', 'h2'),
      p('Dropping the main is now a one-person job — the sail flakes into the stack pack and zips closed in seconds. The cover also protects the sail from UV damage, extending its life.'),
    ]),
    metaTitle: 'Sail Cover & Stack Pack — Hanse 388 | Winning Trimming',
    metaDescription: 'Custom stack pack with lazy jacks for a Hanse 388. Sunbrella canvas, UV-stable. Lake Macquarine marine canvas and trimming.',
  },
  {
    title: 'Weather Cover — Quintrex 4.7',
    pillar: 'marine',
    summary: 'Custom weather cover for a Quintrex 4.7 tinny, protecting the console and seats during storage and towing.',
    location: 'Toronto, Lake Macquarie',
    materials: 'Heavy-duty PVC, UV-stable, buckle fasteners',
    completedAt: '2025-02-01',
    featured: false,
    mediaKey: 'weather-covers-hero',
    serviceTypeTitles: ['Weather Covers', 'Towing Covers'],
    content: root([
      h('The brief', 'h2'),
      p('The owner of a Quintrex 4.7 wanted a cover that would protect the console, seats and electronics during storage and when towing to and from the ramp.'),
      h('What we built', 'h2'),
      p('We built a custom weather cover using heavy-duty PVC, patterned on the boat for a precise fit. The cover has buckle fasteners for quick on-off, reinforced edges, and a cut-out for the outboard motor.'),
      h('The result', 'h2'),
      p('The boat stays clean and dry during storage and towing, with the console and electronics fully protected from sun, rain and road grime.'),
    ]),
    metaTitle: 'Weather Cover — Quintrex 4.7 | Winning Trimming',
    metaDescription: 'Custom weather cover for a Quintrex 4.7 tinny. Heavy-duty PVC, buckle fasteners. Lake Macquarie marine covers.',
  },
  {
    title: 'Boat Mattress — V-Berth Robertson 44',
    pillar: 'marine',
    summary: 'Custom V-berth mattress for a Robertson 44, templated to the awkward forward berth shape.',
    location: 'Newcastle, NSW',
    materials: 'Memory foam, moisture-resistant cover, breathable fabric',
    completedAt: '2025-01-01',
    featured: false,
    mediaKey: 'mattresses-hero',
    serviceTypeTitles: ['Mattresses'],
    content: root([
      h('The brief', 'h2'),
      p('The owners of a Robertson 44 were tired of sleeping on the original thin, uncomfortable V-berth cushions. They wanted a proper mattress that fit the tapered V-berth shape.'),
      h('What we built', 'h2'),
      p('We templated the V-berth on the boat and built a custom mattress using memory foam over a firm base, with a tapered shape and rounded corners. The cover is removable and washable, in breathable fabric with a moisture-resistant backing.'),
      h('The result', 'h2'),
      p('The V-berth is now the most comfortable sleeping spot on the boat. The owners can cruise for weeks without back pain, and the mattress fits perfectly with no gaps.'),
    ]),
    metaTitle: 'Boat Mattress — V-Berth Robertson 44 | Winning Trimming',
    metaDescription: 'Custom V-berth mattress for a Robertson 44. Memory foam, templated to fit. Lake Macquarie marine mattresses.',
  },
  {
    title: 'Ute Tonneau Cover — Toyota Hilux',
    pillar: 'automotive',
    summary: 'Custom tonneau cover for a Toyota Hilux tray, with reinforced edges and buckle fasteners.',
    location: 'Maitland, NSW',
    materials: 'Heavy-duty PVC, UV-stable, stainless buckles',
    completedAt: '2025-05-01',
    featured: false,
    mediaKey: 'tonneau-covers-hero',
    serviceTypeTitles: ['Tonneau Covers'],
    content: root([
      h('The brief', 'h2'),
      p('The owner of a Toyota Hilux wanted a tonneau cover that would keep tools and gear dry and secure on the worksite and on the road.'),
      h('What we built', 'h2'),
      p('We built a custom tonneau cover using heavy-duty UV-stable PVC, patterned on the tray for a precise fit. The cover has reinforced edges, stainless buckle fasteners, and a zip-out panel for long loads.'),
      h('The result', 'h2'),
      p('Tools and gear stay dry and secure in all weather. The cover is quick to fit and remove, and the zip-out panel handles the occasional load of timber or pipe.'),
    ]),
    metaTitle: 'Ute Tonneau Cover — Toyota Hilux | Winning Trimming',
    metaDescription: 'Custom tonneau cover for a Toyota Hilux tray. Heavy-duty PVC, stainless buckles. Lake Macquarie automotive trimming.',
  },
  {
    title: 'Full Interior Re-trim — Holden HQ Premier',
    pillar: 'automotive',
    summary: 'Complete interior re-trim of a restored Holden HQ Premier, including seats, door trims and headlining.',
    location: 'Newcastle, NSW',
    materials: 'Automotive leather, vinyl, carpet, UV-stable thread',
    completedAt: '2025-03-01',
    featured: true,
    mediaKey: 'seat-trim-hero',
    serviceTypeTitles: ['Seat Trim', 'Door Trims', 'Headlinings'],
    content: root([
      h('The brief', 'h2'),
      p('The owner of a restored Holden HQ Premier wanted a factory-correct interior re-trim to finish off a ground-up restoration. The original trim was beyond repair.'),
      h('What we built', 'h2'),
      p('We re-trimmed the front and rear seats, door trims, and headlining using automotive-grade vinyl and cloth in the original colour scheme, with new foam, hog rings, and OEM-style stitching. The carpet was also replaced.'),
      h('The result', 'h2'),
      p('The interior looks factory-fresh, matching the original specification. The owner was thrilled with the result, which completed the restoration to show standard.'),
    ]),
    metaTitle: 'Interior Re-trim — Holden HQ Premier | Winning Trimming',
    metaDescription: 'Complete interior re-trim of a restored Holden HQ Premier. Seats, door trims, headlining. Lake Macquarie automotive trimming.',
  },
  {
    title: 'Caravan Annex — Jayco Expanda',
    pillar: 'caravan-and-rv',
    summary: 'Custom annex and shade wall for a Jayco Expanda, with zip-in walls and window flaps.',
    location: ' Swansea, Lake Macquarie',
    materials: 'UV-stable canvas, marine-grade zips, reinforced pole sleeves',
    completedAt: '2025-04-01',
    featured: false,
    mediaKey: 'annexes-hero',
    serviceTypeTitles: ['Annexes'],
    content: root([
      h('The brief', 'h2'),
      p('A family with a Jayco Expanda wanted an annex to extend their living space on longer trips, with walls for weather protection and shade for summer trips.'),
      h('What we built', 'h2'),
      p('We built a custom annex using UV-stable canvas, with reinforced pole sleeves, zip-in walls, and window flaps. The annex attaches to the van with a sail track and is quick to set up and pack down.'),
      h('The result', 'h2'),
      p('The family now has a weather-protected living space that doubles the usable area of their setup. The annex packs down small for storage and is quick to erect on site.'),
    ]),
    metaTitle: 'Caravan Annex — Jayco Expanda | Winning Trimming',
    metaDescription: 'Custom annex and shade wall for a Jayco Expanda. UV-stable canvas, zip-in walls. Lake Macquarie caravan trimming.',
  },
  {
    title: 'Caravan Cushion Refurb — Coromal Element',
    pillar: 'caravan-and-rv',
    summary: 'All cushions replaced with high-density foam and new covers for a Coromal Element caravan.',
    location: 'Toronto, Lake Macquarie',
    materials: 'High-density foam, upholstery fabric, zippers',
    completedAt: '2025-02-01',
    featured: false,
    mediaKey: 'cushions-mattresses-hero',
    serviceTypeTitles: ['Cushions & Mattresses', 'Interior Trim'],
    content: root([
      h('The brief', 'h2'),
      p('The owners of a Coromal Element wanted to replace all the original cushions, which had gone flat and were uncomfortable for sleeping and sitting.'),
      h('What we built', 'h2'),
      p('We templated all cushions on site and built replacements using high-density foam in a medium-firm grade, with removable, washable covers in a durable upholstery fabric. The dinette cushions double as the bed mattress.'),
      h('The result', 'h2'),
      p('The caravan is now much more comfortable for both sitting and sleeping. The washable covers make cleaning easy after dusty trips.'),
    ]),
    metaTitle: 'Caravan Cushion Refurb — Coromal Element | Winning Trimming',
    metaDescription: 'All cushions replaced with high-density foam and washable covers for a Coromal Element. Lake Macquarie caravan upholstery.',
  },
  {
    title: 'Machinery Cover — Excavator',
    pillar: 'trade-and-industrial',
    summary: 'Heavy-duty cover for a 20-ton excavator, protecting the cab and engine during site downtime.',
    location: 'Hunter Valley, NSW',
    materials: 'Industrial PVC, reinforced edges, D-rings',
    completedAt: '2025-05-01',
    featured: false,
    mediaKey: 'machinery-covers-hero',
    serviceTypeTitles: ['Machinery Covers'],
    content: root([
      h('The brief', 'h2'),
      p('A civil contractor needed a cover for a 20-ton excavator that sits idle between jobs, to protect the cab glass, seat and electronics from sun and rain.'),
      h('What we built', 'h2'),
      p('We built a heavy-duty cover using industrial-grade PVC, patterned on the machine for a precise fit. The cover has reinforced edges, D-ring fasteners, and vent flaps to prevent condensation.'),
      h('The result', 'h2'),
      p('The excavator is fully protected between jobs. The cover is quick to fit and remove, and the vent flaps keep the interior dry and mould-free.'),
    ]),
    metaTitle: 'Machinery Cover — 20-ton Excavator | Winning Trimming',
    metaDescription: 'Heavy-duty machinery cover for a 20-ton excavator. Industrial PVC, D-rings, vent flaps. Lake Macquarie trade covers.',
  },
  {
    title: 'Operator Seat Repair — CAT Skid Steer',
    pillar: 'trade-and-industrial',
    summary: 'Re-trimmed and re-foamed operator seat for a CAT skid steer, restoring comfort and support.',
    location: 'Maitland, NSW',
    materials: 'Heavy-duty vinyl, high-density foam, reinforced stitching',
    completedAt: '2025-01-01',
    featured: false,
    mediaKey: 'operator-seats-hero',
    serviceTypeTitles: ['Operator Seats'],
    content: root([
      h('The brief', 'h2'),
      p('The operator of a CAT skid steer had a worn, uncomfortable seat with torn vinyl and flat foam. The seat was causing back pain on long shifts.'),
      h('What we built', 'h2'),
      p('We re-trimmed the seat using heavy-duty vinyl, replaced the foam with high-density commercial foam, and added reinforced stitching at all stress points. The suspension mechanism was inspected and adjusted.'),
      h('The result', 'h2'),
      p('The operator reports the seat is now comfortable for full shifts, with much better support. The vinyl is holding up well to daily site use.'),
    ]),
    metaTitle: 'Operator Seat Repair — CAT Skid Steer | Winning Trimming',
    metaDescription: 'Operator seat re-trim and re-foam for a CAT skid steer. Heavy-duty vinyl, high-density foam. Lake Macquarie trade trimming.',
  },
  {
    title: 'Café Booth Re-upholstery — Newcastle Waterfront',
    pillar: 'commercial',
    summary: 'Re-upholstered all booth seating for a Newcastle waterfront café, in commercial-grade vinyl.',
    location: 'Newcastle, NSW',
    materials: 'Commercial-grade vinyl, high-density foam, fire-rated',
    completedAt: '2025-06-01',
    featured: true,
    mediaKey: 'booth-upholstery-hero',
    serviceTypeTitles: ['Booth Upholstery'],
    content: root([
      h('The brief', 'h2'),
      p('A busy Newcastle waterfront café needed all booth seating re-upholstered after years of heavy use. The original vinyl was cracked, stained and torn.'),
      h('What we built', 'h2'),
      p('We re-upholstered all booths on site, using commercial-grade, fire-rated vinyl in a colour chosen by the owner. New high-density commercial foam was installed, with button tufting and contrast piping for a premium look.'),
      h('The result', 'h2'),
      p('The café looks refreshed and professional, with comfortable, durable seating that will hold up to years of heavy use. The fire-rated materials meet commercial compliance requirements.'),
    ]),
    metaTitle: 'Café Booth Re-upholstery — Newcastle | Winning Trimming',
    metaDescription: 'Re-upholstered all booth seating for a Newcastle waterfront café. Commercial-grade vinyl, fire-rated. Lake Macquarie commercial upholstery.',
  },
  {
    title: 'Office Chair Fleet — Chartered Accountants',
    pillar: 'commercial',
    summary: 'Re-upholstered 24 boardroom and executive chairs for a chartered accountancy firm.',
    location: 'Newcastle, NSW',
    materials: 'Commercial fabric, new foam, contrast piping',
    completedAt: '2025-03-01',
    featured: false,
    mediaKey: 'office-chairs-hero',
    serviceTypeTitles: ['Office Chairs'],
    content: root([
      h('The brief', 'h2'),
      p('A Newcastle chartered accountancy firm wanted to refresh their boardroom and executive chairs rather than replace them, to save cost and reduce waste.'),
      h('What we built', 'h2'),
      p('We re-upholstered 24 chairs using commercial-grade fabric in the firm\'s brand colour, with new foam, contrast piping, and reinforced stitching. The work was done in batches to minimise disruption.'),
      h('The result', 'h2'),
      p('The chairs look and feel brand new, at a fraction of the replacement cost. The firm saved money and avoided sending 24 chairs to landfill.'),
    ]),
    metaTitle: 'Office Chair Fleet — Chartered Accountants | Winning Trimming',
    metaDescription: 'Re-upholstered 24 boardroom and executive chairs for a Newcastle accountancy firm. Lake Macquarie commercial upholstery.',
  },
]

export const seedProjects = async (payload: Payload, media: MediaMap) => {
  payload.logger.info(`— Seeding service types...`)
  const typeIds: Record<string, string | number> = {}
  for (const st of serviceTypeData) {
    const slug = slugify(st.title)
    const heroKey = `${slug}-hero`
    const heroImage = media[heroKey] ?? null
    const doc = await payload.create({
      collection: 'service-types',
      data: {
        title: st.title,
        pillar: st.pillar,
        intro: st.intro ?? '',
        seoContent: st.seoContent ?? '',
        content: {
          keyFeatures: (st.keyFeatures ?? []).map((f) => ({ feature: f })),
        },
        heroImage: heroImage as number | null,
        meta: {
          title: `${st.title} — Winning Trimming | Lake Macquarie, Newcastle`,
          description: st.intro ?? '',
        },
        slug,
        slugLock: false,
      },
    })
    typeIds[st.title] = doc.id
  }

  // Generate repair variants for each custom service type
  payload.logger.info(`— Seeding repair service types...`)
  for (const st of serviceTypeData) {
    const singular = st.title.endsWith('s') && !st.title.endsWith('ss')
      ? st.title.slice(0, -1)
      : st.title
    const repairTitle = `${singular} Repairs`
    const repairIntro = `Repair, re-stitch or re-cover your ${st.title.toLowerCase()}. Bring tired trim back to life at a fraction of the replacement cost.`
    const repairSlug = slugify(repairTitle)
    const repairHeroKey = `${repairSlug}-hero`
    const repairHeroImage = media[repairHeroKey] ?? null
    const repairSeoContent = `${singular} repairs from Winning Trimming bring tired, damaged or worn ${st.title.toLowerCase()} back to life at a fraction of the replacement cost. Based on Lake Macquarie and serving Newcastle, the Hunter Valley and the Central Coast, we repair, re-stitch and re-cover ${st.title.toLowerCase()} using quality materials and traditional craftsmanship.\n\nOur ${singular.toLowerCase()} repair service covers zip repairs, seam re-stitching, vinyl and canvas replacement, foam replacement, hardware replacement and full refurbishment. We assess the damage, advise on the most cost-effective repair path, and rebuild your ${st.title.toLowerCase()} to look and perform like new.\n\nWhether your ${st.title.toLowerCase()} have torn stitching, faded vinyl, broken zips, or flat foam, we can bring them back. Drop in to our Toronto workshop or arrange an on-site inspection — we cover Lake Macquarie, Newcastle, the Hunter Valley and the Central Coast.`
    const doc = await payload.create({
      collection: 'service-types',
      data: {
        title: repairTitle,
        pillar: st.pillar,
        workType: 'repair',
        intro: repairIntro,
        seoContent: repairSeoContent,
        content: {
          keyFeatures: (st.keyFeatures ?? []).map((f) => ({ feature: f.replace('built', 'repaired') })),
        },
        heroImage: repairHeroImage as number | null,
        meta: {
          title: `${repairTitle} — Winning Trimming | Lake Macquarie, Newcastle`,
          description: repairIntro,
        },
        slug: repairSlug,
        slugLock: false,
      },
    })
    typeIds[repairTitle] = doc.id
  }

  // ---- Projects (Our Work gallery) ---------------------------------------
  payload.logger.info(`— Seeding projects...`)
  let projectCount = 0
  for (const proj of projectData) {
    const featuredImage = media[proj.mediaKey] ?? media['hero']
    const serviceTypeIds = proj.serviceTypeTitles
      .map((t) => typeIds[t])
      .filter(Boolean) as (string | number)[]

    await payload.create({
      collection: 'projects',
      data: {
        title: proj.title,
        pillar: proj.pillar,
        summary: proj.summary,
        location: proj.location,
        materials: proj.materials,
        completedAt: proj.completedAt,
        featured: proj.featured,
        featuredImage: featuredImage as number,
        content: proj.content,
        serviceTypes: serviceTypeIds,
        meta: {
          title: proj.metaTitle,
          description: proj.metaDescription,
          image: featuredImage as number,
        },
        _status: 'published',
        slug: slugify(proj.title),
        slugLock: false,
      },
    })
    projectCount++
  }

  payload.logger.info(
    `— Seeded ${serviceTypeData.length} custom + ${serviceTypeData.length} repair service types + ${projectCount} projects.`,
  )

  return typeIds
}