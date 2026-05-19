<?php
/**
 * Plugin Name: Local SEO Defaults
 * Description: Pre-configured local business schema and SEO settings for Winning Trimming.
 * Version:     1.0.0
 * Author:      Smith & Gray
 */

// Register LocalBusiness schema via JSON-LD
add_action("wp_head", function() {
    ?>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Winning Trimming",
  "description": "Marine, RV, and Trade upholstery & covers in the Hunter Region, NSW.",
  "url": "https://winningtrimming.com.au",
  "telephone": "+61-1300-799-882",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Shop 2, 25 Sara Street",
    "addressLocality": "Toronto",
    "addressRegion": "NSW",
    "postalCode": "2283",
    "addressCountry": "AU"
  },
  "areaServed": [
    "Lake Macquarie",
    "Newcastle",
    "Hunter Valley",
    "Central Coast",
    "Hunter Region"
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "16:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": "Saturday",
      "opens": "08:00",
      "closes": "12:00"
    }
  ],
  "sameAs": []
}
</script>
    <?php
}, 1);

// Add geo meta tags for local SEO
add_action("wp_head", function() {
    echo '<meta name="geo.region" content="AU-NSW" />' . "\n";
    echo '<meta name="geo.placename" content="Toronto, NSW" />' . "\n";
}, 2);
