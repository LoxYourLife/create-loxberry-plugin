#!/usr/bin/perl

# Einbinden der LoxBerry-Module
use CGI;
use LoxBerry::System;
use LoxBerry::Web;
  
# Wir initialisieren unser Template. Der Pfad zum Templateverzeichnis steht in der globalen Variable $lbptemplatedir.
# Mit associate verknüpfen wir die Plugin-Config %pcfg. Variablen aus der Config können direkt im Template verwendet werden,
# ohne diese extra zu initialisieren: <TMPL_VAR SECTION.NAME>
my $template = HTML::Template->new(
    filename => "$lbptemplatedir/index.html",
    global_vars => 1,
    loop_context_vars => 1,
    die_on_bad_params => 0
);
  
# Jetzt lassen wir uns die Sprachphrasen lesen. Ohne Pfadangabe wird im Ordner lang nach language_de.ini, language_en.ini usw. gesucht.
# Wir kümmern uns im Code nicht weiter darum, welche Sprache nun zu lesen wäre.
# Mit der Routine wird die Sprache direkt ins Template übernommen. Sollten wir trotzdem im Code eine brauchen, bekommen
# wir auch noch einen Hash zurück.
my %L = LoxBerry::Web::readlanguage($template, "language.ini");

our %navbar;
$navbar{10}{Name} = "{{plugin.name.title}}";
$navbar{10}{URL} = 'index.cgi';

# Die Version des Plugins wird direkt aus der Plugin-Datenbank gelesen.
my $version = LoxBerry::System::pluginversion();

# Wir Übergeben die Titelzeile (mit Versionsnummer), einen Link ins Wiki und das Hilfe-Template.
# Um die Sprache der Hilfe brauchen wir uns im Code nicht weiter zu kümmern.
my $plugintitle = "{{plugin.name.title}} " . $version;
my $helplink = "https://www.loxwiki.eu/x/S4ZYAg";
my $helptemplate = "help.html"; 
LoxBerry::Web::lbheader($plugintitle, $helplink, $helptemplate);

# Nun wird das Template ausgegeben.
print $template->output();
  
# Schlussendlich lassen wir noch den Footer ausgeben.
LoxBerry::Web::lbfooter();