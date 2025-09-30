import GObject from 'gi://GObject';
import St from 'gi://St';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { GsettingsManager } from './gsettingsManager.js';

class ToggleAWG {
    constructor(gsettingsManager) {
        this._isActive = false;
        this.gsettingsManager = gsettingsManager;
    }

    _getIconPath(isActive) {
        const manualTheme = this.gsettingsManager.getValue('manual-theme');
        const iconType = manualTheme === 'dark' ? 'dark' : 'light';
        return `${this.gsettingsManager.getExtensionPath()}/icons/${isActive ? 'active-' : 'inactive-'}${iconType}.png`;
    }

    toggleService() {
        const iface = this.gsettingsManager.getValue('interface');
        if (!iface) {
            Main.notify('Toggle AWG', 'No interface set in settings!');
            return;
        }

        const action = this._isActive ? 'stop' : 'start';
        const command = ['pkexec', 'systemctl', action, `awg-quick@${iface}`];

        Util.spawn(command);
        this._isActive = !this._isActive;
    }
}

const ToggleAWGButton = GObject.registerClass(
class ToggleAWGButton extends PanelMenu.Button {
    _init(toggleAWG, gsettingsManager) {
        super._init(0.0, 'Toggle AWG Button');
        this.toggleAWG = toggleAWG;
        this.gsettingsManager = gsettingsManager;

        this._icon = this._createIcon(false);
        this.add_child(this._icon);

        this.connect('button-press-event', () => {
            this.toggleAWG.toggleService();
            this._updateIcon();
        });

        this.gsettingsManager.settings.connect('changed', () => this._updateIcon());
    }

    _createIcon(isActive) {
        return new St.Icon({
            gicon: Gio.icon_new_for_string(this.toggleAWG._getIconPath(isActive)),
            icon_size: this.gsettingsManager.getValue('icon-size'),
            style_class: 'system-status-icon',
        });
    }

    _updateIcon() {
        const isActive = this.toggleAWG._isActive;
        this._icon.gicon = Gio.icon_new_for_string(this.toggleAWG._getIconPath(isActive));
        this._icon.icon_size = this.gsettingsManager.getValue('icon-size');
    }
});

export default class AmneziaWGExtension extends Extension {
    enable() {
        this._gsettingsManager = new GsettingsManager();
        const toggleAWG = new ToggleAWG(this._gsettingsManager);
        this._button = new ToggleAWGButton(toggleAWG, this._gsettingsManager);
        Main.panel.addToStatusArea('toggle-awg-button', this._button);
    }

    disable() {
        if (this._button) {
            this._button.destroy();
            this._button = null;
        }
        if (this._gsettingsManager) {
            this._gsettingsManager = null;
        }
    }
}
