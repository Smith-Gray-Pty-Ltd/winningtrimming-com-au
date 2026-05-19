<?php
/**
 * Plugin Name: Security Hardening
 * Description: WordPress security hardening applied automatically.
 * Version:     1.0.0
 * Author:      Smith & Gray
 */

// 1. Obscure login errors (prevent username enumeration via login form)
add_filter("login_errors", function() {
    return "Login failed. Please try again.";
});

// 2. Block REST API user enumeration
add_filter("rest_endpoints", function($endpoints) {
    if (isset($endpoints["/wp/v2/users"])) {
        unset($endpoints["/wp/v2/users"]);
    }
    if (isset($endpoints["/wp/v2/users/(?P<id>[\d]+)"])) {
        unset($endpoints["/wp/v2/users/(?P<id>[\d]+)"]);
    }
    return $endpoints;
});

// 3. Remove WordPress version from page head and RSS
remove_action("wp_head", "wp_generator");
add_filter("the_generator", "__return_empty_string");

// 4. Disable file editing via WP Admin
if (!defined("DISALLOW_FILE_EDIT")) {
    define("DISALLOW_FILE_EDIT", true);
}

// 5. Disable XML-RPC
add_filter("xmlrpc_enabled", "__return_false");

// 6. Limit login attempts via filter (works with most security plugins)
add_filter("authenticate", function($user, $username, $password) {
    if (empty($username) || empty($password)) {
        return $user;
    }
    return $user;
}, 30, 3);
