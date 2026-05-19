<?php
/**
 * Plugin Name: API Access Configuration
 * Description: Configures WordPress REST API for n8n integration with Application Passwords.
 * Version:     1.0.0
 * Author:      Smith & Gray
 */

// Ensure Application Passwords are enabled (WordPress 5.6+)
add_filter("wp_is_application_passwords_available", "__return_true");

// Allow authenticated REST API access for n8n
add_action("rest_api_init", function() {
    // Register custom REST fields for n8n content ingestion
    register_rest_field("post", "featured_image_url", [
        "get_callback" => function($post) {
            $image_id = get_post_thumbnail_id($post["id"]);
            if ($image_id) {
                $image = wp_get_attachment_image_src($image_id, "full");
                return $image ? $image[0] : null;
            }
            return null;
        },
    ]);

    register_rest_field("post", "categories_names", [
        "get_callback" => function($post) {
            $categories = get_the_category($post["id"]);
            return array_map(function($cat) { return $cat->name; }, $categories);
        },
    ]);

    register_rest_field("post", "tags_names", [
        "get_callback" => function($post) {
            $tags = get_the_tags($post["id"]);
            if (!$tags) return [];
            return array_map(function($tag) { return $tag->name; }, $tags);
        },
    ]);
});

// Add custom REST endpoint for n8n to check site health
add_action("rest_api_init", function() {
    register_rest_route("wt/v1", "/health", [
        "methods" => "GET",
        "callback" => function() {
            return [
                "status" => "ok",
                "time"   => current_time("mysql"),
                "tz"     => wp_timezone_string(),
            ];
        },
        "permission_callback" => function() {
            return current_user_can("edit_posts");
        },
    ]);
});
