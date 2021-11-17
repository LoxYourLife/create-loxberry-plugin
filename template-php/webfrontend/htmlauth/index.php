<?php
require_once "loxberry_web.php";

// This will read your language files to the array $L
$L = LBSystem::readlanguage("language.ini");

$template_title = "{{plugin.name.title}}";
$helplink = "http://www.loxwiki.eu:80/x/2wzL";
$helptemplate = "help.html";

// The Navigation Bar
$navbar[1]['Name'] = $L['COMMON.HELLO'];
$navbar[1]['URL'] = 'index.php';
 
// Activate the first element
$navbar[1]['active'] = True;
  
// Now output the header, it will include your navigation bar
LBWeb::lbheader($template_title, $helplink, $helptemplate);
 
// This is the main area for your plugin
?>
<h1><?=$L['COMMON.HELLO']?></h1>
 
<?php 
// Finally print the footer 
LBWeb::lbfooter();
?>