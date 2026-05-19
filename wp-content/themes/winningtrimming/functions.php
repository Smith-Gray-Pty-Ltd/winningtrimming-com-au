<?php
/**
 * Winning Trimming child theme functions
 */

if (!defined("ABSPATH")) {
    exit;
}

define("WT_CHILD_VERSION", "1.0.0");

// Ensure parent theme (Astra) is active
add_action("after_switch_theme", function() {
    $parent = "astra";
    if (!wp_get_theme($parent)->exists()) {
        switch_theme(WP_DEFAULT_THEME);
        wp_die(
            sprintf(
                "Winning Trimming is a child theme of <strong>%s</strong>. Please install and activate the %s theme first.",
                esc_html($parent),
                esc_html($parent)
            )
        );
    }
});

// Enqueue parent and child theme styles
add_action("wp_enqueue_scripts", function() {
    wp_enqueue_style(
        "astra-parent",
        get_template_directory_uri() . "/style.css",
        [],
        wp_get_theme("astra")->get("Version")
    );
    wp_enqueue_style(
        "winningtrimming-child",
        get_stylesheet_directory_uri() . "/style.css",
        ["astra-parent"],
        WT_CHILD_VERSION
    );
});

// Register Projects custom post type
add_action("init", function() {
    register_post_type("project", [
        "labels" => [
            "name"          => "Projects",
            "singular_name" => "Project",
            "add_new"       => "Add New Project",
            "add_new_item"  => "Add New Project",
            "edit_item"     => "Edit Project",
            "view_item"     => "View Project",
            "all_items"     => "All Projects",
        ],
        "public"        => true,
        "has_archive"   => true,
        "rewrite"       => ["slug" => "projects"],
        "supports"      => ["title", "editor", "thumbnail", "excerpt"],
        "menu_icon"     => "dashicons-portfolio",
        "menu_position" => 5,
        "show_in_rest"  => true,
        "taxonomies"    => ["category"],
    ]);
}, 10);

// Register Service Category taxonomy
add_action("init", function() {
    register_taxonomy("service_category", "project", [
        "labels" => [
            "name"          => "Service Categories",
            "singular_name" => "Service Category",
            "search_items"  => "Search Service Categories",
        ],
        "public"            => true,
        "show_admin_column" => true,
        "show_in_rest"      => true,
        "rewrite"           => ["slug" => "services"],
        "hierarchical"      => true,
    ]);
}, 11);

// Register Testimonials custom post type
add_action("init", function() {
    register_post_type("testimonial", [
        "labels" => [
            "name"          => "Testimonials",
            "singular_name" => "Testimonial",
            "add_new"       => "Add New Testimonial",
            "add_new_item"  => "Add New Testimonial",
            "edit_item"     => "Edit Testimonial",
        ],
        "public"        => false,
        "publicly_queryable" => false,
        "show_ui"       => true,
        "supports"      => ["title", "editor", "thumbnail"],
        "menu_icon"     => "dashicons-star-filled",
        "show_in_rest"  => true,
    ]);
});
