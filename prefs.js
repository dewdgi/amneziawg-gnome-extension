import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';

import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class AmneziaWGPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page and group
        const page = new Adw.PreferencesPage();
        const group = new Adw.PreferencesGroup({
            title: 'AmneziaWG Settings',
            description: 'Configure interface and appearance settings',
        });
        page.add(group);

        // Get settings
        const settings = this.getSettings();

        // Interface Name
        const interfaceRow = new Adw.EntryRow({
            title: 'Interface Name',
            text: settings.get_string('interface'),
        });
        interfaceRow.connect('changed', (entry) => {
            settings.set_string('interface', entry.get_text());
        });
        group.add(interfaceRow);

        // Icon Size
        const iconSizeRow = new Adw.SpinRow({
            title: 'Icon Size',
            subtitle: 'Size of the panel icon in pixels',
            adjustment: new Gtk.Adjustment({
                lower: 16,
                upper: 128,
                value: settings.get_int('icon-size'),
                step_increment: 1,
            }),
        });
        iconSizeRow.connect('notify::value', (spin) => {
            settings.set_int('icon-size', spin.get_value());
        });
        group.add(iconSizeRow);

        // Icon Theme
        const themeRow = new Adw.ComboRow({
            title: 'Icon Theme',
            subtitle: 'Choose light or dark icons for the panel',
            model: new Gtk.StringList({
                strings: ['Light', 'Dark'],
            }),
        });
        
        // Set current selection
        const currentTheme = settings.get_string('manual-theme');
        themeRow.set_selected(currentTheme === 'dark' ? 1 : 0);
        
        themeRow.connect('notify::selected', (combo) => {
            const theme = combo.get_selected() === 1 ? 'dark' : 'light';
            settings.set_string('manual-theme', theme);
        });
        group.add(themeRow);

        // Add the page to the window
        window.add(page);
    }
}
